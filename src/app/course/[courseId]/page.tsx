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
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <AppLayout>
      <Layout style={{ 
        height: '100%', 
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row'
      }} className="course-page-sidebar">
        {/* Left Sidebar - Course Navigation */}
        <Sider
          width={350}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRight: '1px solid #e5e7eb',
            width: sidebarCollapsed ? "0px" : "350px",
            maxWidth: sidebarCollapsed ? "0px" : "350px",
            minWidth: sidebarCollapsed ? "0px" : "350px",
            overflowX: "hidden",
            height: '100%',
            maxHeight: '100%',
            flexShrink: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)'
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
                    title: <Link href="/dashboard" style={{ color: '#1c7ed6', fontSize: '12px' }}>Courses</Link>
                  },
                  {
                    title: <Text style={{ color: '#6b7280', fontSize: '12px' }}>{typedCourse.title}</Text>
                  }
                ]}
                style={{ marginBottom: '12px' }}
              />

              <Title level={4} style={{
                color: '#111827',
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
                  color: '#6b7280',
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
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                padding: '8px'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Text style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>Course Progress</Text>
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
                      backgroundColor: progressPercentage === 100 ? '#10b981' : '#3b82f6',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </div>
                <Progress
                  percent={progressPercentage}
                  strokeColor={progressPercentage === 100 ? '#10b981' : '#3b82f6'}
                  trailColor="#e5e7eb"
                  strokeWidth={8}
                  showInfo={false}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px'
                }}>
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                    {completedModules} of {totalModules} modules completed
                  </Text>
                  <Text style={{
                    fontSize: '12px',
                    color: progressPercentage === 100 ? '#10b981' : '#6b7280',
                    fontWeight: 500
                  }}>
                    {progressPercentage === 100 ? '🎉 Complete!' : `${totalModules - completedModules} remaining`}
                  </Text>
                </div>
              </div>
            </Card>
                  <br></br>
            {/* Week/Module Navigation */}
            <div style={{ }}>
              <Collapse
                bordered={false}
                style={{
                  background: 'transparent'
                }}
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
                          color: '#111827',
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
                            strokeColor="#3b82f6"
                            trailColor="#e5e7eb"
                            style={{ flex: 1, maxWidth: '120px' }}
                            showInfo={false}
                          />
                          <Text style={{
                            fontSize: '11px',
                            color: '#6b7280',
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
                          backgroundColor: week.modules.filter((m: ModuleData) => m.progress[0]?.isCompleted).length === week.modules.length ? '#10b981' : '#3b82f6',
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
                              ? 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)'
                              : isCompleted
                                ? 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            borderColor: isSelected
                              ? '#3b82f6'
                              : isCompleted
                                ? '#10b981'
                                : '#e5e7eb',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderWidth: isSelected ? '2px' : '1px',
                            boxShadow: isSelected 
                              ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
                              : '0 2px 4px rgba(0, 0, 0, 0.04)'
                          }}
                          onClick={() => setSelectedModuleId(module.id)}
                          hoverable
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
                                  color: isSelected ? '#1e40af' : '#111827',
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
                                  backgroundColor: isCompleted ? '#10b981' : undefined,
                                  borderColor: isCompleted ? '#10b981' : undefined
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
                  border: 'none',
                  marginBottom: '8px',
                  background: 'transparent',
                  borderRadius: '8px'
                }
              }))}
              defaultActiveKey={typedCourse.weeks[0]?.id ? [typedCourse.weeks[0].id] : []}
            />
            </div>
          </div>
        </div>
      </Sider>

        {/* Main Content Area */}
        <Layout className="layout-container" style={{
          flex: 1,
          overflow: 'hidden',
          width: sidebarCollapsed ? '100%' : 'calc(100% - 350px)',
          minWidth: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Sidebar Toggle Button */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: sidebarCollapsed ? '20px' : '370px',
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                backdropFilter: 'blur(12px)',
                padding: '8px',
                width: '44px',
                height: '44px'
              }}
              size="large"
            />
          </div>

          <Content
            className="scrollable-content"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              height: '100%',
              maxHeight: '100%',
              padding: '0',
              overflowY: 'scroll',
              overflowX: 'hidden',
              width: '100%',
              maxWidth: '100%'
            }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            padding: '80px clamp(20px, 4vw, 40px) 40px clamp(20px, 4vw, 40px)',
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
                minHeight: '60vh',
                textAlign: 'center',
                padding: '64px 48px',
                margin: '0 auto',
                maxWidth: '600px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                borderRadius: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                  borderRadius: '50%',
                  padding: '32px',
                  marginBottom: '32px',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
                }}>
                  <BookOutlined style={{
                    fontSize: '56px',
                    color: '#3b82f6',
                    opacity: 0.9
                  }} />
                </div>
                <Title level={2} style={{
                  color: '#111827',
                  margin: '0 0 16px 0',
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: 1.2
                }}>
                  Select a Module to Begin
                </Title>
                <Text style={{
                  color: '#6b7280',
                  maxWidth: '500px',
                  lineHeight: 1.7,
                  fontSize: '16px',
                  marginBottom: '32px'
                }}>
                  Choose a module from the sidebar to start learning. Your progress will be automatically saved as you complete each section.
                </Text>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe'
                }}>
                  <span style={{ fontSize: '20px' }}>👈</span>
                  <Text style={{
                    color: '#1e40af',
                    fontSize: '14px',
                    fontWeight: 600
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