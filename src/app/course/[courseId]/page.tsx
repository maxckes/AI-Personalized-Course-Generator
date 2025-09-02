"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Layout,
  Typography,
  Spin,
  Space,
  Badge as AntBadge,
  Collapse,
  Button,
  Progress,
  Card,
  Alert,
  Breadcrumb,
  Avatar,
  Dropdown,
  Tooltip,
  message
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  LogoutOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Header, Sider, Content } = Layout;
const { Panel } = Collapse;

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
  const [isDark] = useState(false); // For now, keeping it simple

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

      message.success('Progress Updated - Your progress has been saved.');
    },
    onError: (error) => {
      message.error(`Failed to Update Progress: ${error.message}`);
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
      <Layout>
        <Content style={{ padding: '48px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading course...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (error || !typedCourse) {
    return (
      <Layout>
        <Content style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          <Alert
            message="Course Not Found"
            description={(error as { message?: string })?.message ?? "The course you're looking for doesn't exist or you don't have access to it."}
            type="error"
            showIcon
          />
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              <Link href="/dashboard" style={{ color: 'inherit' }}>Back to Dashboard</Link>
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'READING':
        return <FileTextOutlined />;
      case 'VIDEO':
        return <PlayCircleOutlined />;
      case 'QUIZ':
        return <QuestionCircleOutlined />;
      default:
        return <BookOutlined />;
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
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{
        background: isDark ? '#1a1a1a' : '#ffffff',
        borderBottom: isDark ? '1px solid #404040' : '1px solid #d9d9d9',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space>
          <BookOutlined style={{ fontSize: '28px', color: isDark ? '#5c7cfa' : '#1c7ed6' }} />
          <Title level={3} style={{ color: isDark ? '#5c7cfa' : '#1c7ed6', margin: 0 }}>Course.AI</Title>
        </Space>

        {session && (
          <Space>
            <Tooltip title="API Test Lab">
              <Button
                type="text"
                icon={<ExperimentOutlined />}
                onClick={() => window.location.href = '/test-api'}
              />
            </Tooltip>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Profile',
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Sign out',
                    onClick: () => {
                      message.success('Signed out successfully');
                      void signOut();
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={session.user?.image}
                  alt={session.user?.name ?? 'User'}
                  size="small"
                />
                <Text style={{ color: isDark ? 'white' : 'black' }}>{session.user?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        )}
      </Header>

      {/* Left Sidebar - Course Navigation */}
      <Sider
        width={350}
        style={{
          background: isDark ? '#1a1a1a' : '#fafafa',
          borderRight: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
        breakpoint="md"
        collapsedWidth={0}
      >
        <div style={{ padding: '16px', height: 'calc(100vh - 70px)', overflow: 'auto' }}>
          <Space direction="vertical" size="middle">
            {/* Course Header */}
            <Space direction="vertical" size="small">
              <Breadcrumb
                items={[
                  {
                    title: <Link href="/dashboard" style={{ color: isDark ? '#5c7cfa' : '#1c7ed6' }}>Courses</Link>
                  },
                  {
                    title: <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{typedCourse.title}</Text>
                  }
                ]}
              />

              <Title level={4} style={{
                color: isDark ? 'white' : 'black',
                lineHeight: 1.2,
                margin: 0
              }}>
                {typedCourse.title}
              </Title>

              {typedCourse.description && (
                <Text style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  lineHeight: 1.4
                }}>
                  {typedCourse.description}
                </Text>
              )}
            </Space>

            {/* Progress Overview */}
            <Card
              size="small"
              style={{
                background: isDark ? '#2a2a2a' : '#ffffff',
                borderColor: isDark ? '#404040' : '#d9d9d9'
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 500, color: isDark ? 'white' : 'black' }}>Course Progress</Text>
                  <AntBadge
                    count={
                      <Space>
                        {progressPercentage === 100 ? <TrophyOutlined /> : <ClockCircleOutlined />}
                        {Math.round(progressPercentage)}%
                      </Space>
                    }
                    style={{
                      backgroundColor: progressPercentage === 100 ? '#52c41a' : '#1c7ed6'
                    }}
                  />
                </div>
                <Progress percent={progressPercentage} size="small" />
                <Text style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                  {completedModules} of {totalModules} modules completed
                </Text>
              </Space>
            </Card>

            {/* Week/Module Navigation */}
            <Collapse
              defaultActiveKey={typedCourse.weeks[0]?.id ? [typedCourse.weeks[0].id] : []}
              bordered={false}
              style={{ background: 'transparent' }}
            >
              {typedCourse.weeks.map((week: WeekData) => (
                <Panel
                  key={week.id}
                  header={
                    <Space direction="vertical" size={0}>
                      <Text style={{ color: isDark ? 'white' : 'black', fontWeight: 500 }}>
                        Week {week.weekNumber}: {week.title}
                      </Text>
                      <Text style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                        {week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length} / {week.modules.length} completed
                      </Text>
                    </Space>
                  }
                  style={{
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9',
                    marginBottom: '8px',
                    background: isDark ? '#2a2a2a' : '#ffffff'
                  }}
                >
                  <Space direction="vertical" size="small">
                    {week.modules.map((module: ModuleData) => {
                      const isCompleted = module.progress[0]?.isCompleted ?? false;
                      const isSelected = selectedModuleId === module.id;

                      return (
                        <Card
                          key={module.id}
                          size="small"
                          style={{
                            cursor: 'pointer',
                            background: isSelected
                              ? (isDark ? '#1a1a1a' : '#e6f7ff')
                              : (isDark ? '#2a2a2a' : '#ffffff'),
                            borderColor: isSelected
                              ? (isDark ? '#5c7cfa' : '#1c7ed6')
                              : (isDark ? '#404040' : '#d9d9d9'),
                          }}
                          onClick={() => setSelectedModuleId(module.id)}
                          hoverable
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space style={{ flex: 1, minWidth: 0 }}>
                              {getModuleIcon(module.contentType)}
                              <Space direction="vertical" size={0} style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                  style={{
                                    fontWeight: isSelected ? 500 : 400,
                                    color: isDark
                                      ? (isSelected ? '#5c7cfa' : '#d1d5db')
                                      : (isSelected ? '#1c7ed6' : 'black'),
                                    lineHeight: 1.2
                                  }}
                                  ellipsis
                                >
                                  {module.title}
                                </Text>
                                <AntBadge
                                  count={module.contentType.toLowerCase()}
                                  style={{
                                    backgroundColor: getContentTypeColor(module.contentType) === 'blue' ? '#1c7ed6' :
                                                   getContentTypeColor(module.contentType) === 'red' ? '#ff4d4f' :
                                                   getContentTypeColor(module.contentType) === 'green' ? '#52c41a' : '#6b7280'
                                  }}
                                />
                              </Space>
                            </Space>

                            <Button
                              size="small"
                              type={isCompleted ? "primary" : "default"}
                              danger={!isCompleted}
                              icon={isCompleted ? <CheckCircleOutlined /> : undefined}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProgressToggle(module.id, isCompleted);
                              }}
                              loading={pendingModules.includes(module.id)}
                              style={{ flexShrink: 0 }}
                            >
                              {isCompleted ? "Done" : "Mark Complete"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </Space>
                </Panel>
              ))}
            </Collapse>
          </Space>
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout>
        <Content style={{
          background: isDark ? '#141414' : '#fafafa',
          minHeight: 'calc(100vh - 70px)',
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {selectedModule ? (
              <ContentRenderer
                module={selectedModule}
                onComplete={(isCompleted) => handleProgressToggle(selectedModule.id, !isCompleted)}
                isCompleted={selectedModule.progress[0]?.isCompleted ?? false}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                textAlign: 'center'
              }}>
                <BookOutlined style={{ fontSize: '64px', color: isDark ? '#6b7280' : '#9ca3af' }} />
                <Title level={3} style={{ color: isDark ? '#d1d5db' : '#6b7280', margin: '16px 0' }}>
                  Select a Module to Begin
                </Title>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', maxWidth: '400px' }}>
                  Choose a module from the sidebar to start learning. Your progress will be automatically saved as you complete each section.
                </Text>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}