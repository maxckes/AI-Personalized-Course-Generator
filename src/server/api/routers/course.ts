// /server/api/routers/course.ts

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import {
  generateCourseSkeleton,
  generateReadingContent,
  generateQuizContent,
  getVideoContentPlaceholder,
} from "../ai/ai";

export const courseRouter = createTRPCRouter({
    /**
     * Fetches all courses created by the currently logged-in user.
     * This is a protected procedure, ensuring only authenticated users can access it.
     */
    getAll: protectedProcedure.query(({ ctx }) => {
      // ctx.prisma allows us to access the database.
      // ctx.session.user.id gives us the ID of the logged-in user.
      return ctx.db.course.findMany({
        where: {
          authorId: ctx.session.user.id,
        },
        orderBy: {
          id: "desc", // Optional: show newest courses first
        },
      });
    }),
  
    /**
     * Archives a specific course.
     * Takes a courseId as input to identify which course to update.
     */
    archive: protectedProcedure
      .input(z.object({ courseId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.course.update({
          where: {
            id: input.courseId,
            // Security check: ensure the user owns this course
            authorId: ctx.session.user.id, 
          },
          data: {
            status: "archived",
          },
        });
      }),

    /**
     * Restores an archived course back to active status.
     * Includes logic to enforce the 2-course limit for active courses.
     */
    restore: protectedProcedure
      .input(z.object({ courseId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // 1. Count existing active courses for the user
        const activeCourseCount = await ctx.db.course.count({
          where: {
            authorId: ctx.session.user.id,
            status: "active",
          },
        });

        // 2. Enforce the 2-course limit for active courses
        if (activeCourseCount >= 2) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have 2 active courses. Please archive one first to restore this course.",
          });
        }

        // 3. Restore the course
        return ctx.db.course.update({
          where: {
            id: input.courseId,
            // Security check: ensure the user owns this course
            authorId: ctx.session.user.id,
          },
          data: {
            status: "active",
          },
        });
      }),
  
    /**
     * Generates a new placeholder course.
     * Includes the core logic to limit users to 2 courses.
     */
    generate: protectedProcedure
      .input(
        z.object({
          title: z.string().min(3, "Title must be at least 3 characters long"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 1. Count existing courses for the user
        const courseCount = await ctx.db.course.count({
          where: {
            authorId: ctx.session.user.id,
          },
        });
  
        // 2. Enforce the 2-course limit
        if (courseCount >= 2) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have reached the maximum of 2 courses. Please archive one to create a new one.",
          });
        }
                try{
          const skeleton = await generateCourseSkeleton(input.title);
          
          // Generate all AI content upfront, outside the database transaction
          const enrichedSkeleton = await Promise.all(
            skeleton.weeks.map(async (week) => ({
              ...week,
              modules: await Promise.all(
                week.modules.map(async (moduleItem) => {
                  let content = {};
                  // Generate content based on the module's content type
                  if (moduleItem.contentType === "READING") {
                    content = await generateReadingContent(moduleItem.title);
                  } else if (moduleItem.contentType === "QUIZ") {
                    content = await generateQuizContent(moduleItem.title);
                  } else if (moduleItem.contentType === "VIDEO") {
                    content = getVideoContentPlaceholder(moduleItem.title);
                  }
                  return {
                    ...moduleItem,
                    content,
                  };
                })
              ),
            }))
          );

          // Now perform all database operations in a fast transaction
          const newCourse = await ctx.db.$transaction(async (prisma) => {
            // Create the main course entry
            const course = await prisma.course.create({
              data: {
                authorId: ctx.session.user.id,
                title: skeleton.title,
                description: skeleton.description,
              },
            });

            // Loop through the weeks from the AI-generated skeleton
            for (const week of enrichedSkeleton) {
              const createdWeek = await prisma.week.create({
                data: {
                  courseId: course.id,
                  weekNumber: week.weekNumber,
                  title: week.title,
                },
              });

              // Loop through the modules for each week
              for (const moduleData of week.modules) {
                // Create the module with its pre-generated content
                await prisma.module.create({
                  data: {
                    weekId: createdWeek.id,
                    title: moduleData.title,
                    contentType: moduleData.contentType,
                    order: week.modules.indexOf(moduleData),
                    content: moduleData.content,
                  },
                });
              }
            }
            return course; // Return the newly created course
          });
          return newCourse;
        } catch (error) {
          console.error(error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate course skeleton",
          });
        }

        // 3. If the limit is not reached, create a new placeholder course
        // const newCourse = await ctx.db.course.create({
        //   data: {
        //     authorId: ctx.session.user.id,
        //     title: input.title,
        //     description: "This is a placeholder description. AI content will be added soon.",
        //   },
        // });
  
        // return newCourse;
      }),

    /**
     * Fetches a single course with its weeks and modules for the learning interface.
     * Includes user progress for each module.
     */
    getById: protectedProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ ctx, input }) => {
        const course = await ctx.db.course.findFirst({
          where: {
            id: input.courseId,
            authorId: ctx.session.user.id, // Security: only allow access to user's own courses
          },
          include: {
            weeks: {
              orderBy: {
                weekNumber: 'asc',
              },
              include: {
                modules: {
                  orderBy: {
                    order: 'asc',
                  },
                  include: {
                    progress: {
                      where: {
                        userId: ctx.session.user.id,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!course) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found or you don't have access to it.",
          });
        }

        return course;
      }),

    /**
     * Permanently deletes a course and all associated data.
     * This is a destructive action that cannot be undone.
     */
    delete: protectedProcedure
      .input(z.object({ courseId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // First verify the course exists and belongs to the user
        const course = await ctx.db.course.findFirst({
          where: {
            id: input.courseId,
            authorId: ctx.session.user.id,
          },
        });

        if (!course) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found or you don't have access to it.",
          });
        }

        // Delete the course and all related data in proper order
        await ctx.db.$transaction(async (prisma) => {
          // First, delete all user progress records for modules in this course
          await prisma.userProgress.deleteMany({
            where: {
              module: {
                week: {
                  courseId: input.courseId,
                },
              },
            },
          });

          // Then delete the course (cascade will handle weeks and modules)
          await prisma.course.delete({
            where: {
              id: input.courseId,
              authorId: ctx.session.user.id, // Extra security check
            },
          });
        });

        return { 
          success: true, 
          message: `Course "${course.title}" has been permanently deleted.`,
          title: course.title 
        };
      }),

    /**
     * Updates progress for a specific module.
     */
    updateProgress: protectedProcedure
      .input(z.object({ 
        moduleId: z.string(),
        isCompleted: z.boolean() 
      }))
      .mutation(async ({ ctx, input }) => {
        // First verify the module belongs to one of the user's courses
        const moduleRecord = await ctx.db.module.findFirst({
          where: {
            id: input.moduleId,
            week: {
              course: {
                authorId: ctx.session.user.id,
              },
            },
          },
        });

        if (!moduleRecord) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Module not found or you don't have access to it.",
          });
        }

        // Use upsert to either create or update progress
        return ctx.db.userProgress.upsert({
          where: {
            userId_moduleId: {
              userId: ctx.session.user.id,
              moduleId: input.moduleId,
            },
          },
          update: {
            isCompleted: input.isCompleted,
          },
          create: {
            userId: ctx.session.user.id,
            moduleId: input.moduleId,
            isCompleted: input.isCompleted,
          },
        });
      }),
  });