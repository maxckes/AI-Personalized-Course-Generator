"use client";

import { Stack, Text, Button, Box, useMantineColorScheme } from '@mantine/core';
import { IconBook, IconPlus, IconSearch } from '@tabler/icons-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'create';
}

export function EmptyState({ 
  title, 
  description, 
  icon,
  actionLabel,
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'search':
        return <IconSearch size={48} color={isDark ? 'var(--mantine-color-gray-6)' : 'var(--mantine-color-gray-5)'} />;
      case 'create':
        return <IconPlus size={48} color={isDark ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-blue-5)'} />;
      default:
        return <IconBook size={48} color={isDark ? 'var(--mantine-color-gray-6)' : 'var(--mantine-color-gray-5)'} />;
    }
  };

  const getActionColor = () => {
    switch (variant) {
      case 'create':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Box 
      className="flex items-center justify-center p-8"
      style={{
        background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
        borderRadius: 'var(--mantine-radius-lg)',
        border: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid var(--mantine-color-gray-3)',
        minHeight: '300px'
      }}
    >
      <Stack gap="lg" align="center" ta="center" maw={400}>
        <Box
          p="lg"
          style={{
            background: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-1)',
            borderRadius: 'var(--mantine-radius-xl)',
            border: isDark ? '1px solid var(--mantine-color-dark-3)' : '1px solid var(--mantine-color-gray-2)'
          }}
        >
          {getIcon()}
        </Box>
        
        <Stack gap="sm">
          <Text size="xl" fw={600} c={isDark ? 'white' : 'dark'}>
            {title}
          </Text>
          <Text c={isDark ? 'gray.4' : 'dimmed'} style={{ lineHeight: 1.6 }}>
            {description}
          </Text>
        </Stack>
        
        {actionLabel && onAction && (
          <Button
            leftSection={variant === 'create' ? <IconPlus size={16} /> : undefined}
            onClick={onAction}
            color={getActionColor()}
            size="md"
            radius="md"
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
} 