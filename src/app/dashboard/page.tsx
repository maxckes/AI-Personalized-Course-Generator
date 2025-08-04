"use client";

import { 
  Container, 
  Title, 
  Grid, 
  Card, 
  Text, 
  Button, 
  Group, 
  Badge, 
  Loader,
  Stack,
  Modal,
  TextInput,
  Tabs,
  useMantineColorScheme
} from '@mantine/core';
import { IconPlus, IconArchive, IconBook, IconRestore, IconExclamationMark, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconExclamationMark as IconWarning } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

import { api } from "~/trpc/react";
import { Layout } from "~/components/Layout";
import Link from 'next/link';

export default function Dashboard() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [opened, { open, close }] = useDisclosure(false);
  const [limitModalOpened, { open: openLimitModal, close: closeLimitModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('active');
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  
  // Track loading states for individual items
  const [loadingStates, setLoadingStates] = useState<{
    archiving: string[];
    restoring: string[];
    deleting: string[];
  }>({
    archiving: [],
    restoring: [],
    deleting: []
  });

  // Get the utils to invalidate cache
  const utils = api.useUtils();

  // Fetch all courses for the user
  const { data: courses, isLoading } = api.course.getAll.useQuery();

  // Create course mutation
  const createCourse = api.course.generate.useMutation({
    onSuccess: async (data) => {
      // Invalidate the courses list to refresh the data
      await utils.course.getAll.invalidate();
      
      notifications.show({
        title: 'Course Created Successfully! 🎉',
        message: `"${data.title}" is ready for learning.`,
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 4000,
        withCloseButton: true,
      });
      setCourseTitle('');
      close();
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        close(); // Close the create modal first
        openLimitModal(); // Then open the limit modal
        notifications.show({
          title: 'Course Limit Reached',
          message: 'You have reached the maximum of 2 active courses.',
          color: 'orange',
          icon: <IconWarning size={18} />,
          autoClose: 7000,
        });
      } else {
        notifications.show({
          title: 'Failed to Create Course',
          message: error.message || 'An unexpected error occurred while creating the course.',
          color: 'red',
          icon: <IconX size={18} />,
          autoClose: 8000,
        });
      }
    },
  });

  // Archive course mutation  
  const archiveCourse = api.course.archive.useMutation({
    onMutate: (variables) => {
      // Add to archiving state
      setLoadingStates(prev => ({
        ...prev,
        archiving: [...prev.archiving, variables.courseId]
      }));
    },
    onSuccess: async (data) => {
      // Invalidate the courses list to refresh the data
      await utils.course.getAll.invalidate();
      
      notifications.show({
        title: 'Course Archived 📦',
        message: `"${data.title}" has been moved to your archived courses.`,
        color: 'blue',
        icon: <IconInfoCircle size={18} />,
        autoClose: 3000,
        withCloseButton: true,
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Archive Course',
        message: error.message || 'Unable to archive the course. Please try again.',
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 6000,
      });
    },
    onSettled: (data, error, variables) => {
      // Remove from archiving state
      setLoadingStates(prev => ({
        ...prev,
        archiving: prev.archiving.filter(id => id !== variables.courseId)
      }));
    },
  });

  // Restore course mutation
  const restoreCourse = api.course.restore.useMutation({
    onMutate: (variables) => {
      // Add to restoring state
      setLoadingStates(prev => ({
        ...prev,
        restoring: [...prev.restoring, variables.courseId]
      }));
    },
    onSuccess: async (data) => {
      // Invalidate the courses list to refresh the data
      await utils.course.getAll.invalidate();
      
      notifications.show({
        title: 'Course Restored Successfully! 🎉',
        message: `"${data.title}" is now active and ready for learning.`,
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 4000,
        withCloseButton: true,
      });
      // Auto-switch to active tab to show the restored course
      setActiveTab('active');
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        openLimitModal(); // Show the limit modal for restore conflicts too
        notifications.show({
          title: 'Cannot Restore Course',
          message: 'You already have 2 active courses. Archive one first to restore this course.',
          color: 'orange',
          icon: <IconWarning size={18} />,
          autoClose: 8000,
        });
      } else {
        notifications.show({
          title: 'Failed to Restore Course',
          message: error.message || 'Unable to restore the course. Please try again.',
          color: 'red',
          icon: <IconX size={18} />,
          autoClose: 6000,
        });
      }
    },
    onSettled: (data, error, variables) => {
      // Remove from restoring state
      setLoadingStates(prev => ({
        ...prev,
        restoring: prev.restoring.filter(id => id !== variables.courseId)
      }));
    },
  });

  // Delete course mutation
  const deleteCourse = api.course.delete.useMutation({
    onMutate: (variables) => {
      // Add to deleting state
      setLoadingStates(prev => ({
        ...prev,
        deleting: [...prev.deleting, variables.courseId]
      }));
    },
    onSuccess: async (data) => {
      // Invalidate the courses list to refresh the data
      await utils.course.getAll.invalidate();
      
      notifications.show({
        title: 'Course Deleted Successfully! 🗑️',
        message: data.message,
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 4000,
        withCloseButton: true,
      });
      closeDeleteModal();
      setCourseToDelete(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Delete Course',
        message: error.message || 'Unable to delete the course. Please try again.',
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 6000,
      });
    },
    onSettled: (data, error, variables) => {
      // Remove from deleting state
      setLoadingStates(prev => ({
        ...prev,
        deleting: prev.deleting.filter(id => id !== variables.courseId)
      }));
    },
  });

  const handleCreateCourse = () => {
    if (!courseTitle.trim()) return;
    createCourse.mutate({ title: courseTitle });
  };

  const handleArchiveCourse = (courseId: string) => {
    archiveCourse.mutate({ courseId });
  };

  const handleRestoreCourse = (courseId: string) => {
    restoreCourse.mutate({ courseId });
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle });
    openDeleteModal();
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      deleteCourse.mutate({ courseId: courseToDelete.id });
    }
  };

  // Filter courses based on active tab
  const filteredCourses = courses?.filter(course => 
    activeTab === 'active' ? course.status === 'active' : course.status === 'archived'
  ) ?? [];

  const activeCourseCount = courses?.filter(course => course.status === 'active').length ?? 0;

  return (
    <Layout>
      <Container size="xl" style={{
        backgroundColor: mounted ? (isDark ? 'transparent' : 'transparent') : 'transparent',
        minHeight: '100vh'
      }}>
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1} c={mounted ? (isDark ? 'white' : 'dark') : 'dark'}>My Courses</Title>
            <Text c={mounted ? (isDark ? 'gray.4' : 'dimmed') : 'dimmed'}>
              {activeCourseCount}/2 active courses
            </Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={open}
            disabled={activeCourseCount >= 2}
            color="blue"
            variant="filled"
          >
            Create New Course
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl" styles={{
          tab: {
            color: mounted ? (isDark ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-7)') : 'var(--mantine-color-gray-7)',
            "&[data-active]": {
              color: mounted ? (isDark ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-blue-6)') : 'var(--mantine-color-blue-6)',
              borderBottomColor: mounted ? (isDark ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-blue-6)') : 'var(--mantine-color-blue-6)',
            }
          }
        }}>
          <Tabs.List>
            <Tabs.Tab value="active">
              Active Courses ({courses?.filter(c => c.status === 'active').length ?? 0})
            </Tabs.Tab>
            <Tabs.Tab value="archived">
              Archived Courses ({courses?.filter(c => c.status === 'archived').length ?? 0})
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {isLoading ? (
          <Stack align="center" py="xl">
            <Loader size="lg" color={mounted ? (isDark ? 'blue.4' : 'blue') : 'blue'} />
            <Text c={mounted ? (isDark ? 'gray.3' : 'dark') : 'dark'}>Loading your courses...</Text>
          </Stack>
        ) : filteredCourses?.length === 0 ? (
          <Card withBorder p="xl" radius="md" style={{
            background: mounted ? (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)') : 'var(--mantine-color-white)',
            borderColor: mounted ? (isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)') : 'var(--mantine-color-gray-3)'
          }}>
            <Stack align="center" gap="md">
              <IconBook size={48} color={mounted ? (isDark ? 'var(--mantine-color-gray-6)' : 'var(--mantine-color-gray-5)') : 'var(--mantine-color-gray-5)'} />
              <Text size="lg" fw={500} c={mounted ? (isDark ? 'white' : 'dark') : 'dark'}>
                {activeTab === 'active' ? 'No active courses' : 'No archived courses'}
              </Text>
              <Text c={mounted ? (isDark ? 'gray.4' : 'dimmed') : 'dimmed'} ta="center">
                {activeTab === 'active' 
                  ? 'Get started by creating your first AI-generated course. You can create up to 2 active courses.'
                  : 'Archived courses will appear here when you archive them.'
                }
              </Text>
              {activeTab === 'active' && (
                <Button 
                  leftSection={<IconPlus size={16} />}
                  onClick={open}
                  color="blue"
                  variant="filled"
                >
                  Create Your First Course
                </Button>
              )}
            </Stack>
          </Card>
        ) : (
          <Grid>
            {filteredCourses?.map((course) => (
              <Grid.Col key={course.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card 
                  withBorder 
                  shadow="md" 
                  p="xl" 
                  radius="lg" 
                  h="100%"
                  style={{
                    transition: 'all 0.3s ease',
                    background: mounted ? (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)') : 'var(--mantine-color-white)',
                    borderColor: mounted ? (isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)') : 'var(--mantine-color-gray-3)'
                  }}
                  className="course-card card-hover"
                >
                  <Stack justify="space-between" h="100%">
                    <div>
                      <Group justify="space-between" mb="md" align="flex-start">
                        <Title 
                          order={3} 
                          fw={700} 
                          size="1.25rem"
                          c={mounted ? (isDark ? 'white' : 'dark') : 'dark'}
                          style={{ lineHeight: 1.3 }}
                        >
                          {course.title}
                        </Title>
                        <Badge 
                          size="lg"
                          color={course.status === 'archived' ? 'gray' : 'blue'}
                          variant="filled"
                          style={{
                            background: mounted ? (course.status === 'archived' 
                              ? (isDark 
                                  ? 'linear-gradient(135deg, var(--mantine-color-gray-7) 0%, var(--mantine-color-gray-5) 100%)'
                                  : 'linear-gradient(135deg, var(--mantine-color-gray-6) 0%, var(--mantine-color-gray-4) 100%)')
                              : 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-4) 100%)'
                            ) : (course.status === 'archived' 
                              ? 'linear-gradient(135deg, var(--mantine-color-gray-6) 0%, var(--mantine-color-gray-4) 100%)'
                              : 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-4) 100%)')
                          }}
                        >
                          {course.status === 'archived' ? '📦 Archived' : '🎓 Active'}
                        </Badge>
                      </Group>
                      
                      <Text 
                        size="md" 
                        c={mounted ? (isDark ? 'gray.4' : 'dimmed') : 'dimmed'} 
                        mb="lg"
                        style={{ lineHeight: 1.6 }}
                      >
                        {course.description ?? 'An engaging course designed to help you master new skills and advance your knowledge.'}
                      </Text>
                    </div>

                    <Stack gap="md">
                      <Button 
                        component={Link}
                        href={`/course/${course.id}`}
                        size="lg"
                        fullWidth
                        leftSection={<IconBook size={20} />}
                        color="blue"
                        variant="filled"
                      >
                        {course.status === 'archived' ? 'View Course' : 'Continue Learning'}
                      </Button>
                      
                      <Group grow>
                        {activeTab === 'active' ? (
                          <Button
                            variant="light"
                            color="orange"
                            size="md"
                            leftSection={<IconArchive size={16} />}
                            onClick={() => handleArchiveCourse(course.id)}
                            loading={loadingStates.archiving.includes(course.id)}
                            disabled={loadingStates.archiving.includes(course.id)}
                            style={{ fontWeight: 500 }}
                          >
                            {loadingStates.archiving.includes(course.id) ? 'Archiving...' : 'Archive'}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="light"
                              color="green"
                              size="md"
                              leftSection={<IconRestore size={16} />}
                              onClick={() => handleRestoreCourse(course.id)}
                              loading={loadingStates.restoring.includes(course.id)}
                              disabled={loadingStates.restoring.includes(course.id) || loadingStates.deleting.includes(course.id)}
                              style={{ fontWeight: 500 }}
                            >
                              {loadingStates.restoring.includes(course.id) ? 'Restoring...' : 'Restore'}
                            </Button>
                            <Button
                              variant="light"
                              color="red"
                              size="md"
                              leftSection={<IconTrash size={16} />}
                              onClick={() => handleDeleteCourse(course.id, course.title)}
                              loading={loadingStates.deleting.includes(course.id)}
                              disabled={loadingStates.deleting.includes(course.id) || loadingStates.restoring.includes(course.id)}
                              style={{ fontWeight: 500 }}
                            >
                              {loadingStates.deleting.includes(course.id) ? 'Deleting...' : 'Delete'}
                            </Button>
                          </>
                        )}
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Create Course Modal */}
        <Modal opened={opened} onClose={close} title="Create New Course">
          <Stack>
            <TextInput
              label="Course Title"
              placeholder="Enter course title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              error={courseTitle.length > 0 && courseTitle.length < 3 ? 'Title must be at least 3 characters' : null}
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCourse}
                loading={createCourse.isPending}
                disabled={courseTitle.length < 3}
              >
                Create Course
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Course Limit Modal */}
        <Modal 
          opened={limitModalOpened} 
          onClose={closeLimitModal} 
          title="Course Limit Reached"
          centered
        >
          <Stack align="center" gap="md">
            <IconExclamationMark size={48} color="var(--mantine-color-orange-6)" />
            <Text size="lg" fw={500} ta="center">
              Maximum Course Limit Reached
            </Text>
            <Text c="dimmed" ta="center">
              You have reached the maximum of 2 active courses. To create a new course, 
              please archive one of your existing courses first.
            </Text>
            <Group>
              <Button variant="subtle" onClick={closeLimitModal}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  closeLimitModal();
                  setActiveTab('active'); // Switch to active tab to show courses
                }}
              >
                View My Courses
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          opened={deleteModalOpened} 
          onClose={closeDeleteModal} 
          title="Delete Course"
          centered
        >
          <Stack align="center" gap="md">
            <IconTrash size={48} color="var(--mantine-color-red-6)" />
            <Text size="lg" fw={500} ta="center">
              Are you sure you want to delete this course?
            </Text>
            <Text c="dimmed" ta="center">
              <Text component="span" fw={500}>&ldquo;{courseToDelete?.title}&rdquo;</Text> will be permanently deleted. 
              This action cannot be undone and all course content, modules, and progress will be lost.
            </Text>
            <Group>
              <Button variant="subtle" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button 
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={confirmDeleteCourse}
                loading={deleteCourse.isPending}
              >
                Delete Course
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </Layout>
  );
}