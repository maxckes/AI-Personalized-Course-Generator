"use client";

import { Component, type ReactNode } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from '~/lib/theme-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const { Title, Text } = Typography;

interface ErrorBoundaryWithThemeProps extends Props {
  theme: 'light' | 'dark';
}

export class ErrorBoundary extends Component<ErrorBoundaryWithThemeProps, State> {
  constructor(props: ErrorBoundaryWithThemeProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a production app, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: this.props.theme === 'dark'
              ? 'linear-gradient(135deg, #2a1810 0%, #141414 100%)'
              : 'linear-gradient(135deg, #fff2f0 0%, #fafafa 100%)',
            padding: 'clamp(16px, 5vw, 32px)'
          }}
        >
          <Space
            direction="vertical"
            size={['small', 'large']}
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              width: '100%',
              maxWidth: 'clamp(320px, 90vw, 600px)',
              padding: 'clamp(16px, 4vw, 32px)'
            }}
          >
            <div
              style={{
                padding: 'clamp(24px, 8vw, 48px)',
                background: this.props.theme === 'dark'
                  ? 'linear-gradient(135deg, #431418 0%, #2a1810 100%)'
                  : 'linear-gradient(135deg, #ffe7e6 0%, #fff2f0 100%)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                border: `2px solid ${this.props.theme === 'dark' ? '#722f37' : '#ffccc7'}`,
                width: 'clamp(80px, 20vw, 120px)',
                height: 'clamp(80px, 20vw, 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <ExclamationCircleOutlined
                style={{
                  fontSize: 'clamp(32px, 10vw, 64px)',
                  color: '#ff4d4f'
                }}
              />
            </div>

            <Space direction="vertical" size={['small', 'middle']}>
              <Title
                level={1}
                style={{
                  color: this.props.theme === 'dark' ? '#ff7875' : '#ff4d4f',
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  margin: 0,
                  lineHeight: 1.2
                }}
              >
                Oops! Something went wrong
              </Title>

              <Text
                style={{
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  color: this.props.theme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                  lineHeight: 1.6,
                  maxWidth: '100%'
                }}
              >
                We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working to fix it.
              </Text>

              {this.state.error && (
                <Alert
                  message="Error Details"
                  description={
                    <Text
                      style={{
                        fontSize: 'clamp(12px, 3vw, 14px)',
                        fontFamily: 'monospace',
                        wordBreak: 'break-word'
                      }}
                    >
                      {this.state.error.message}
                    </Text>
                  }
                  type="error"
                  showIcon
                  style={{ width: '100%' }}
                />
              )}
            </Space>

            <Space direction="vertical" size={['small', 'middle']}>
              <Space
                direction="vertical"
                size={['small', 'middle']}
                style={{
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  onClick={this.handleRetry}
                  type="primary"
                  size="large"
                  block
                  style={{
                    height: 'clamp(40px, 8vw, 48px)',
                    fontSize: 'clamp(14px, 3vw, 16px)'
                  }}
                >
                  Try Again
                </Button>

                <Button
                  icon={<HomeOutlined />}
                  size="large"
                  block
                  style={{
                    height: 'clamp(40px, 8vw, 48px)',
                    fontSize: 'clamp(14px, 3vw, 16px)'
                  }}
                >
                  <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Go to Dashboard
                  </Link>
                </Button>
              </Space>

              <Text
                style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: this.props.theme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                  textAlign: 'center',
                  maxWidth: '100%'
                }}
              >
                If the problem persists, please contact support
              </Text>
            </Space>
          </Space>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide theme context to the class component
export function ErrorBoundaryWithTheme(props: Props) {
  const { theme } = useTheme();

  return <ErrorBoundary {...props} theme={theme} />;
}

// Export the wrapper as the default export
export default ErrorBoundaryWithTheme; 