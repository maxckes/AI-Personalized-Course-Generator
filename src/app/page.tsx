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
  Spin,
  message
} from 'antd';
import {
  BookOutlined,
  GoogleOutlined,
  BulbOutlined,
  AimOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const toggleColorScheme = () => {
    setIsDark(!isDark);
    message.info(isDark ? 'Switched to light mode' : 'Switched to dark mode');
  };

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
    <Layout style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
        : 'linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)'
    }}>
      {/* Header with Theme Toggle */}
      <Header style={{
        background: 'transparent',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 'none'
      }}>
        <Space style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <BookOutlined style={{ fontSize: '32px', color: isDark ? '#5c7cfa' : '#1c7ed6' }} />
          <span>
            <Title level={3} style={{ color: isDark ? '#5c7cfa' : '#1c7ed6', margin: 0 }}>
              Course.AI
            </Title>
          </span>
        </Space>

        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => toggleColorScheme()}
          size="large"
        >
          {isDark ? "Light" : "Dark"}
        </Button>
      </Header>

      <Content style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Hero Section */}
          <Space direction="vertical" size="large" style={{ alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <Space align="center">
              <BookOutlined style={{ fontSize: '64px', color: isDark ? '#5c7cfa' : '#1c7ed6' }} />
              <Title
                level={1}
                style={{
                  fontSize: '4rem',
                  lineHeight: 1.1,
                  background: isDark
                    ? 'linear-gradient(135deg, #5c7cfa 0%, #748ffc 100%)'
                    : 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
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
                color: isDark ? '#d1d5db' : '#6b7280',
                fontWeight: 400,
                lineHeight: 1.3,
                margin: 0
              }}
            >
              Your AI-Powered Learning Journey
            </Title>

            <Text
              style={{
                fontSize: '20px',
                color: isDark ? '#9ca3af' : '#6b7280',
                maxWidth: '600px',
                lineHeight: 1.6,
                margin: '0 auto'
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
                fontSize: '18px',
                fontWeight: 600,
                padding: '16px 32px',
                height: 'auto',
                borderRadius: '12px'
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
              <Title level={2} style={{ color: isDark ? 'white' : 'black', margin: 0 }}>
                Powerful Features for Modern Learning
              </Title>
            </Space>

            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col key={index} xs={24} sm={12} lg={6}>
                  <Card
                    bordered
                    style={{
                      height: '100%',
                      background: isDark
                        ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      borderColor: isDark ? '#404040' : '#e5e7eb',
                      transition: 'all 250ms ease-in-out'
                    }}
                    hoverable
                  >
                    <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: isDark
                            ? 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)'
                            : 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isDark ? '#ffffff' : '#1c7ed6'
                        }}
                      >
                        {feature.icon}
                      </div>

                      <Space direction="vertical" size="small">
                        <Title level={4} style={{ color: isDark ? 'white' : 'black', margin: 0 }}>
                          {feature.title}
                        </Title>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', lineHeight: 1.6 }}>
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
              background: isDark
                ? 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)'
                : 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
              borderColor: isDark ? '#1c7ed6' : '#91d5ff',
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto'
            }}
          >
            <Space direction="vertical" size="large" style={{ textAlign: 'center', width: '100%' }}>
              <Title level={2} style={{ color: isDark ? '#ffffff' : '#1c7ed6', margin: 0 }}>
                Ready to Transform Your Learning?
              </Title>
              <Text style={{
                fontSize: '18px',
                color: isDark ? '#e6f7ff' : '#4c4c4c',
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
                  fontSize: '18px',
                  fontWeight: 600,
                  padding: '16px 32px',
                  height: 'auto',
                  borderRadius: '12px'
                }}
              >
                Start Learning Now
                <ArrowRightOutlined />
              </Button>
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}
