"use client";

import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group, 
  Card,
  Badge,
  Grid,
  Box,
  Divider,
  ActionIcon,
  Tooltip,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconBook, 
  IconBrandGoogle, 
  IconBrain, 
  IconTarget, 
  IconRocket, 
  IconCheck,
  IconArrowRight,
  IconSun,
  IconMoon
} from '@tabler/icons-react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <Container size="sm" className="min-h-screen flex items-center justify-center">
        <Stack align="center" gap="lg">
          <div className="loading-skeleton w-16 h-16 rounded-full" />
          <Text size="lg" c="dimmed">Loading Pathfinder...</Text>
        </Stack>
      </Container>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: <IconBrain size={24} />,
      title: "AI-Powered Content",
      description: "Generate personalized course content tailored to your learning style and goals"
    },
    {
      icon: <IconTarget size={24} />,
      title: "Structured Learning",
      description: "Organized weekly modules with clear learning objectives and progress tracking"
    },
    {
      icon: <IconRocket size={24} />,
      title: "Interactive Experience",
      description: "Engage with quizzes, videos, and reading materials designed for optimal retention"
    },
    {
      icon: <IconCheck size={24} />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress analytics and achievements"
    }
  ];

  return (
    <Box className="min-h-screen" style={{
      background: isDark 
        ? 'linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)'
        : 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-gray-0) 100%)'
    }}>
      {/* Header with Theme Toggle */}
      <Box p="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconBook size={32} color={isDark ? '#5c7cfa' : '#1c7ed6'} />
            <Title order={1} size="h3" c={isDark ? 'blue.4' : 'blue'}>
              Pathfinder
            </Title>
          </Group>
          
          <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            <ActionIcon
              variant="light"
              color={isDark ? 'yellow' : 'blue'}
              onClick={() => toggleColorScheme()}
              size="lg"
              radius="md"
            >
              {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      <Container size="xl" py="xl">
        <Stack gap="3xl" align="center">
          {/* Hero Section */}
          <Stack gap="xl" align="center" ta="center" maw={800}>
            <Group justify="center" gap="md">
              <IconBook size={64} color={isDark ? '#5c7cfa' : '#1c7ed6'} />
              <Title 
                order={1} 
                size="4rem" 
                c={isDark ? 'white' : 'dark'}
                style={{ 
                  lineHeight: 1.1,
                  background: isDark 
                    ? 'linear-gradient(135deg, #5c7cfa 0%, #748ffc 100%)'
                    : 'linear-gradient(135deg, #1c7ed6 0%, #339af0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Pathfinder
              </Title>
            </Group>
            
            <Title 
              order={2} 
              size="2rem" 
              c={isDark ? 'gray.3' : 'gray.7'}
              fw={400}
              style={{ lineHeight: 1.3 }}
            >
              Your AI-Powered Learning Journey
            </Title>
            
            <Text 
              size="xl" 
              c={isDark ? 'gray.4' : 'dimmed'} 
              maw={600}
              style={{ lineHeight: 1.6 }}
            >
              Generate personalized AI-powered courses tailored to your learning goals. 
              Create up to 2 courses with structured weekly modules and interactive content.
            </Text>

            <Group gap="lg" mt="xl">
              <Button
                size="xl"
                leftSection={<IconBrandGoogle size={24} />}
                rightSection={<IconArrowRight size={20} />}
                onClick={() => signIn('google')}
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-5) 100%)',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  padding: '1rem 2rem'
                }}
                radius="lg"
              >
                Get Started with Google
              </Button>
            </Group>
          </Stack>

          {/* Features Section */}
          <Stack gap="xl" w="100%">
            <Stack gap="md" align="center" ta="center">
              <Badge 
                size="lg" 
                variant="light" 
                color="blue"
                radius="md"
                leftSection={<IconRocket size={16} />}
              >
                Why Choose Pathfinder?
              </Badge>
              <Title order={2} size="2.5rem" c={isDark ? 'white' : 'dark'}>
                Powerful Features for Modern Learning
              </Title>
            </Stack>

            <Grid gutter="xl">
              {features.map((feature, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                  <Card 
                    withBorder 
                    p="xl" 
                    radius="lg"
                    h="100%"
                    style={{
                      background: isDark 
                        ? 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-5) 100%)'
                        : 'linear-gradient(135deg, var(--mantine-color-white) 0%, var(--mantine-color-gray-0) 100%)',
                      borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
                      transition: 'all 250ms ease-in-out'
                    }}
                    className="card-hover"
                  >
                    <Stack gap="lg" align="center" ta="center">
                      <Box
                        p="md"
                        style={{
                          background: isDark 
                            ? 'linear-gradient(135deg, var(--mantine-color-blue-9) 0%, var(--mantine-color-blue-8) 100%)'
                            : 'linear-gradient(135deg, var(--mantine-color-blue-1) 0%, var(--mantine-color-blue-0) 100%)',
                          borderRadius: 'var(--mantine-radius-lg)',
                          color: isDark ? 'var(--mantine-color-blue-3)' : 'var(--mantine-color-blue-6)'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      
                      <Stack gap="sm">
                        <Title order={3} size="h4" c={isDark ? 'white' : 'dark'}>
                          {feature.title}
                        </Title>
                        <Text c={isDark ? 'gray.4' : 'dimmed'} style={{ lineHeight: 1.6 }}>
                          {feature.description}
                        </Text>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>

          {/* CTA Section */}
          <Card 
            withBorder 
            p="xl" 
            radius="xl"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, var(--mantine-color-blue-9) 0%, var(--mantine-color-blue-8) 100%)'
                : 'linear-gradient(135deg, var(--mantine-color-blue-1) 0%, var(--mantine-color-blue-0) 100%)',
              borderColor: isDark ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-blue-3)',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <Stack gap="lg" align="center" ta="center">
              <Title order={2} size="2rem" c={isDark ? 'blue.3' : 'blue.7'}>
                Ready to Transform Your Learning?
              </Title>
              <Text size="lg" c={isDark ? 'gray.4' : 'dimmed'} maw={500}>
                Join thousands of learners who are already creating personalized courses with AI. 
                Start your learning journey today.
              </Text>
              
              <Button
                size="xl"
                leftSection={<IconBrandGoogle size={24} />}
                rightSection={<IconArrowRight size={20} />}
                onClick={() => signIn('google')}
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-5) 100%)',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  padding: '1rem 2rem'
                }}
                radius="lg"
              >
                Start Learning Now
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
