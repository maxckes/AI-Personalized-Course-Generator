
import { useEffect, useState } from 'react';
import { AppShell, Group, Title, Button, Avatar, Menu, Text, ActionIcon, Tooltip, ScrollArea, useMantineColorScheme } from '@mantine/core';
import { IconUser, IconLogout, IconBook, IconFlask, IconSun, IconMoon } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Header style={{
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <IconBook size={28} style={{ color: 'var(--logo-color)' }} />
            <Title order={2} c="var(--title-color)">Pathfinder</Title>
          </Group>
          
          <Group gap="sm">
            {/* Global Theme Toggle */}
            <Tooltip label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Switch to dark mode"}>
              <ActionIcon
                variant="subtle"
                color={mounted ? (isDark ? 'yellow' : 'blue') : 'blue'}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {mounted ? (isDark ? <IconSun size={20} /> : <IconMoon size={20} />) : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>

            {session && (
              <>
                <Tooltip label="API Test Lab">
                  <ActionIcon
                    component={Link}
                    href="/test-api"
                    variant="subtle"
                    color="gray"
                    size="md"
                  >
                    <IconFlask size={18} />
                  </ActionIcon>
                </Tooltip>
                
                <Menu trigger="hover" openDelay={100} closeDelay={400}>
                  <Menu.Target>
                    <Group style={{ cursor: 'pointer' }}>
                      <Avatar 
                        src={session.user?.image} 
                        alt={session.user?.name ?? 'User'} 
                        size="sm" 
                      />
                      <Text size="sm" c="var(--user-text-color)">{session.user?.name}</Text>
                    </Group>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconUser size={16} />}>
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      leftSection={<IconLogout size={16} />}
                      onClick={() => {
                        notifications.show({
                          title: 'Signed Out',
                          message: 'You have been successfully signed out.',
                          color: 'blue',
                          autoClose: 3000,
                        });
                        void signOut();
                      }}
                    >
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{
        backgroundColor: 'var(--navbar-bg)',
        borderRight: '1px solid var(--navbar-border)'
      }}>
        <ScrollArea style={{ height: 'calc(100vh - 140px)' }}>
          <Group justify="space-between" mb="md">
            <Text fw={500} c="text">Quick Actions</Text>  {/* Assuming default text color is fine, or adjust if needed */}
          </Group>
          
          <Button
            component={Link}
            href="/dashboard"
            variant="light"
            fullWidth
            leftSection={<IconBook size={16} />}
            mb="sm"
            styles={{
              root: {
                backgroundColor: 'var(--dashboard-btn-bg)',
                color: 'var(--dashboard-btn-color)',
                '&:hover': {
                  backgroundColor: 'var(--dashboard-btn-hover-bg)'
                }
              }
            }}
          >
            Dashboard
          </Button>
          
          <Button
            component={Link}
            href="/test-api"
            variant="subtle"
            fullWidth
            leftSection={<IconFlask size={16} />}
            size="sm"
            c="var(--api-text-color)"
          >
            API Testing
          </Button>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main style={{
        backgroundColor: 'var(--main-bg)',
        minHeight: '100vh'
      }}>
        <ScrollArea style={{ height: 'calc(100vh - 70px)' }}>
          {children}
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}