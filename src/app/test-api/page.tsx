// /app/test-api/page.tsx
"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Button, 
  Group, 
  Stack, 
  TextInput, 
  Badge,
  Divider,
  List,
  Loader,
  Alert
} from '@mantine/core';
import { IconPlus, IconArchive, IconRestore, IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from "~/trpc/react";
import { AuthShowcase } from "../_components/AuthShowcase";

export default function ApiTestPage() {
  const [title, setTitle] = useState("My Test Course");
  const [courseIdToArchive, setCourseIdToArchive] = useState("");

  // tRPC hook to fetch all courses
  const getCourses = api.course.getAll.useQuery();

  // tRPC hook for the generate mutation
  const generateCourse = api.course.generate.useMutation({
    onSuccess: (data) => {
      console.log("✅ Course generated successfully:", data);
      notifications.show({
        title: 'Course Generated!',
        message: `"${data.title}" has been created successfully.`,
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 4000,
      });
      void getCourses.refetch(); // Refetch the course list after a new one is created
    },
    onError: (error) => {
      console.error("❌ Error generating course:", error.message);
      notifications.show({
        title: 'Generation Failed',
        message: error.message,
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 6000,
      });
    },
  });

  // tRPC hook for the archive mutation
  const archiveCourse = api.course.archive.useMutation({
    onSuccess: (data) => {
      console.log("✅ Course archived successfully:", data);
      notifications.show({
        title: 'Course Archived',
        message: `"${data.title}" moved to archives.`,
        color: 'blue',
        icon: <IconInfoCircle size={18} />,
        autoClose: 3000,
      });
      void getCourses.refetch(); // Refetch the course list
    },
    onError: (error) => {
      console.error("❌ Error archiving course:", error.message);
      notifications.show({
        title: 'Archive Failed',
        message: error.message,
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 5000,
      });
    },
  });

  // tRPC hook for the restore mutation
  const restoreCourse = api.course.restore.useMutation({
    onSuccess: (data) => {
      console.log("✅ Course restored successfully:", data);
      notifications.show({
        title: 'Course Restored',
        message: `"${data.title}" is now active again.`,
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 3000,
      });
      void getCourses.refetch(); // Refetch the course list
    },
    onError: (error) => {
      console.error("❌ Error restoring course:", error.message);
      notifications.show({
        title: 'Restore Failed',
        message: error.message,
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 5000,
      });
    },
  });

  return (
    <Container size="lg" py="xl">
      <AuthShowcase />
      
      <Stack gap="xl" mt="xl">
        <Title order={1} ta="center" mb="lg">
          🧪 API Test Laboratory
        </Title>

        <Alert color="blue" icon={<IconInfoCircle />}>
          This page allows you to test all course management APIs. Check the browser console for detailed API responses.
        </Alert>

        {/* Display Courses */}
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={2}>My Courses</Title>
            <Badge color="blue" variant="light">
              {getCourses.data?.length ?? 0} total
            </Badge>
          </Group>
          
          {getCourses.isLoading ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
              <Text>Loading courses...</Text>
            </Group>
          ) : (
            <Stack gap="sm">
              {getCourses.data?.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  No courses found. Create one below!
                </Text>
              ) : (
                <List spacing="xs">
                  {getCourses.data?.map((course) => (
                    <List.Item key={course.id}>
                      <Card withBorder padding="sm" radius="sm">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="sm">
                              <Text fw={500}>{course.title}</Text>
                              <Badge 
                                color={course.status === 'active' ? 'green' : 'gray'}
                                size="sm"
                                variant="light"
                              >
                                {course.status}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">
                              ID: {course.id}
                            </Text>
                          </Stack>
                          
                          <Group gap="xs">
                            {course.status === 'active' ? (
                              <Button
                                size="xs"
                                variant="light"
                                color="blue"
                                leftSection={<IconArchive size={14} />}
                                onClick={() => archiveCourse.mutate({ courseId: course.id })}
                                loading={archiveCourse.isPending}
                              >
                                Archive
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="light"
                                color="green"
                                leftSection={<IconRestore size={14} />}
                                onClick={() => restoreCourse.mutate({ courseId: course.id })}
                                loading={restoreCourse.isPending}
                              >
                                Restore
                              </Button>
                            )}
                          </Group>
                        </Group>
                      </Card>
                    </List.Item>
                  ))}
                </List>
              )}
            </Stack>
          )}
        </Card>

        <Divider />

        {/* Generate Course */}
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Title order={3} mb="md">Generate New Course</Title>
          <Stack gap="md">
            <TextInput
              label="Course Title"
              placeholder="Enter course title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={title.length > 0 && title.length < 3 ? 'Title must be at least 3 characters' : null}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => generateCourse.mutate({ title })}
              loading={generateCourse.isPending}
              disabled={title.length < 3}
              fullWidth
            >
              {generateCourse.isPending ? 'Generating...' : 'Generate Course'}
            </Button>
          </Stack>
        </Card>
        
        {/* Manual Archive Course */}
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Title order={3} mb="md">Manual Archive (by ID)</Title>
          <Stack gap="md">
            <TextInput
              label="Course ID"
              placeholder="Enter Course ID to archive..."
              value={courseIdToArchive}
              onChange={(e) => setCourseIdToArchive(e.target.value)}
            />
            <Button
              leftSection={<IconArchive size={16} />}
              color="blue"
              onClick={() => archiveCourse.mutate({ courseId: courseIdToArchive })}
              loading={archiveCourse.isPending}
              disabled={!courseIdToArchive.trim()}
              fullWidth
            >
              {archiveCourse.isPending ? 'Archiving...' : 'Archive Course'}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}