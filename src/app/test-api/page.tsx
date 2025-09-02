// /app/test-api/page.tsx
"use client";

import { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Input,
  Badge as AntBadge,
  Divider,
  List,
  Spin,
  Alert,
  Space,
  notification
} from 'antd';
import {
  PlusOutlined,
  ContainerOutlined,
  UndoOutlined
} from '@ant-design/icons';
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
      notification.success({
        message: 'Course Generated!',
        description: `"${data.title}" has been created successfully.`,
        duration: 4,
      });
      void getCourses.refetch(); // Refetch the course list after a new one is created
    },
    onError: (error) => {
      console.error("❌ Error generating course:", error.message);
      notification.error({
        message: 'Generation Failed',
        description: error.message,
        duration: 6,
      });
    },
  });

  // tRPC hook for the archive mutation
  const archiveCourse = api.course.archive.useMutation({
    onSuccess: (data) => {
      console.log("✅ Course archived successfully:", data);
      notification.info({
        message: 'Course Archived',
        description: `"${data.title}" moved to archives.`,
        duration: 3,
      });
      void getCourses.refetch(); // Refetch the course list
    },
    onError: (error) => {
      console.error("❌ Error archiving course:", error.message);
      notification.error({
        message: 'Archive Failed',
        description: error.message,
        duration: 5,
      });
    },
  });

  // tRPC hook for the restore mutation
  const restoreCourse = api.course.restore.useMutation({
    onSuccess: (data) => {
      console.log("✅ Course restored successfully:", data);
      notification.success({
        message: 'Course Restored',
        description: `"${data.title}" is now active again.`,
        duration: 3,
      });
      void getCourses.refetch(); // Refetch the course list
    },
    onError: (error) => {
      console.error("❌ Error restoring course:", error.message);
      notification.error({
        message: 'Restore Failed',
        description: error.message,
        duration: 5,
      });
    },
  });

  const { Title, Text } = Typography;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <AuthShowcase />

      <Space direction="vertical" size="large" style={{ marginTop: '24px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>
          🧪 API Test Laboratory
        </Title>

        <Alert message="API Testing Information" description="This page allows you to test all course management APIs. Check the browser console for detailed API responses." type="info" showIcon />

        {/* Display Courses */}
        <Card bordered style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2} style={{ margin: 0 }}>My Courses</Title>
            <AntBadge count={`${getCourses.data?.length ?? 0} total`} style={{ backgroundColor: '#1890ff' }} />
          </div>

          {getCourses.isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
              <Spin size="small" />
              <Text style={{ marginLeft: '8px' }}>Loading courses...</Text>
            </div>
          ) : (
            <Space direction="vertical" size="small">
              {getCourses.data?.length === 0 ? (
                <Text style={{ color: '#8c8c8c', textAlign: 'center', padding: '16px' }}>
                  No courses found. Create one below!
                </Text>
              ) : (
                <List
                  dataSource={getCourses.data}
                  renderItem={(course) => (
                    <List.Item key={course.id}>
                      <Card bordered size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Space direction="vertical" size="small" style={{ flex: 1 }}>
                            <Space>
                              <Text strong>{course.title}</Text>
                              <AntBadge
                                count={course.status}
                                style={{
                                  backgroundColor: course.status === 'active' ? '#52c41a' : '#d9d9d9',
                                  color: course.status === 'active' ? 'white' : 'black'
                                }}
                              />
                            </Space>
                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              ID: {course.id}
                            </Text>
                          </Space>

                          <Space>
                            {course.status === 'active' ? (
                              <Button
                                size="small"
                                onClick={() => archiveCourse.mutate({ courseId: course.id })}
                                loading={archiveCourse.isPending}
                                icon={<ContainerOutlined />}
                              >
                                Archive
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => restoreCourse.mutate({ courseId: course.id })}
                                loading={restoreCourse.isPending}
                                icon={<UndoOutlined />}
                              >
                                Restore
                              </Button>
                            )}
                          </Space>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Space>
          )}
        </Card>

        <Divider />

        {/* Generate Course */}
        <Card bordered style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={3} style={{ marginBottom: '16px' }}>Generate New Course</Title>
          <Space direction="vertical" size="middle">
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Course Title</Text>
              <Input
                placeholder="Enter course title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                status={title.length > 0 && title.length < 3 ? 'error' : ''}
              />
              {title.length > 0 && title.length < 3 && (
                <Text type="danger" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Title must be at least 3 characters
                </Text>
              )}
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => generateCourse.mutate({ title })}
              loading={generateCourse.isPending}
              disabled={title.length < 3}
              block
            >
              {generateCourse.isPending ? 'Generating...' : 'Generate Course'}
            </Button>
          </Space>
        </Card>
        
        {/* Manual Archive Course */}
        <Card bordered style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={3} style={{ marginBottom: '16px' }}>Manual Archive (by ID)</Title>
          <Space direction="vertical" size="middle">
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Course ID</Text>
              <Input
                placeholder="Enter Course ID to archive..."
                value={courseIdToArchive}
                onChange={(e) => setCourseIdToArchive(e.target.value)}
              />
            </div>
            <Button
              icon={<ContainerOutlined />}
              onClick={() => archiveCourse.mutate({ courseId: courseIdToArchive })}
              loading={archiveCourse.isPending}
              disabled={!courseIdToArchive.trim()}
              block
            >
              {archiveCourse.isPending ? 'Archiving...' : 'Archive Course'}
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}