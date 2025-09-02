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
import { Layout as AppLayout } from "~/components/Layout";
import { useTheme } from "~/lib/theme-context";

export default function ApiTestPage() {
  const [title, setTitle] = useState("My Test Course");
  const [courseIdToArchive, setCourseIdToArchive] = useState("");
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <AppLayout>
      <div style={{
        padding: 'clamp(8px, 3vw, 24px)',
        maxWidth: 'clamp(320px, 95vw, 1200px)',
        margin: '0 auto',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: isDark ? 'transparent' : undefined
      }}>
      <AuthShowcase />

      <Space direction="vertical" size={['large', 'large']} style={{
        marginTop: 'clamp(16px, 4vw, 32px)',
        width: '100%'
      }}>
        <Title
          level={1}
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(16px, 4vw, 32px)',
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            color: isDark ? 'white' : 'black',
            lineHeight: 1.2
          }}
        >
          🧪 API Test Laboratory
        </Title>

        <Alert
          message="API Testing Information"
          description="This page allows you to test all course management APIs. Check the browser console for detailed API responses."
          type="info"
          showIcon
          style={{
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            fontSize: 'clamp(14px, 3vw, 16px)'
          }}
        />

        {/* Display Courses */}
        <Card
          bordered
          style={{
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            background: isDark ? '#1a1a1a' : undefined,
            borderColor: isDark ? '#404040' : undefined
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'clamp(12px, 3vw, 20px)',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                color: isDark ? 'white' : 'black'
              }}
            >
              My Courses
            </Title>
            <AntBadge
              count={`${getCourses.data?.length ?? 0} total`}
              style={{
                backgroundColor: '#1890ff',
                fontSize: 'clamp(10px, 2vw, 12px)'
              }}
            />
          </div>

          {getCourses.isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'clamp(16px, 4vw, 24px)'
            }}>
              <Spin size="small" />
              <Text
                style={{
                  marginLeft: 'clamp(8px, 2vw, 12px)',
                  color: isDark ? '#d9d9d9' : '#8c8c8c',
                  fontSize: 'clamp(14px, 3vw, 16px)'
                }}
              >
                Loading courses...
              </Text>
            </div>
          ) : (
            <Space direction="vertical" size={['small', 'small']}>
              {getCourses.data?.length === 0 ? (
                <Text
                  style={{
                    color: isDark ? '#a6a6a6' : '#8c8c8c',
                    textAlign: 'center',
                    padding: 'clamp(16px, 4vw, 24px)',
                    fontSize: 'clamp(14px, 3vw, 16px)'
                  }}
                >
                  No courses found. Create one below!
                </Text>
              ) : (
                <List
                  dataSource={getCourses.data}
                  renderItem={(course) => (
                    <List.Item key={course.id} style={{ padding: 'clamp(4px, 1vw, 8px) 0' }}>
                      <Card
                        bordered
                        size="small"
                        style={{
                          background: isDark ? '#262626' : undefined,
                          borderColor: isDark ? '#404040' : undefined,
                          borderRadius: 'clamp(4px, 1vw, 6px)',
                          width: '100%'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 'clamp(8px, 2vw, 12px)'
                        }}>
                          <Space direction="vertical" size={['small', 'small']} style={{ flex: 1, minWidth: '200px' }}>
                            <Space wrap style={{ gap: 'clamp(4px, 1vw, 8px)' }}>
                              <Text
                                strong
                                style={{
                                  color: isDark ? 'white' : 'black',
                                  fontSize: 'clamp(14px, 3vw, 16px)'
                                }}
                              >
                                {course.title}
                              </Text>
                              <AntBadge
                                count={course.status}
                                style={{
                                  backgroundColor: course.status === 'active' ? '#52c41a' : '#d9d9d9',
                                  color: course.status === 'active' ? 'white' : 'black',
                                  fontSize: 'clamp(10px, 2vw, 12px)'
                                }}
                              />
                            </Space>
                            <Text
                              style={{
                                fontSize: 'clamp(11px, 2.5vw, 13px)',
                                color: isDark ? '#a6a6a6' : '#8c8c8c',
                                wordBreak: 'break-all'
                              }}
                            >
                              ID: {course.id}
                            </Text>
                          </Space>

                          <Space style={{ flexShrink: 0 }}>
                            {course.status === 'active' ? (
                              <Button
                                size="middle"
                                onClick={() => archiveCourse.mutate({ courseId: course.id })}
                                loading={archiveCourse.isPending}
                                icon={<ContainerOutlined />}
                                style={{
                                  height: 'clamp(32px, 6vw, 36px)',
                                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                                  minWidth: 'clamp(80px, 15vw, 100px)'
                                }}
                              >
                                <span className="hide-text-mobile">Archive</span>
                              </Button>
                            ) : (
                              <Button
                                size="middle"
                                type="primary"
                                onClick={() => restoreCourse.mutate({ courseId: course.id })}
                                loading={restoreCourse.isPending}
                                icon={<UndoOutlined />}
                                style={{
                                  height: 'clamp(32px, 6vw, 36px)',
                                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                                  minWidth: 'clamp(80px, 15vw, 100px)'
                                }}
                              >
                                <span className="hide-text-mobile">Restore</span>
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

        <Divider style={{
          borderColor: isDark ? '#404040' : '#d9d9d9',
          margin: 'clamp(20px, 5vw, 32px) 0'
        }} />

        {/* Generate Course */}
        <Card
          bordered
          style={{
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            background: isDark ? '#1a1a1a' : undefined,
            borderColor: isDark ? '#404040' : undefined
          }}
        >
          <Title
            level={3}
            style={{
              marginBottom: 'clamp(12px, 3vw, 20px)',
              fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
              color: isDark ? 'white' : 'black'
            }}
          >
            Generate New Course
          </Title>
          <Space direction="vertical" size={['middle', 'middle']}>
            <div>
              <Text
                strong
                style={{
                  display: 'block',
                  marginBottom: 'clamp(6px, 1.5vw, 10px)',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: isDark ? '#d9d9d9' : 'black'
                }}
              >
                Course Title
              </Text>
              <Input
                placeholder="Enter course title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                status={title.length > 0 && title.length < 3 ? 'error' : ''}
                style={{
                  height: 'clamp(40px, 8vw, 48px)',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  borderRadius: 'clamp(4px, 1vw, 6px)'
                }}
              />
              {title.length > 0 && title.length < 3 && (
                <Text
                  type="danger"
                  style={{
                    fontSize: 'clamp(11px, 2.5vw, 13px)',
                    marginTop: 'clamp(3px, 1vw, 6px)',
                    display: 'block'
                  }}
                >
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
              style={{
                height: 'clamp(44px, 8vw, 48px)',
                fontSize: 'clamp(14px, 3vw, 16px)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              {generateCourse.isPending ? 'Generating...' : 'Generate Course'}
            </Button>
          </Space>
        </Card>
        
        {/* Manual Archive Course */}
        <Card
          bordered
          style={{
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            background: isDark ? '#1a1a1a' : undefined,
            borderColor: isDark ? '#404040' : undefined
          }}
        >
          <Title
            level={3}
            style={{
              marginBottom: 'clamp(12px, 3vw, 20px)',
              fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
              color: isDark ? 'white' : 'black'
            }}
          >
            Manual Archive (by ID)
          </Title>
          <Space direction="vertical" size={['middle', 'middle']}>
            <div>
              <Text
                strong
                style={{
                  display: 'block',
                  marginBottom: 'clamp(6px, 1.5vw, 10px)',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: isDark ? '#d9d9d9' : 'black'
                }}
              >
                Course ID
              </Text>
              <Input
                placeholder="Enter Course ID to archive..."
                value={courseIdToArchive}
                onChange={(e) => setCourseIdToArchive(e.target.value)}
                style={{
                  height: 'clamp(40px, 8vw, 48px)',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  borderRadius: 'clamp(4px, 1vw, 6px)'
                }}
              />
            </div>
            <Button
              icon={<ContainerOutlined />}
              onClick={() => archiveCourse.mutate({ courseId: courseIdToArchive })}
              loading={archiveCourse.isPending}
              disabled={!courseIdToArchive.trim()}
              block
              style={{
                height: 'clamp(44px, 8vw, 48px)',
                fontSize: 'clamp(14px, 3vw, 16px)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              {archiveCourse.isPending ? 'Archiving...' : 'Archive Course'}
            </Button>
          </Space>
        </Card>
      </Space>
      </div>
    </AppLayout>
  );
}