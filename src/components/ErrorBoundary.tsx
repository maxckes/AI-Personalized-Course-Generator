"use client";

import { Component, type ReactNode } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const { Title, Text } = Typography;

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
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
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, #fff2f0 0%, #fafafa 100%)'
          }}
        >
          <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', maxWidth: '500px' }}>
            <div
              style={{
                padding: '48px',
                background: 'linear-gradient(135deg, #ffe7e6 0%, #fff2f0 100%)',
                borderRadius: '12px',
                border: '2px solid #ffccc7'
              }}
            >
              <ExclamationCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
            </div>

            <Space direction="vertical" size="middle">
              <Title level={1} style={{ color: '#ff4d4f', fontSize: '2rem', margin: 0 }}>
                Oops! Something went wrong
              </Title>

              <Text style={{ fontSize: '18px', color: '#8c8c8c', lineHeight: 1.6 }}>
                We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working to fix it.
              </Text>

              {this.state.error && (
                <Alert
                  message="Error Details"
                  description={
                    <Text style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                      {this.state.error.message}
                    </Text>
                  }
                  type="error"
                  showIcon
                />
              )}
            </Space>

            <Space direction="vertical" size="middle">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={this.handleRetry}
                  type="primary"
                  size="large"
                >
                  Try Again
                </Button>

                <Button
                  icon={<HomeOutlined />}
                  size="large"
                >
                  <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Go to Dashboard
                  </Link>
                </Button>
              </Space>

              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
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