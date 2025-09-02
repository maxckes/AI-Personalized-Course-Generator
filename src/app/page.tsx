"use client";

import {
  Layout,
  Typography,
  Button,
  Card,
  Badge,
  Row,
  Col,
  Space,
  Spin
} from 'antd';
import {
  BookOutlined,
  GoogleOutlined,
  BulbOutlined,
  AimOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Layout as AppLayout } from "~/components/Layout";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 4vw, 24px)'
      }}>
        <Spin size="large" />
        <Text style={{ 
          fontSize: 'clamp(14px, 3vw, 16px)',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Loading LearnForge AI...
        </Text>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: <BulbOutlined style={{ fontSize: 'clamp(20px, 4vw, 24px)' }} />,
      title: "AI-Powered Content",
      description: "Generate personalized course content tailored to your learning style and goals"
    },
    {
      icon: <AimOutlined style={{ fontSize: 'clamp(20px, 4vw, 24px)' }} />,
      title: "Structured Learning",
      description: "Organized weekly modules with clear learning objectives and progress tracking"
    },
    {
      icon: <RocketOutlined style={{ fontSize: 'clamp(20px, 4vw, 24px)' }} />,
      title: "Interactive Experience",
      description: "Engage with quizzes, videos, and reading materials designed for optimal retention"
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 'clamp(20px, 4vw, 24px)' }} />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress analytics and achievements"
    }
  ];

  return (
    <AppLayout>
      <div style={{
        height: '100%',
        maxHeight: '100%',
        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <Content style={{ 
          padding: 'clamp(16px, 4vw, 48px) clamp(8px, 3vw, 24px)', 
          maxWidth: '1200px', 
          margin: '0 auto',
          width: '100%',
          minHeight: '100%'
        }}>
          <Space direction="vertical" size="large" style={{ 
            width: '100%', 
            textAlign: 'center',
            gap: 'clamp(32px, 6vw, 64px)'
          }}>
            {/* Hero Section */}
            <Space direction="vertical" size="large" style={{ 
              alignItems: 'center', 
              maxWidth: '900px', 
              margin: '0 auto',
              width: '100%',
              padding: 'clamp(0px, 2vw, 16px) 0'
            }}>
              <Space align="center" style={{ 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                gap: 'clamp(8px, 2vw, 16px)',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <BookOutlined style={{ 
                  fontSize: 'clamp(36px, 10vw, 64px)', 
                  color: '#1c7ed6' 
                }} />
                <Title
                  level={1}
                  style={{
                    fontSize: 'clamp(2rem, 10vw, 4rem)',
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                    textAlign: 'center'
                  }}
                >
                  LearnForge AI
                </Title>
              </Space>

              <Title
                level={2}
                style={{
                  color: '#6b7280',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  margin: 0,
                  fontSize: 'clamp(1.25rem, 5vw, 2.25rem)',
                  textAlign: 'center'
                }}
              >
                Your AI-Powered Learning Journey
              </Title>

              <Text
                style={{
                  fontSize: 'clamp(14px, 4vw, 20px)',
                  color: '#6b7280',
                  maxWidth: '700px',
                  lineHeight: 1.6,
                  margin: '0 auto',
                  textAlign: 'center',
                  padding: '0 clamp(8px, 2vw, 16px)'
                }}
              >
                Generate personalized AI-powered courses tailored to your learning goals.
                Create up to 3 courses with structured weekly modules and interactive content.
              </Text>

              <Button
                type="primary"
                size="large"
                icon={<GoogleOutlined />}
                onClick={() => signIn('google')}
                style={{
                  background: 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
                  border: 'none',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  fontWeight: 600,
                  padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 32px)',
                  height: 'auto',
                  borderRadius: '12px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  justifyContent: 'center'
                }}
              >
                Get Started with Google
                <ArrowRightOutlined />
              </Button>
            </Space>

            {/* Features Section */}
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="vertical" size="middle" style={{ textAlign: 'center' }}>
                <Badge
                  count={<RocketOutlined style={{ color: '#1c7ed6' }} />}
                  style={{ backgroundColor: '#e6f7ff', color: '#1c7ed6' }}
                >
                  Why Choose LearnForge AI?
                </Badge>
                <Title 
                  level={2} 
                  style={{ 
                    color: 'black', 
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                    textAlign: 'center'
                  }}
                >
                  Powerful Features for Modern Learning
                </Title>
              </Space>

              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                {features.map((feature, index) => (
                  <Col key={index} xs={24} sm={12} lg={6}>
                    <Card
                      bordered
                      style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderColor: '#e5e7eb',
                        transition: 'all 250ms ease-in-out',
                        borderRadius: 'clamp(8px, 2vw, 12px)'
                      }}
                      hoverable
                    >
                      <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
                        <div
                          style={{
                            padding: 'clamp(12px, 3vw, 16px)',
                            borderRadius: 'clamp(8px, 2vw, 12px)',
                            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1c7ed6',
                            minWidth: 'clamp(48px, 8vw, 64px)',
                            height: 'clamp(48px, 8vw, 64px)'
                          }}
                        >
                          {feature.icon}
                        </div>

                        <Space direction="vertical" size="small">
                          <Title 
                            level={4} 
                            style={{ 
                              color: 'black', 
                              margin: 0,
                              fontSize: 'clamp(16px, 3vw, 18px)',
                              textAlign: 'center'
                            }}
                          >
                            {feature.title}
                          </Title>
                          <Text 
                            style={{ 
                              color: '#6b7280', 
                              lineHeight: 1.6,
                              fontSize: 'clamp(13px, 2.5vw, 14px)',
                              textAlign: 'center'
                            }}
                          >
                            {feature.description}
                          </Text>
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>

            {/* CTA Section */}
            <Card
              bordered
              style={{
                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                borderColor: '#91d5ff',
                maxWidth: '700px',
                width: '100%',
                margin: '0 auto',
                borderRadius: 'clamp(12px, 3vw, 16px)'
              }}
            >
              <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
                <Title 
                  level={2} 
                  style={{ 
                    color: '#1c7ed6', 
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
                    textAlign: 'center'
                  }}
                >
                  Ready to Transform Your Learning?
                </Title>
                <Text style={{
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  color: '#4c4c4c',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                  textAlign: 'center'
                }}>
                  Join thousands of learners who are already creating personalized courses with AI.
                  Start your learning journey today.
                </Text>

                <Button
                  type="primary"
                  size="large"
                  icon={<GoogleOutlined />}
                  onClick={() => signIn('google')}
                  style={{
                    background: 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
                    border: 'none',
                    fontSize: 'clamp(14px, 3vw, 18px)',
                    fontWeight: 600,
                    padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 32px)',
                    height: 'auto',
                    borderRadius: '12px',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    justifyContent: 'center'
                  }}
                >
                  Start Learning Now
                  <ArrowRightOutlined />
                </Button>
              </Space>
            </Card>
          </Space>
        </Content>
      </div>
    </AppLayout>
  );
}
