
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
import { useTheme } from '~/lib/theme-context';

interface LayoutProps {
  children: ReactNode;
}

const { Header, Content } = AntLayout;
const { Title, Text } = Typography;

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only show API testing for this specific user ID
  const isDeveloper = session?.user?.id === "cmdpwnf560000rvneb18d34ks";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    message.info(theme === 'light' ? 'Switched to dark mode 🌙' : 'Switched to light mode ☀️');
  };

  const handleSignOut = () => {
    message.success('You have been successfully signed out.');
    void signOut({ callbackUrl: '/' });
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
          backgroundColor: 'var(--header-bg)',
          borderBottom: `1px solid var(--header-border)`,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 999,
          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          height: 'clamp(56px, 8vh, 70px)',
          flexShrink: 0,
          transition: 'all 0.3s ease'
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
            <Space align="center" size="small" className="logo-title-container">
              <BookOutlined
                style={{
                  fontSize: 'clamp(24px, 4vw, 28px)',
                  color: 'var(--logo-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              <Title level={3} style={{
                margin: 0,
                color: 'var(--user-text-color)',
                fontWeight: 600,
                fontSize: 'clamp(18px, 5vw, 24px)',
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center'
              }}>
                LearnForge AI
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
            {session && (
              <div className="search-bar-container">
                <Input
                  placeholder="Search courses..."
                  prefix={<SearchOutlined style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }} />}
                  style={{
                    borderRadius: '20px',
                    backgroundColor: theme === 'dark' ? '#262626' : '#f5f5f5',
                    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                    height: 'clamp(32px, 7vw, 36px)',
                    width: '100%',
                    minWidth: 'clamp(150px, 20vw, 200px)',
                    maxWidth: 'clamp(250px, 25vw, 300px)',
                    fontSize: 'clamp(13px, 3vw, 14px)'
                  }}
                />
              </div>
            )}

            {/* Action Buttons - Compact on mobile */}
            <Space size="small" className="action-buttons">
              {/* Theme Toggle */}
              <Tooltip title={mounted ? (theme === 'dark' ? "Switch to light mode ☀️" : "Switch to dark mode 🌙") : "Switch to dark mode 🌙"}>
                <Button
                  type="text"
                  icon={mounted ? (theme === 'dark' ? <SunOutlined /> : <MoonOutlined />) : <MoonOutlined />}
                  onClick={handleToggleTheme}
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
                <Space style={{ 
                  cursor: 'pointer', 
                  padding: 'clamp(6px, 1.5vw, 8px)', 
                  borderRadius: 'clamp(6px, 1.5vw, 8px)', 
                  transition: 'all 0.2s' 
                }}>
                  <Avatar
                    src={session.user?.image}
                    alt={session.user?.name ?? 'User'}
                    size={window?.innerWidth <= 576 ? 'small' : 'default'}
                    style={{ 
                      border: `2px solid ${theme === 'dark' ? '#4dabf7' : '#40a9ff'}`,
                      width: 'clamp(24px, 6vw, 32px)',
                      height: 'clamp(24px, 6vw, 32px)',
                      fontSize: 'clamp(12px, 3vw, 14px)'
                    }}
                  >
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text
                    strong
                    style={{
                      color: 'var(--user-text-color)',
                      maxWidth: 'clamp(60px, 15vw, 120px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 'clamp(12px, 3vw, 14px)'
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
            <Space align="center" size="small" className="logo-title-container">
              <BookOutlined
                style={{
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  color: 'var(--logo-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              />
              <Text
                style={{
                  color: 'var(--user-text-color)',
                  fontWeight: 600,
                  fontSize: 'clamp(18px, 4vw, 20px)',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                LearnForge AI
              </Text>
            </Space>
          }
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          styles={{
            body: {
              backgroundColor: 'var(--header-bg)',
              padding: '16px'
            },
            header: {
              backgroundColor: 'var(--header-bg)',
              borderBottom: `1px solid var(--header-border)`
            }
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
            backgroundColor: 'var(--main-bg)',
            height: 'calc(100vh - clamp(56px, 8vh, 70px))',
            maxHeight: 'calc(100vh - clamp(56px, 8vh, 70px))',
            overflowY: 'scroll',
            overflowX: 'hidden',
            flex: 1,
            transition: 'background-color 0.3s ease'
          }}>
          {children}
        </Content>
    </AntLayout>
  );
}