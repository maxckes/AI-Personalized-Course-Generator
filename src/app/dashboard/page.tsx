"use client";

import {
  Layout,
  Typography,
  Card,
  Button,
  Row,
  Col,
  Spin,
  Modal,
  Input,
  Tabs,
  Badge as AntBadge,
  Space,
  message,
  notification
} from 'antd';
import {
  PlusOutlined,
  BookOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Content } = Layout;

import { api } from "~/trpc/react";
import { Layout as AppLayout } from "~/components/Layout";
import { useTheme } from "~/lib/theme-context";

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [opened, setOpened] = useState(false);
  const [limitModalOpened, setLimitModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [activeTab, setActiveTab] = useState<string>('active');
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

      message.success(`Course "${data.title}" created successfully! 🎉`);
      setCourseTitle('');
      setOpened(false);
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        setOpened(false); // Close the create modal first
        setLimitModalOpened(true); // Then open the limit modal
        notification.warning({
          message: 'Course Limit Reached',
          description: 'You have reached the maximum of 3 active courses.',
          duration: 7,
        });
      } else {
        notification.error({
          message: 'Failed to Create Course',
          description: error.message || 'An unexpected error occurred while creating the course.',
          duration: 8,
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

      message.success(`Course "${data.title}" archived successfully 📦`);
    },
    onError: (error) => {
      notification.error({
        message: 'Failed to Archive Course',
        description: error.message || 'Unable to archive the course. Please try again.',
        duration: 6,
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

      message.success(`Course "${data.title}" restored successfully! 🎉`);
      // Auto-switch to active tab to show the restored course
      setActiveTab('active');
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        setLimitModalOpened(true); // Show the limit modal for restore conflicts too
        notification.warning({
          message: 'Cannot Restore Course',
          description: 'You already have 3 active courses. Archive one first to restore this course.',
          duration: 8,
        });
      } else {
        notification.error({
          message: 'Failed to Restore Course',
          description: error.message || 'Unable to restore the course. Please try again.',
          duration: 6,
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

      message.success(data.message);
      setDeleteModalOpened(false);
      setCourseToDelete(null);
    },
    onError: (error) => {
      notification.error({
        message: 'Failed to Delete Course',
        description: error.message || 'Unable to delete the course. Please try again.',
        duration: 6,
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
    setDeleteModalOpened(true);
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
    <AppLayout>
      <Content 
        className="scrollable-content"
        style={{ 
          padding: 'clamp(12px, 4vw, 24px)', 
          maxWidth: '100%', 
          margin: '0 auto',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden'
        }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <Title level={1} style={{ color: isDark ? 'white' : 'black', margin: 0 }}>My Courses</Title>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                {activeCourseCount}/3 active courses
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpened(true)}
              disabled={activeCourseCount >= 2}
              size="large"
              style={{
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                height: 'clamp(36px, 8vw, 48px)',
                padding: '0 clamp(12px, 3vw, 16px)',
                minWidth: 'clamp(100px, 20vw, 140px)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              <span className="hide-text-mobile">Create New Course</span>
              <span className="show-text-mobile" style={{ display: 'none' }}>Create</span>
            </Button>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            size="large"
            items={[
              {
                key: 'active',
                label: `Active Courses (${courses?.filter(c => c.status === 'active').length ?? 0})`,
              },
              {
                key: 'archived',
                label: `Archived Courses (${courses?.filter(c => c.status === 'archived').length ?? 0})`,
              },
            ]}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Loading your courses...</Text>
              </div>
            </div>
          ) : filteredCourses?.length === 0 ? (
            <Card
              style={{
                textAlign: 'center',
                background: isDark ? '#1a1a1a' : '#ffffff',
                borderColor: isDark ? '#404040' : '#d9d9d9'
              }}
            >
              <Space direction="vertical" size="large" style={{ alignItems: 'center' }}>
                <BookOutlined style={{ fontSize: '48px', color: isDark ? '#6b7280' : '#9ca3af' }} />
                <Title level={4} style={{ color: isDark ? 'white' : 'black', margin: 0 }}>
                  {activeTab === 'active' ? 'No active courses' : 'No archived courses'}
                </Title>
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                  {activeTab === 'active'
                    ? 'Get started by creating your first AI-generated course. You can create up to 3 active courses.'
                    : 'Archived courses will appear here when you archive them.'
                  }
                </Text>
                {activeTab === 'active' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpened(true)}
                    size="large"
                  >
                    Create Your First Course
                  </Button>
                )}
              </Space>
            </Card>
          ) : (
            <Row gutter={[
              { xs: 8, sm: 12, md: 16, lg: 16, xl: 16 },
              { xs: 12, sm: 16, md: 16, lg: 16, xl: 16 }
            ]} style={{ width: '100%' }}>
              {filteredCourses?.map((course) => (
                <Col key={course.id} xs={24} sm={12} md={8} lg={8} xl={6}>
                  <Card
                    style={{
                      height: '100%',
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderColor: isDark ? '#404040' : '#d9d9d9',
                      transition: 'all 0.3s ease',
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      minHeight: 'clamp(280px, 40vw, 320px)'
                    }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%', height: '100%' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <Title
                            level={4}
                            style={{
                              color: isDark ? 'white' : 'black',
                              lineHeight: 1.3,
                              margin: 0,
                              flex: 1,
                              marginRight: '12px'
                            }}
                          >
                            {course.title}
                          </Title>
                          <AntBadge
                            count={course.status === 'archived' ? '📦 Archived' : '🎓 Active'}
                            style={{
                              backgroundColor: course.status === 'archived'
                                ? (isDark ? '#4a5568' : '#d1d5db')
                                : '#1c7ed6',
                              color: 'white'
                            }}
                          />
                        </div>

                        <Text
                          style={{
                            color: isDark ? '#9ca3af' : '#6b7280',
                            lineHeight: 1.6,
                            marginBottom: '24px'
                          }}
                        >
                          {course.description ?? 'An engaging course designed to help you master new skills and advance your knowledge.'}
                        </Text>
                      </div>

                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Button
                          type="primary"
                          size="large"
                          block
                          icon={<BookOutlined />}
                          onClick={() => window.location.href = `/course/${course.id}`}
                        >
                          {course.status === 'archived' ? 'View Course' : 'Continue Learning'}
                        </Button>

                        <Space direction="horizontal" style={{ width: '100%' }}>
                          {activeTab === 'active' ? (
                            <Button
                              block
                              icon={<BookOutlined />}
                              onClick={() => handleArchiveCourse(course.id)}
                              loading={loadingStates.archiving.includes(course.id)}
                              disabled={loadingStates.archiving.includes(course.id)}
                              style={{ flex: 1 }}
                            >
                              {loadingStates.archiving.includes(course.id) ? 'Archiving...' : 'Archive'}
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="default"
                                block
                                icon={<BookOutlined />}
                                onClick={() => handleRestoreCourse(course.id)}
                                loading={loadingStates.restoring.includes(course.id)}
                                disabled={loadingStates.restoring.includes(course.id) || loadingStates.deleting.includes(course.id)}
                                style={{ flex: 1 }}
                              >
                                {loadingStates.restoring.includes(course.id) ? 'Restoring...' : 'Restore'}
                              </Button>
                              <Button
                                danger
                                block
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteCourse(course.id, course.title)}
                                loading={loadingStates.deleting.includes(course.id)}
                                disabled={loadingStates.deleting.includes(course.id) || loadingStates.restoring.includes(course.id)}
                                style={{ flex: 1 }}
                              >
                                {loadingStates.deleting.includes(course.id) ? 'Deleting...' : 'Delete'}
                              </Button>
                            </>
                          )}
                        </Space>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

        {/* Create Course Modal */}
        <Modal
          title="Create New Course"
          open={opened}
          onCancel={() => setOpened(false)}
          footer={[
            <Button key="cancel" onClick={() => setOpened(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleCreateCourse}
              loading={createCourse.isPending}
              disabled={courseTitle.length < 3}
            >
              Create Course
            </Button>,
          ]}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Course Title
              </Text>
              <Input
                placeholder="Enter course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                status={courseTitle.length > 0 && courseTitle.length < 3 ? 'error' : ''}
              />
              {courseTitle.length > 0 && courseTitle.length < 3 && (
                <Text type="danger" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Title must be at least 3 characters
                </Text>
              )}
            </div>
          </Space>
        </Modal>

        {/* Course Limit Modal */}
        <Modal
          title="Course Limit Reached"
          open={limitModalOpened}
          onCancel={() => setLimitModalOpened(false)}
          centered
          footer={[
            <Button key="cancel" onClick={() => setLimitModalOpened(false)}>
              Cancel
            </Button>,
            <Button
              key="view"
              type="primary"
              onClick={() => {
                setLimitModalOpened(false);
                setActiveTab('active'); // Switch to active tab to show courses
              }}
            >
              View My Courses
            </Button>,
          ]}
        >
          <Space direction="vertical" size="large" style={{ textAlign: 'center' }}>
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />
            <Title level={4}>Maximum Course Limit Reached</Title>
            <Text>
              You have reached the maximum of 3 active courses. To create a new course,
              please archive one of your existing courses first.
            </Text>
          </Space>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Delete Course"
          open={deleteModalOpened}
          onCancel={() => setDeleteModalOpened(false)}
          centered
          footer={[
            <Button key="cancel" onClick={() => setDeleteModalOpened(false)}>
              Cancel
            </Button>,
            <Button
              key="delete"
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={confirmDeleteCourse}
              loading={deleteCourse.isPending}
            >
              Delete Course
            </Button>,
          ]}
        >
          <Space direction="vertical" size="large" style={{ textAlign: 'center' }}>
            <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <Title level={4}>Are you sure you want to delete this course?</Title>
            <Text>
              <Text strong>&ldquo;{courseToDelete?.title}&rdquo;</Text> will be permanently deleted.
              This action cannot be undone and all course content, modules, and progress will be lost.
            </Text>
          </Space>
        </Modal>
        </Space>
      </Content>
    </AppLayout>
  );
}