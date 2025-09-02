"use client";

import { ConfigProvider, theme, App as AntdApp, message as antdMessage } from 'antd';
import { useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from './theme-context';

// Safe message hook that handles context availability
export const useSafeMessage = () => {
  const [messageApi, contextHolder] = antdMessage.useMessage();

  const safeMessage = {
    success: (content: string, duration?: number) => {
      try {
        messageApi.success(content, duration);
      } catch {
        // Fallback to console if context not available
        console.log('Success:', content);
      }
    },
    error: (content: string, duration?: number) => {
      try {
        messageApi.error(content, duration);
      } catch {
        console.error('Error:', content);
      }
    },
    info: (content: string, duration?: number) => {
      try {
        messageApi.info(content, duration);
      } catch {
        console.info('Info:', content);
      }
    },
    warning: (content: string, duration?: number) => {
      try {
        messageApi.warning(content, duration);
      } catch {
        console.warn('Warning:', content);
      }
    },
    loading: (content: string, duration?: number) => {
      try {
        messageApi.loading(content, duration);
      } catch {
        console.log('Loading:', content);
      }
    },
  };

  return { messageApi: safeMessage, contextHolder };
};

interface AntdConfigProps {
  children: ReactNode;
}

export function AntdConfig({ children }: AntdConfigProps) {
  const { theme: appTheme } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Suppress Ant Design warnings for React 19 compatibility and message context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalWarn = console.warn;
      const originalError = console.error;

      // Suppress React 19 compatibility warning
      console.warn = (...args: unknown[]) => {
        const message = typeof args[0] === 'string' ? args[0] : '';
        if (message.includes('antd v5 support React is 16 ~ 18') ||
            message.includes('Static function can not consume context')) {
          return; // Suppress these specific warnings
        }
        originalWarn.apply(console, args);
      };

      // Also suppress related errors if any
      console.error = (...args: unknown[]) => {
        const message = typeof args[0] === 'string' ? args[0] : '';
        if (message.includes('antd: message') ||
            message.includes('antd: compatible') ||
            message.includes('Static function can not consume context')) {
          return; // Suppress these specific errors
        }
        originalError.apply(console, args);
      };

      // Cleanup function to restore original console methods
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

  const antTheme = useMemo(() => {
    const isDark = appTheme === 'dark';

    return {
      algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
      token: {
        // Primary colors - consistent across themes
        colorPrimary: isDark ? '#4dabf7' : '#1c7ed6',
        colorPrimaryHover: isDark ? '#74c0fc' : '#339af0',
        colorPrimaryActive: isDark ? '#339af0' : '#1971c2',

        // Background colors - theme aware
        colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
        colorBgLayout: isDark ? '#141414' : '#f8fafc',
        colorBgElevated: isDark ? '#262626' : '#ffffff',

        // Text colors - theme aware
        colorText: isDark ? '#ffffffd9' : '#000000d9',
        colorTextSecondary: isDark ? '#ffffff73' : '#00000073',
        colorTextTertiary: isDark ? '#ffffff40' : '#00000040',
        colorTextDisabled: isDark ? '#ffffff33' : '#00000033',

        // Border colors - theme aware
        colorBorder: isDark ? '#434343' : '#d9d9d9',
        colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',

        // Error colors
        colorError: isDark ? '#ff7875' : '#ff4d4f',
        colorErrorBorder: isDark ? '#ff7875' : '#ff4d4f',

        // Warning colors
        colorWarning: isDark ? '#ffc069' : '#faad14',

        // Success colors
        colorSuccess: isDark ? '#95de64' : '#52c41a',

        // Info colors
        colorInfo: isDark ? '#69c0ff' : '#1890ff',

        // Font family (matching your Geist font)
        fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,

        // Spacing
        padding: 16,
        paddingLG: 24,
        paddingSM: 12,

        // Box shadow - theme aware
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.45)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        boxShadowSecondary: isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.55)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      components: {
        Button: {
          borderRadius: 8,
          controlHeight: 40,
          fontWeight: 500,
          colorBgContainer: isDark ? '#262626' : '#ffffff',
          colorBorder: isDark ? '#434343' : '#d9d9d9',
        },
        Card: {
          borderRadius: 12,
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.45)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
          colorBorder: isDark ? '#434343' : '#d9d9d9',
        },
        Input: {
          borderRadius: 8,
          controlHeight: 40,
          colorBgContainer: isDark ? '#262626' : '#ffffff',
          colorBorder: isDark ? '#434343' : '#d9d9d9',
          colorText: isDark ? '#ffffffd9' : '#000000d9',
        },
        Modal: {
          borderRadius: 12,
          colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
          colorBgMask: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)',
        },
        Tabs: {
          borderRadius: 8,
          colorBgContainer: isDark ? '#141414' : '#ffffff',
        },
        Badge: {
          borderRadius: 20,
        },
        Progress: {
          borderRadius: 100,
        },
        Select: {
          borderRadius: 8,
          controlHeight: 40,
          colorBgContainer: isDark ? '#262626' : '#ffffff',
          colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
        },
        Dropdown: {
          borderRadius: 8,
          colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
          boxShadow: isDark
            ? '0 6px 16px 0 rgba(0, 0, 0, 0.45), 0 3px 6px -4px rgba(0, 0, 0, 0.48)'
            : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
        },
        Drawer: {
          colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
        },
        Collapse: {
          borderRadius: 8,
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
          colorBorder: isDark ? '#434343' : '#d9d9d9',
        },
        Alert: {
          borderRadius: 8,
          colorBgContainer: isDark ? '#262626' : '#f6ffed',
        },
        Table: {
          borderRadius: 8,
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
        },
        Pagination: {
          borderRadius: 6,
          colorBgContainer: isDark ? '#262626' : '#ffffff',
        },
      },
    };
  }, [appTheme, darkAlgorithm, defaultAlgorithm]);

  return (
    <ConfigProvider theme={antTheme}>
      <AntdApp
        message={{
          maxCount: 3,
          duration: 4,
          top: 24,
        }}
        notification={{
          placement: 'topRight',
          top: 24,
          duration: 4,
          maxCount: 3,
        }}
      >
        {children}
      </AntdApp>
    </ConfigProvider>
  );
}
