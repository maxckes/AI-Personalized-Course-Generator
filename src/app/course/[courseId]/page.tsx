"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Layout,
  Typography,
  Spin,
  Badge as AntBadge,
  Collapse,
  Button,
  Progress,
  Card,
  Alert,
  Breadcrumb,
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
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

import { api } from "~/trpc/react";
import { ContentRenderer } from "~/components/ContentRenderer";
import { Layout as AppLayout } from "~/components/Layout";
import { useTheme } from "~/lib/theme-context";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

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
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Auto-select first module if none selected
  React.useEffect(() => {
    if (typedCourse?.weeks[0]?.modules[0] && !selectedModuleId) {
      setSelectedModuleId(typedCourse.weeks[0].modules[0].id);
    }
  }, [typedCourse, selectedModuleId]);

  // Auto-collapse sidebar on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
      } else {
        // On larger screens, default to expanded
        setSidebarCollapsed(false);
        setMobileSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mobile sidebar overlay click
  const handleMobileOverlayClick = () => {
    setMobileSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <Content style={{
          padding: 'clamp(32px, 8vw, 48px)',
          textAlign: 'center',
          background: 'var(--course-content-bg)',
          color: 'var(--course-text-primary)',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <Spin size="large" />
            <div style={{ marginTop: 'clamp(16px, 4vw, 24px)' }}>
              <Text style={{
                color: 'var(--course-text-secondary)',
                fontSize: 'clamp(14px, 4vw, 16px)'
              }}>
                Loading course...
              </Text>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  if (error || !typedCourse) {
    return (
      <Layout>
        <Content style={{
          padding: 'clamp(32px, 8vw, 48px)',
          maxWidth: 'clamp(320px, 90vw, 600px)',
          margin: '0 auto',
          background: 'var(--course-content-bg)',
          color: 'var(--course-text-primary)',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Alert
              message="Course Not Found"
              description={(error as { message?: string })?.message ?? "The course you're looking for doesn't exist or you don't have access to it."}
              type="error"
              showIcon
              style={{
                marginBottom: 'clamp(24px, 6vw, 32px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(14px, 3vw, 16px)'
              }}
            />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              size="large"
              style={{
                backgroundColor: 'var(--course-progress-completed)',
                borderColor: 'var(--course-progress-completed)',
                height: 'clamp(44px, 8vw, 48px)',
                fontSize: 'clamp(14px, 3vw, 16px)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                Back to Dashboard
              </Link>
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
    <AppLayout>
      <Layout style={{ 
        height: '100%', 
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row'
      }} className="course-page-sidebar">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className={`mobile-sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
            onClick={handleMobileOverlayClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              opacity: mobileSidebarOpen ? 1 : 0,
              visibility: mobileSidebarOpen ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease, visibility 0.3s ease'
            }}
          />
        )}

        {/* Left Sidebar - Course Navigation */}
        <Sider
          width={350}
          className={mobileSidebarOpen ? 'mobile-sidebar-open' : ''}
          style={{
            background: 'var(--course-sidebar-bg)',
            borderRight: `1px solid var(--course-sidebar-border)`,
            width: sidebarCollapsed ? "0px" : "350px",
            maxWidth: sidebarCollapsed ? "0px" : "350px",
            minWidth: sidebarCollapsed ? "0px" : "350px",
            overflowX: "hidden",
            height: '100%',
            maxHeight: '100%',
            flexShrink: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: theme === 'dark' ? '2px 0 8px rgba(0, 0, 0, 0.3)' : '2px 0 8px rgba(0, 0, 0, 0.05)',
            zIndex: window?.innerWidth <= 768 ? 1000 : 'auto'
          }}
          breakpoint="lg"
          collapsedWidth={0}
          collapsed={sidebarCollapsed}
          collapsible
          theme="light"
          trigger={null}
        >
          <div 
            className="scrollable-content"
            style={{
              height: '100%',
              maxHeight: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
              padding: '0'
            }}>
          <div style={{ padding: '20px 16px' }}>
            {/* Course Header */}
            <div style={{ marginBottom: '24px' }}>
              <Breadcrumb
                items={[
                  {
                    title: <Link href="/dashboard" style={{ color: 'var(--logo-color)', fontSize: '12px' }}>Courses</Link>
                  },
                  {
                    title: <Text style={{ color: 'var(--course-text-secondary)', fontSize: '12px' }}>{typedCourse.title}</Text>
                  }
                ]}
                style={{ marginBottom: '12px' }}
              />

              <Title level={4} style={{
                color: 'var(--course-text-primary)',
                lineHeight: 1.3,
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: 700,
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {typedCourse.title}
              </Title>

              {typedCourse.description && (
                <Text style={{
                  fontSize: '14px',
                  color: 'var(--course-text-secondary)',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  display: 'block'
                }}>
                  {typedCourse.description}
                </Text>
              )}
            </div>

            {/* Progress Overview */}
            <Card
              style={{
                background: 'var(--course-card-bg)',
                border: `1px solid var(--course-card-border)`,
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                padding: '8px'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Text style={{ fontWeight: 600, color: 'var(--course-text-primary)', fontSize: '15px' }}>Course Progress</Text>
                  <AntBadge
                    count={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {progressPercentage === 100 ? <TrophyOutlined style={{ fontSize: '12px' }} /> : <ClockCircleOutlined style={{ fontSize: '12px' }} />}
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>
                          {progressPercentage}%
                        </span>
                      </div>
                    }
                    style={{
                      backgroundColor: progressPercentage === 100 ? 'var(--course-progress-completed-full)' : 'var(--course-progress-completed)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </div>
                <Progress
                  percent={progressPercentage}
                  strokeColor={progressPercentage === 100 ? 'var(--course-progress-completed-full)' : 'var(--course-progress-completed)'}
                  trailColor="var(--course-progress-bg)"
                  strokeWidth={8}
                  showInfo={false}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px'
                }}>
                  <Text style={{ fontSize: '12px', color: 'var(--course-text-secondary)' }}>
                    {completedModules} of {totalModules} modules completed
                  </Text>
                  <Text style={{
                    fontSize: '12px',
                    color: progressPercentage === 100 ? 'var(--course-progress-completed-full)' : 'var(--course-text-secondary)',
                    fontWeight: 500
                  }}>
                    {progressPercentage === 100 ? '🎉 Complete!' : `${totalModules - completedModules} remaining`}
                  </Text>
                </div>
              </div>
            </Card>
                  <br></br>
            {/* Week/Module Navigation */}
            <div style={{
                background: 'var(--course-card-bg)',
                border: `1px solid var(--course-card-border)`,
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                padding: '8px'
              }}>
              <Collapse
                bordered={false}
               
                items={typedCourse.weeks.map((week: WeekData) => ({
                  key: week.id,
                  label: (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '4px 0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <Text style={{
                          color: 'var(--course-text-primary)',
                          fontWeight: 600,
                          fontSize: '14px',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: 1.4,
                          display: 'block',
                          marginBottom: '6px'
                        }}>
                          Week {week.weekNumber}: {week.title}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Progress
                            percent={week.modules.length > 0 ? (week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length / week.modules.length) * 100 : 0}
                            size="small"
                            strokeColor="var(--course-progress-completed)"
                            trailColor="var(--course-progress-bg)"
                            style={{ flex: 1, maxWidth: '120px' }}
                            showInfo={false}
                          />
                          <Text style={{
                            fontSize: '11px',
                            color: 'var(--course-text-secondary)',
                            fontWeight: 500,
                            minWidth: '40px',
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"
                          }}>
                            {week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length}/{week.modules.length}
                          </Text>
                        </div>
                      </div>
                      <AntBadge
                        count={
                          week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length === week.modules.length ?
                            <CheckCircleOutlined style={{ fontSize: '12px', color: 'white' }} /> :
                            `${week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length}/${week.modules.length}`
                        }
                        style={{
                          backgroundColor: week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length === week.modules.length ? 'var(--course-progress-completed-full)' : 'var(--course-progress-completed)',
                          fontSize: '10px',
                          borderRadius: '6px',
                          marginLeft: '12px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    </div>
                  ),
                children: (
                  <div style={{ padding: '12px 0' }}>
                    {week.modules.map((module: ModuleData) => {
                      const isCompleted = module.progress[0]?.isCompleted ?? false;
                      const isSelected = selectedModuleId === module.id;

                                              return (
                          <div key={module.id} style={{ marginBottom: '8px' }}>
                          <Card
                          size="small"
                          style={{
                            cursor: 'pointer',
                            background: isSelected
                              ? 'var(--course-card-selected-bg)'
                              : isCompleted
                                ? 'var(--course-card-completed-bg)'
                                : 'var(--course-card-bg)',
                            borderColor: isSelected
                              ? 'var(--course-card-selected-border)'
                              : isCompleted
                                ? 'var(--course-card-completed-border)'
                                : 'var(--course-card-border)',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderWidth: isSelected ? '2px' : '1px',
                            boxShadow: isSelected
                              ? (theme === 'dark' ? '0 4px 12px rgba(77, 171, 247, 0.25)' : '0 4px 12px rgba(59, 130, 246, 0.15)')
                              : (theme === 'dark' ? '0 2px 4px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.04)')
                          }}
                          onClick={() => setSelectedModuleId(module.id)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Title Section */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ fontSize: '16px',  marginTop: '2px',color: getContentTypeColor(module.contentType) === 'blue' ? '#3b82f6' :
                                                 getContentTypeColor(module.contentType) === 'red' ? '#ef4444' :
                                                 getContentTypeColor(module.contentType) === 'green' ? '#10b981' : '#6b7280',borderRadius: '50%',padding: '0px 4px' }}>
                                {getModuleIcon(module.contentType)} 
                              </div>
                              <Text
                                style={{
                                  fontWeight: isSelected ? 600 : 500,
                                  color: isSelected ? 'var(--course-text-selected)' : 'var(--course-text-primary)',
                                  lineHeight: 1.4,
                                  fontSize: '13px',
                                  flex: 1,
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal'
                                }}
                              >
                                {module.title}
                              </Text>
                            </div>

                            {/* Badge and Button Section */}
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}>
                              <Button
                                size="small"
                                type={isCompleted ? "primary" : "default"}
                                danger={!isCompleted}
                                icon={isCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProgressToggle(module.id, isCompleted);
                                }}
                                loading={pendingModules.includes(module.id)}
                                style={{
                                  fontSize: '11px',
                                  height: '24px',
                                  flex: 1,
                                  minWidth: '90px',
                                  fontWeight: 500,
                                  backgroundColor: isCompleted ? 'var(--course-progress-completed-full)' : undefined,
                                  borderColor: isCompleted ? 'var(--course-progress-completed-full)' : undefined
                                }}
                              >
                                {isCompleted ? "Done" : "Mark Complete"}
                              </Button>
                            </div>
                          </div>
                                                  </Card>
                          </div>
                        );
                    })}
                  </div>
                ),
                style: {
                  border: 'var(--course-collapse-border)',
                  marginBottom: '8px',
                  background: 'var(--course-collapse-bg)',
                  borderRadius: '8px'
                }
              }))}
              defaultActiveKey={typedCourse.weeks[0]?.id ? [typedCourse.weeks[0].id] : []}
            />
            </div>
          </div>
        </div>
      </Sider>

        {/* Sidebar Toggle Button */}
        <div style={{
          position: 'fixed',
          top: 'clamp(76px, 10vh, 90px)',
          left: sidebarCollapsed ? 'clamp(16px, 3vw, 20px)' : 'calc(350px - 60px)',
          zIndex: 1001,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'auto'
        }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (window.innerWidth <= 768) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${theme === 'dark' ? '#434343' : '#e5e7eb'}`,
              borderRadius: 'clamp(8px, 2vw, 10px)',
              boxShadow: theme === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(12px)',
              padding: 'clamp(6px, 1.5vw, 8px)',
              width: 'clamp(44px, 10vw, 48px)',
              height: 'clamp(44px, 10vw, 48px)',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(16px, 4vw, 18px)'
            }}
            size="large"
          />
        </div>

        {/* Main Content Area */}
        <Layout className="layout-container" style={{
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
          transition: 'none'
        }}>

          <Content
            className="scrollable-content"
            style={{
              background: 'var(--course-content-bg)',
              height: '100%',
              maxHeight: '100%',
              padding: '0',
              overflowY: 'scroll',
              overflowX: 'hidden',
              width: '100%',
              maxWidth: '100%',
              flex: 1,
              minWidth: 0
            }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            padding: 'clamp(60px, 10vh, 80px) clamp(16px, 3vw, 32px) clamp(32px, 5vw, 40px) clamp(16px, 3vw, 32px)',
            boxSizing: 'border-box',
            minHeight: '100%'
          }}>
            {selectedModule ? (
              <ContentRenderer
                module={selectedModule}
                onComplete={(isCompleted) => handleProgressToggle(selectedModule.id, !isCompleted)}
                isCompleted={selectedModule.progress[0]?.isCompleted ?? false}
              />
            ) : (
              <div className="empty-state-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'clamp(400px, 60vh, 600px)',
                textAlign: 'center',
                padding: 'clamp(32px, 8vw, 64px) clamp(24px, 6vw, 48px)',
                margin: '0 auto',
                maxWidth: 'clamp(320px, 90vw, 600px)',
                width: '100%',
                background: 'var(--course-empty-state-bg)',
                borderRadius: 'clamp(12px, 3vw, 20px)',
                border: `1px solid var(--course-empty-state-border)`,
                boxShadow: theme === 'dark' ? '0 10px 40px rgba(0, 0, 0, 0.15)' : '0 10px 40px rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{
                  background: 'var(--course-empty-state-icon-bg)',
                  borderRadius: '50%',
                  padding: 'clamp(20px, 6vw, 32px)',
                  marginBottom: 'clamp(20px, 5vw, 32px)',
                  boxShadow: theme === 'dark' ? '0 8px 32px rgba(77, 171, 247, 0.25)' : '0 8px 32px rgba(59, 130, 246, 0.15)',
                  border: `2px solid var(--course-empty-state-icon-border)`
                }}>
                  <BookOutlined style={{
                    fontSize: 'clamp(40px, 12vw, 56px)',
                    color: 'var(--logo-color)',
                    opacity: 0.9
                  }} />
                </div>
                <Title level={2} style={{
                  color: 'var(--course-text-primary)',
                  margin: '0 0 clamp(12px, 3vw, 16px) 0',
                  fontSize: 'clamp(20px, 6vw, 28px)',
                  fontWeight: 700,
                  lineHeight: 1.2
                }}>
                  Select a Module to Begin
                </Title>
                <Text style={{
                  color: 'var(--course-text-secondary)',
                  maxWidth: 'clamp(280px, 80vw, 500px)',
                  lineHeight: 1.7,
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  marginBottom: 'clamp(20px, 5vw, 32px)'
                }}>
                  Choose a module from the sidebar to start learning. Your progress will be automatically saved as you complete each section.
                </Text>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'clamp(8px, 2vw, 12px)',
                  padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)',
                  background: 'var(--course-empty-state-icon-bg)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  border: `1px solid var(--course-empty-state-icon-border)`,
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <span style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}>👈</span>
                  <Text style={{
                    color: 'var(--course-empty-state-text)',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    Click on any module in the sidebar to get started
                  </Text>
                </div>
              </div>
            )}
          </div>
          </Content>
        </Layout>
      </Layout>
    </AppLayout>
  );
}