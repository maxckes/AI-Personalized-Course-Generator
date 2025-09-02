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
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text>Loading Course.AI...</Text>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: <BulbOutlined style={{ fontSize: '24px' }} />,
      title: "AI-Powered Content",
      description: "Generate personalized course content tailored to your learning style and goals"
    },
    {
      icon: <AimOutlined style={{ fontSize: '24px' }} />,
      title: "Structured Learning",
      description: "Organized weekly modules with clear learning objectives and progress tracking"
    },
    {
      icon: <RocketOutlined style={{ fontSize: '24px' }} />,
      title: "Interactive Experience",
      description: "Engage with quizzes, videos, and reading materials designed for optimal retention"
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '24px' }} />,
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
        padding: 'clamp(24px, 6vw, 48px) clamp(12px, 4vw, 24px)', 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%',
        minHeight: '100%'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Hero Section */}
          <Space direction="vertical" size="large" style={{ 
            alignItems: 'center', 
            maxWidth: '800px', 
            margin: '0 auto',
            width: '100%'
          }}>
            <Space align="center" style={{ 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              gap: 'clamp(8px, 2vw, 16px)'
            }}>
              <BookOutlined style={{ 
                fontSize: 'clamp(40px, 8vw, 64px)', 
                color: '#1c7ed6' 
              }} />
              <Title
                level={1}
                style={{
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}
              >
                Course.AI
              </Title>
            </Space>

            <Title
              level={2}
              style={{
                color: '#6b7280',
                fontWeight: 400,
                lineHeight: 1.3,
                margin: 0
              }}
            >
              Your AI-Powered Learning Journey
            </Title>

            <Text
              style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                color: '#6b7280',
                maxWidth: '600px',
                lineHeight: 1.6,
                margin: '0 auto',
                textAlign: 'center',
                padding: '0 16px'
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
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                height: 'auto',
                borderRadius: '12px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
                Why Choose Course.AI?
              </Badge>
              <Title level={2} style={{ color: 'black', margin: 0 }}>
                Powerful Features for Modern Learning
              </Title>
            </Space>

            <Row gutter={[24, 24]} style={{ width: '100%' }}>
              {features.map((feature, index) => (
                <Col key={index} xs={24} sm={12} md={12} lg={6}>
                  <Card
                    bordered
                    style={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      borderColor: '#e5e7eb',
                      transition: 'all 250ms ease-in-out'
                    }}
                    hoverable
                  >
                    <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1c7ed6'
                        }}
                      >
                        {feature.icon}
                      </div>

                      <Space direction="vertical" size="small">
                        <Title level={4} style={{ color: 'black', margin: 0 }}>
                          {feature.title}
                        </Title>
                        <Text style={{ color: '#6b7280', lineHeight: 1.6 }}>
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
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto'
            }}
          >
            <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
              <Title level={2} style={{ color: '#1c7ed6', margin: 0 }}>
                Ready to Transform Your Learning?
              </Title>
              <Text style={{
                fontSize: '18px',
                color: '#4c4c4c',
                maxWidth: '500px',
                margin: '0 auto'
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
                  padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                  height: 'auto',
                  borderRadius: '12px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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
