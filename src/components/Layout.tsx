
import { useEffect, useState } from 'react';
import { Layout as AntLayout, Button, Avatar, Dropdown, Typography, Tooltip, Space, message, Input, Drawer } from 'antd';
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
  UserSwitchOutlined,
  MenuOutlined
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <AntLayout style={{ 
      height: '100vh', 
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
        <Header style={{
          backgroundColor: isDark ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 999,
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          height: '70px',
          flexShrink: 0
        }}>
          {/* Left Section - Logo and Navigation */}
          <Space align="center">
            {/* Mobile Menu Button */}
            {session && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ 
                  borderRadius: '8px',
                  display: 'none' // Hidden by default, shown via CSS media query
                }}
                className="mobile-menu-button"
              />
            )}

            {/* Logo and Title */}
            <Space align="center" size="small">
              <BookOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
              <Title level={3} style={{ 
                margin: 0, 
                color: isDark ? '#fff' : '#000', 
                fontWeight: 600,
                fontSize: 'clamp(18px, 5vw, 24px)' // Responsive font size
              }}>
                Course.AI
              </Title>
            </Space>

            {/* Desktop Navigation Menu */}
            {session && (
              <Space size="small" className="desktop-navigation">
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
          <Space size="small" align="center" className="header-right-section">
            {/* Search Bar - Hidden on very small screens */}
            <div className="search-bar-container">
              <Input
                placeholder="Search courses..."
                prefix={<SearchOutlined style={{ color: isDark ? '#8c8c8c' : '#bfbfbf' }} />}
                style={{
                  borderRadius: '20px',
                  backgroundColor: isDark ? '#262626' : '#f5f5f5',
                  border: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
                  height: '36px',
                  width: '100%',
                  minWidth: '200px',
                  maxWidth: '300px'
                }}
              />
            </div>

            {/* Action Buttons - Compact on mobile */}
            <Space size="small" className="action-buttons">
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

              {/* Notifications - Hidden on small screens */}
              <Tooltip title="Notifications">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                  className="hide-on-small"
                />
              </Tooltip>

              {/* Settings - Hidden on small screens */}
              <Tooltip title="Settings">
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  size="large"
                  style={{ borderRadius: '8px' }}
                  className="hide-on-small"
                />
              </Tooltip>
            </Space>

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
                      maxWidth: 'clamp(60px, 15vw, 120px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    className="user-name-text"
                  >
                    {session.user?.name}
                  </Text>
                </Space>
              </Dropdown>
            )}
          </Space>
        </Header>

        {/* Mobile Navigation Drawer */}
        <Drawer
          title={
            <Space align="center">
              <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>
                Course.AI
              </Text>
            </Space>
          }
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          bodyStyle={{ 
            backgroundColor: isDark ? '#1f1f1f' : '#fff',
            padding: '16px'
          }}
          headerStyle={{
            backgroundColor: isDark ? '#1f1f1f' : '#fff',
            borderBottom: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Mobile Navigation Menu */}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="text"
                icon={<HomeOutlined />}
                size="large"
                block
                style={{ 
                  textAlign: 'left',
                  borderRadius: '8px',
                  height: '48px'
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/dashboard';
                }}
              >
                Dashboard
              </Button>

              <Button
                type="text"
                icon={<BarChartOutlined />}
                size="large"
                block
                style={{ 
                  textAlign: 'left',
                  borderRadius: '8px',
                  height: '48px'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Analytics
              </Button>

              {isDeveloper && (
                <Button
                  type="text"
                  icon={<ExperimentOutlined />}
                  size="large"
                  block
                  style={{ 
                    textAlign: 'left',
                    borderRadius: '8px',
                    height: '48px'
                  }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = '/test-api';
                  }}
                >
                  API Lab
                </Button>
              )}
            </Space>

            {/* Mobile Actions */}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                size="large"
                block
                style={{ 
                  textAlign: 'left',
                  borderRadius: '8px',
                  height: '48px'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications
              </Button>

              <Button
                type="text"
                icon={<SettingOutlined />}
                size="large"
                block
                style={{ 
                  textAlign: 'left',
                  borderRadius: '8px',
                  height: '48px'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Button>
            </Space>
          </Space>
        </Drawer>

        <Content 
          className="scrollable-content"
          style={{
            backgroundColor: isDark ? '#000' : '#fafafa',
            height: 'calc(100vh - 70px)',
            maxHeight: 'calc(100vh - 70px)',
            padding: 'clamp(8px, 4vw, 16px)',
            overflowY: 'scroll',
            overflowX: 'hidden',
            flex: 1
          }}>
          {children}
        </Content>
    </AntLayout>
  );
}