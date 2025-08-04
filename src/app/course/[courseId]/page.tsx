"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  AppShell,
  Container,
  Title,
  Text,
  Loader,
  Stack,
  Group,
  Badge,
  Accordion,
  Button,
  Progress,
  Card,
  Alert,
  Breadcrumbs,
  Anchor,
  ActionIcon,
  Avatar,
  Menu,
  Tooltip,
  ScrollArea,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconBook, 
  IconCheck, 
  IconPlayerPlay, 
  IconFileText, 
  IconQuestionMark,
  IconArrowLeft,
  IconClock,
  IconTrophy,
  IconUser,
  IconLogout,
  IconFlask
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

import { api } from "~/trpc/react";
import { ContentRenderer } from "~/components/ContentRenderer";

// Define proper TypeScript interfaces for the data structure
interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  isCompleted: boolean;
}

interface ModuleData {
  id: string;
  title: string;
  contentType: 'READING' | 'VIDEO' | 'QUIZ';
  content: Record<string, unknown>;
  order: number;
  progress: UserProgress[];
}

interface WeekData {
  id: string;
  title: string;
  weekNumber: number;
  modules: ModuleData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  weeks: WeekData[];
}

export default function CoursePage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { data: session } = useSession();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Add state
  const [pendingModules, setPendingModules] = useState<string[]>([]);

  // Fetch course data with weeks and modules
  const { data: course, isLoading, error } = api.course.getById.useQuery(
    { courseId },
    { enabled: !!courseId }
  );
  
  // Type guard to ensure course has the expected structure
  const typedCourse = course as CourseData | undefined;

  // Get the utils to invalidate cache
  const utils = api.useUtils();

  // Update progress mutation with cache invalidation
  const updateProgress = api.course.updateProgress.useMutation({
    onMutate: (variables) => {
      setPendingModules(prev => [...prev, variables.moduleId]);
    },
    onSuccess: async () => {
      // Invalidate the course query to refresh the data
      await utils.course.getById.invalidate({ courseId });
      
      notifications.show({
        title: 'Progress Updated',
        message: 'Your progress has been saved.',
        color: 'green',
        icon: <IconCheck size={18} />,
        autoClose: 2000,
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Update Progress',
        message: error.message,
        color: 'red',
        autoClose: 5000,
      });
    },
    onSettled: (data, error, variables) => {
      setPendingModules(prev => prev.filter(id => id !== variables.moduleId));
    },
  });

  // Handle module completion toggle
  const handleProgressToggle = (moduleId: string, currentStatus: boolean) => {
    updateProgress.mutate({
      moduleId,
      isCompleted: !currentStatus,
    });
  };

  // Get selected module
  const selectedModule = typedCourse?.weeks
    .flatMap(week => week.modules)
    .find(module => module.id === selectedModuleId);

  // Calculate course progress
  const totalModules = typedCourse?.weeks.reduce((acc, week) => acc + week.modules.length, 0) ?? 0;
  const completedModules = typedCourse?.weeks
    .flatMap(week => week.modules)
    .filter(module => module.progress[0]?.isCompleted).length ?? 0;
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  // Auto-select first module if none selected
  React.useEffect(() => {
    if (typedCourse?.weeks[0]?.modules[0] && !selectedModuleId) {
      setSelectedModuleId(typedCourse.weeks[0].modules[0].id);
    }
  }, [typedCourse, selectedModuleId]);

  if (isLoading) {
    return (
      <AppShell>
        <AppShell.Main>
          <Container size="xl" py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading course...</Text>
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    );
  }

  if (error || !typedCourse) {
    return (
      <AppShell>
        <AppShell.Main>
          <Container size="sm" py="xl">
            <Alert color="red" title="Course Not Found">
              {(error as { message?: string })?.message ?? "The course you're looking for doesn't exist or you don't have access to it."}
            </Alert>
            <Group justify="center" mt="xl">
              <Button component={Link} href="/dashboard" leftSection={<IconArrowLeft size={16} />}>
                Back to Dashboard
              </Button>
            </Group>
          </Container>
        </AppShell.Main>
      </AppShell>
    );
  }

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'READING':
        return <IconFileText size={16} />;
      case 'VIDEO':
        return <IconPlayerPlay size={16} />;
      case 'QUIZ':
        return <IconQuestionMark size={16} />;
      default:
        return <IconBook size={16} />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'READING':
        return 'blue';
      case 'VIDEO':
        return 'red';
      case 'QUIZ':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 350, breakpoint: 'md', collapsed: { mobile: true } }}
      padding={0}
    >
      {/* Header */}
      <AppShell.Header style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)',
        borderBottom: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid var(--mantine-color-gray-3)'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <IconBook size={28} color={isDark ? '#5c7cfa' : '#1c7ed6'} />
            <Title order={2} c={isDark ? 'blue.4' : 'blue'}>Pathfinder</Title>
          </Group>
          
          {session && (
            <Group gap="sm">
              <Tooltip label="API Test Lab">
                <ActionIcon
                  component={Link}
                  href="/test-api"
                  variant="subtle"
                  color="gray"
                  size="md"
                >
                  <IconFlask size={18} />
                </ActionIcon>
              </Tooltip>
              
              <Menu trigger="hover" openDelay={100} closeDelay={400}>
                <Menu.Target>
                  <Group style={{ cursor: 'pointer' }}>
                    <Avatar 
                      src={session.user?.image} 
                      alt={session.user?.name ?? 'User'} 
                      size="sm" 
                    />
                    <Text size="sm" c={isDark ? 'white' : 'dark'}>{session.user?.name}</Text>
                  </Group>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconUser size={16} />}>
                    Profile
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    leftSection={<IconLogout size={16} />}
                    onClick={() => {
                      notifications.show({
                        title: 'Signed Out',
                        message: 'You have been successfully signed out.',
                        color: 'blue',
                        autoClose: 3000,
                      });
                      void signOut();
                    }}
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {/* Left Sidebar - Course Navigation */}
      <AppShell.Navbar p="md" withBorder style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        borderRight: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid var(--mantine-color-gray-3)'
      }}>
        <ScrollArea style={{ height: 'calc(100vh - 140px)' }}>
          <Stack gap="md">
            {/* Course Header */}
            <Stack gap="xs">
              <Breadcrumbs>
                <Anchor component={Link} href="/dashboard" size="sm" c={isDark ? 'blue.4' : 'blue'}>
                  Courses
                </Anchor>
                <Text size="sm" c={isDark ? 'gray.4' : 'dimmed'}>{typedCourse.title}</Text>
              </Breadcrumbs>
              
              <Title order={3} lineClamp={2} c={isDark ? 'white' : 'dark'}>
                {typedCourse.title}
              </Title>
              
              {typedCourse.description && (
                <Text size="sm" c={isDark ? 'gray.4' : 'dimmed'} lineClamp={3}>
                  {typedCourse.description}
                </Text>
              )}
            </Stack>

            {/* Progress Overview */}
            <Card withBorder padding="sm" radius="md" style={{
              backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-white)',
              borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
            }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500} c={isDark ? 'white' : 'dark'}>Course Progress</Text>
                  <Badge 
                    color={progressPercentage === 100 ? 'green' : 'blue'} 
                    variant="light"
                    leftSection={progressPercentage === 100 ? <IconTrophy size={12} /> : <IconClock size={12} />}
                  >
                    {Math.round(progressPercentage)}%
                  </Badge>
                </Group>
                <Progress value={progressPercentage} size="sm" />
                <Text size="xs" c={isDark ? 'gray.5' : 'dimmed'}>
                  {completedModules} of {totalModules} modules completed
                </Text>
              </Stack>
            </Card>

            {/* Week/Module Navigation */}
            <Accordion 
              variant="separated" 
              defaultValue={typedCourse.weeks[0]?.id}
              styles={{
                item: { border: '1px solid var(--mantine-color-gray-3)' },
                control: { padding: '12px' },
              }}
            >
              {typedCourse.weeks.map((week: WeekData) => (
                <Accordion.Item key={week.id} value={week.id}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={500} size="sm" c={isDark ? 'white' : 'dark'}>
                          Week {week.weekNumber}: {week.title}
                        </Text>
                        <Text size="xs" c={isDark ? 'gray.5' : 'dimmed'}>
                          {week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length} / {week.modules.length} completed
                        </Text>
                      </Stack>
                    </Group>
                  </Accordion.Control>
                  
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {week.modules.map((module: ModuleData) => {
                        const isCompleted = module.progress[0]?.isCompleted ?? false;
                        const isSelected = selectedModuleId === module.id;
                        
                        return (
                          <Card
                            key={module.id}
                            padding="sm"
                            radius="sm"
                            withBorder={isSelected}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected 
                                ? (isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-blue-1)')
                                : undefined,
                              borderColor: isSelected 
                                ? (isDark ? 'var(--mantine-color-blue-8)' : 'var(--mantine-color-blue-5)')
                                : undefined,
                            }}
                            onClick={() => setSelectedModuleId(module.id)}
                          >
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                {getModuleIcon(module.contentType)}
                                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                  <Text size="sm" fw={isSelected ? 500 : 400} lineClamp={2} c={isDark ? (isSelected ? 'blue.3' : 'gray.3') : (isSelected ? 'blue.7' : 'dark')}>
                                    {module.title}
                                  </Text>
                                  <Badge 
                                    size="xs" 
                                    color={getContentTypeColor(module.contentType)}
                                    variant="light"
                                  >
                                    {module.contentType.toLowerCase()}
                                  </Badge>
                                </Stack>
                              </Group>
                              
                              <Button
                                size="xs"
                                variant={isCompleted ? "filled" : "outline"}
                                color={isCompleted ? "green" : (isDark ? "gray.4" : "gray.7")}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProgressToggle(module.id, isCompleted);
                                }}
                                loading={pendingModules.includes(module.id)}
                              >
                                {isCompleted ? <IconCheck size={14} /> : "Mark Complete"}
                              </Button>
                            </Group>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Content Area */}
      <AppShell.Main style={{
        backgroundColor: isDark ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-0)',
        minHeight: '100vh'
      }}>
        <ScrollArea style={{ height: 'calc(100vh - 70px)' }}>
          <Container size="xl" py="md">
            {selectedModule ? (
              <ContentRenderer 
                module={selectedModule}
                onComplete={(isCompleted) => handleProgressToggle(selectedModule.id, !isCompleted)}
                isCompleted={selectedModule.progress[0]?.isCompleted ?? false}
              />
            ) : (
              <Stack align="center" justify="center" h="50vh">
                <IconBook size={64} color={isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-5)'} />
                <Title order={3} c={isDark ? 'gray.3' : 'dimmed'}>
                  Select a Module to Begin
                </Title>
                <Text c={isDark ? 'gray.4' : 'dimmed'} ta="center" maw={400}>
                  Choose a module from the sidebar to start learning. Your progress will be automatically saved as you complete each section.
                </Text>
              </Stack>
            )}
          </Container>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}