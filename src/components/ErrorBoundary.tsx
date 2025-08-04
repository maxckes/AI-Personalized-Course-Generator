"use client";

import { Component, type ReactNode } from 'react';
import { Alert, Button, Stack, Text, Title, Box, Group } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

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
        <Box 
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, var(--mantine-color-red-0) 0%, var(--mantine-color-gray-0) 100%)'
          }}
        >
          <Stack gap="xl" align="center" maw={500} ta="center">
            <Box
              p="xl"
              style={{
                background: 'linear-gradient(135deg, var(--mantine-color-red-1) 0%, var(--mantine-color-red-0) 100%)',
                borderRadius: 'var(--mantine-radius-xl)',
                border: '2px solid var(--mantine-color-red-3)'
              }}
            >
              <IconAlertCircle size={64} color="var(--mantine-color-red-6)" />
            </Box>
            
            <Stack gap="md">
              <Title order={1} size="2rem" c="red">
                Oops! Something went wrong
              </Title>
              
              <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
                We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working to fix it.
              </Text>
              
              {this.state.error && (
                <Alert 
                  color="red" 
                  title="Error Details" 
                  icon={<IconAlertCircle size={16} />}
                  variant="light"
                >
                  <Text size="sm" style={{ fontFamily: 'monospace' }}>
                    {this.state.error.message}
                  </Text>
                </Alert>
              )}
            </Stack>
            
            <Stack gap="md">
              <Group justify="center" gap="md">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRetry}
                  variant="filled"
                  color="blue"
                  size="lg"
                  radius="md"
                >
                  Try Again
                </Button>
                
                <Button
                  component={Link}
                  href="/dashboard"
                  leftSection={<IconHome size={16} />}
                  variant="light"
                  color="gray"
                  size="lg"
                  radius="md"
                >
                  Go to Dashboard
                </Button>
              </Group>
              
              <Text size="sm" c="dimmed">
                If the problem persists, please contact support
              </Text>
            </Stack>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
} 