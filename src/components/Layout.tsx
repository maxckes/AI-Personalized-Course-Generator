
import { useEffect, useState } from 'react';
import { Layout as AntLayout, Button, Avatar, Dropdown, Typography, Tooltip, Space, message, Input } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  ExperimentOutlined,
  SunOutlined,
  MoonOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
  BarChartOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const { Header, Content } = AntLayout;
const { Title, Text } = Typography;

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only show API testing for this specific user ID
  const isDeveloper = session?.user?.id === "cmdpwnf560000rvneb18d34ks";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    message.info(isDark ? 'Switched to light mode' : 'Switched to dark mode');
  };

  const handleSignOut = () => {
    message.success('You have been successfully signed out.');
    void signOut();
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
        <Header style={{
          backgroundColor: isDark ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          height: '70px'
        }}>
          {/* Left Section - Logo and Navigation */}
          <Space size="large" align="center">
            {/* Logo and Title Separated */}
            <Space align="center" size="small">
              <BookOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0, color: isDark ? '#fff' : '#000', fontWeight: 600 }}>
                Course.AI
              </Title>
            </Space>

            {/* Navigation Menu */}
            {session && (
              <Space size="small">
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                </Button>

                <Button
                  type="text"
                  icon={<BarChartOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Analytics
                </Button>

                {isDeveloper && (
                  <Button
                    type="text"
                    icon={<ExperimentOutlined />}
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    <Link href="/test-api" style={{ color: 'inherit', textDecoration: 'none' }}>
                      API Lab
                    </Link>
                  </Button>
                )}
              </Space>
            )}
          </Space>

          {/* Right Section - Search, Notifications, User */}
          <Space size="middle" align="center">
            {/* Search Bar */}
            <div style={{ width: '250px' }}>
              <Input
                placeholder="Search courses..."
                prefix={<SearchOutlined style={{ color: isDark ? '#8c8c8c' : '#bfbfbf' }} />}
                style={{
                  borderRadius: '20px',
                  backgroundColor: isDark ? '#262626' : '#f5f5f5',
                  border: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
                  height: '36px'
                }}
              />
            </div>

            {/* Theme Toggle */}
            <Tooltip title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Switch to dark mode"}>
              <Button
                type="text"
                icon={mounted ? (isDark ? <SunOutlined /> : <MoonOutlined />) : <MoonOutlined />}
                onClick={toggleTheme}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <Button
                type="text"
                icon={<BellOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Settings">
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Tooltip>

            {session && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: 'Profile',
                    },
                    {
                      key: 'account',
                      icon: <UserSwitchOutlined />,
                      label: 'Account Settings',
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'signout',
                      icon: <LogoutOutlined />,
                      label: 'Sign out',
                      onClick: handleSignOut,
                    },
                  ],
                }}
                placement="bottomRight"
                arrow
              >
                <Space style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}>
                  <Avatar
                    src={session.user?.image}
                    alt={session.user?.name ?? 'User'}
                    size="small"
                    style={{ border: `2px solid ${isDark ? '#1890ff' : '#40a9ff'}` }}
                  >
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text
                    strong
                    style={{
                      color: isDark ? '#fff' : '#000',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {session.user?.name}
                  </Text>
                </Space>
              </Dropdown>
            )}
          </Space>
        </Header>

        <Content style={{
          backgroundColor: isDark ? '#000' : '#fafafa',
          minHeight: 'calc(100vh - 64px)',
          padding: '24px',
          overflow: 'auto'
        }}>
          {children}
        </Content>
    </AntLayout>
  );
}