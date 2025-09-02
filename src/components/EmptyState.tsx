"use client";

import { Typography, Button, Space } from 'antd';
import { BookOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

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
  const isDark = false; // TODO: Implement proper theme detection

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'search':
        return <SearchOutlined style={{ fontSize: '48px', color: isDark ? '#8c8c8c' : '#bfbfbf' }} />;
      case 'create':
        return <PlusOutlined style={{ fontSize: '48px', color: isDark ? '#40a9ff' : '#1890ff' }} />;
      default:
        return <BookOutlined style={{ fontSize: '48px', color: isDark ? '#8c8c8c' : '#bfbfbf' }} />;
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
      className="flex items-center justify-center p-8"
      style={{
        background: isDark ? '#262626' : '#ffffff',
        borderRadius: '8px',
        border: isDark ? '1px solid #434343' : '1px solid #d9d9d9',
        minHeight: '300px'
      }}
    >
      <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '400px' }}>
        <div
          style={{
            padding: '24px',
            background: isDark ? '#1a1a1a' : '#fafafa',
            borderRadius: '12px',
            border: isDark ? '1px solid #303030' : '1px solid #f0f0f0'
          }}
        >
          {getIcon()}
        </div>

        <Space direction="vertical" size="small">
          <Title level={3} style={{ color: isDark ? 'white' : 'black', margin: 0 }}>
            {title}
          </Title>
          <Text style={{ color: isDark ? '#a6a6a6' : '#8c8c8c', lineHeight: 1.6 }}>
            {description}
          </Text>
        </Space>

        {actionLabel && onAction && (
          <Button
            icon={variant === 'create' ? <PlusOutlined /> : undefined}
            onClick={onAction}
            type={getActionType()}
            size="middle"
          >
            {actionLabel}
          </Button>
        )}
      </Space>
    </div>
  );
} 