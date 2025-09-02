"use client";

import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';

interface AntdConfigProps {
  children: ReactNode;
}

export function AntdConfig({ children }: AntdConfigProps) {
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm, // You can toggle between defaultAlgorithm and darkAlgorithm
        token: {
          // Primary colors matching your current blue theme
          colorPrimary: '#1c7ed6',
          colorPrimaryHover: '#339af0',
          colorPrimaryActive: '#1971c2',

          // Background colors
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8fafc',
          colorBgElevated: '#ffffff',

          // Text colors
          colorText: '#000000d9',
          colorTextSecondary: '#00000073',
          colorTextTertiary: '#00000040',

          // Border colors
          colorBorder: '#d9d9d9',
          colorBorderSecondary: '#f0f0f0',

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
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 500,
          },
          Card: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Modal: {
            borderRadius: 12,
          },
          Tabs: {
            borderRadius: 8,
          },
          Badge: {
            borderRadius: 20,
          },
          Progress: {
            borderRadius: 100,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
