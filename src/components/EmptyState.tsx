"use client";

import { Typography, Button, Space } from 'antd';
import { BookOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTheme } from '~/lib/theme-context';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'create';
}

const { Text, Title } = Typography;

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'search':
        return <SearchOutlined style={{
          fontSize: 'clamp(32px, 10vw, 48px)',
          color: isDark ? '#8c8c8c' : '#bfbfbf'
        }} />;
      case 'create':
        return <PlusOutlined style={{
          fontSize: 'clamp(32px, 10vw, 48px)',
          color: isDark ? '#40a9ff' : '#1890ff'
        }} />;
      default:
        return <BookOutlined style={{
          fontSize: 'clamp(32px, 10vw, 48px)',
          color: isDark ? '#8c8c8c' : '#bfbfbf'
        }} />;
    }
  };

  const getActionType = () => {
    switch (variant) {
      case 'create':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        background: isDark ? '#262626' : '#ffffff',
        borderRadius: 'clamp(8px, 2vw, 12px)',
        border: isDark ? '1px solid #434343' : '1px solid #d9d9d9',
        minHeight: 'clamp(250px, 50vh, 400px)',
        padding: 'clamp(16px, 5vw, 32px)',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Space
        direction="vertical"
        size={['small', 'large']}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: 'clamp(280px, 80vw, 500px)'
        }}
      >
        <div
          style={{
            padding: 'clamp(16px, 6vw, 24px)',
            background: isDark ? '#1a1a1a' : '#fafafa',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            border: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
            width: 'clamp(60px, 20vw, 80px)',
            height: 'clamp(60px, 20vw, 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}
        >
          {getIcon()}
        </div>

        <Space direction="vertical" size={['small', 'small']}>
          <Title
            level={3}
            style={{
              color: isDark ? 'white' : 'black',
              margin: 0,
              fontSize: 'clamp(18px, 5vw, 24px)',
              lineHeight: 1.3
            }}
          >
            {title}
          </Title>
          <Text
            style={{
              color: isDark ? '#a6a6a6' : '#8c8c8c',
              lineHeight: 1.6,
              fontSize: 'clamp(14px, 4vw, 16px)',
              maxWidth: '100%'
            }}
          >
            {description}
          </Text>
        </Space>

        {actionLabel && onAction && (
          <Button
            icon={variant === 'create' ? <PlusOutlined /> : undefined}
            onClick={onAction}
            type={getActionType()}
            size="large"
            block
            style={{
              height: 'clamp(40px, 8vw, 48px)',
              fontSize: 'clamp(14px, 3vw, 16px)',
              minWidth: '120px'
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Space>
    </div>
  );
} 