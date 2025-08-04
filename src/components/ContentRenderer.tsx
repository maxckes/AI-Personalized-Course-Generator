"use client";

import { 
  Stack, 
  Title, 
  Text, 
  Button, 
  Card, 
  Group, 
  Badge,
  TypographyStylesProvider,
  Radio,
  Progress,
  Alert,
  Divider,
  ActionIcon,
  Tooltip,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconCheck, 
  IconFileText, 
  IconPlayerPlay, 
  IconQuestionMark,
  IconClock,
  IconTrophy,
  IconVolumeOff,
  IconSun,
  IconMoon,
  IconMicrophone
} from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';

interface Module {
  id: string;
  title: string;
  contentType: 'READING' | 'VIDEO' | 'QUIZ';
  content: unknown; // JsonValue from Prisma can be any JSON value including null
}

interface ContentRendererProps {
  module: Module;
  onComplete: (isCompleted: boolean) => void;
  isCompleted: boolean;
}

export function ContentRenderer({ module, onComplete, isCompleted }: ContentRendererProps) {
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const handleToggleComplete = () => {
    const newStatus = !localCompleted;
    setLocalCompleted(newStatus);
    onComplete(newStatus);
  };

  const getModuleIcon = () => {
    switch (module.contentType) {
      case 'READING':
        return <IconFileText size={20} />;
      case 'VIDEO':
        return <IconPlayerPlay size={20} />;
      case 'QUIZ':
        return <IconQuestionMark size={20} />;
      default:
        return <IconFileText size={20} />;
    }
  };

  const getModuleColor = () => {
    switch (module.contentType) {
      case 'READING':
        return 'blue';
      case 'VIDEO':
        return 'red';
      case 'QUIZ':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="md">
      {/* Compact Module Header with Theme Toggle */}
      <Card 
        withBorder 
        padding="lg" 
        radius="md"
        style={{
          background: isDark ? 'var(--mantine-color-dark-5)' : `linear-gradient(135deg, var(--mantine-color-${getModuleColor()}-0) 0%, var(--mantine-color-gray-0) 100%)`,
          borderColor: localCompleted ? (isDark ? 'var(--mantine-color-green-8)' : 'var(--mantine-color-green-3)') : (isDark ? 'var(--mantine-color-${getModuleColor()}-9)' : `var(--mantine-color-${getModuleColor()}-3)`),
          borderWidth: '1px'
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md" align="center">
            <div style={{ 
              padding: '6px', 
              borderRadius: '50%', 
              backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : `var(--mantine-color-${getModuleColor()}-1)`,
              border: isDark ? '1px solid var(--mantine-color-dark-4)' : `1px solid var(--mantine-color-${getModuleColor()}-3)`
            }}>
              {getModuleIcon()}
            </div>
            
            <Stack gap={4}>
              <Group gap="sm">
                <Badge 
                  color={getModuleColor()} 
                  variant="light" 
                  size="sm"
                  leftSection={getModuleIcon()}
                >
                {module.contentType.toLowerCase()}
              </Badge>
                
              {localCompleted && (
                  <Badge 
                    color="green" 
                    variant="filled" 
                    size="sm"
                    leftSection={<IconTrophy size={12} />}
                  >
                    ✨ Done
                </Badge>
              )}
            </Group>
            
              <Title 
                order={2} 
                size="1.5rem" 
                fw={600}
                c={isDark ? 'white' : 'dark'}
              >
                {module.title}
              </Title>
          </Stack>
          </Group>

          <Group gap="xs">
            <ThemeToggle />
          <Button
              size="md"
              color={localCompleted ? "green" : getModuleColor()}
            variant={localCompleted ? "light" : "filled"}
              leftSection={localCompleted ? <IconTrophy size={16} /> : <IconClock size={16} />}
            onClick={handleToggleComplete}
          >
              {localCompleted ? "✅ Done" : "Complete"}
          </Button>
          </Group>
        </Group>
      </Card>

      {/* Streamlined Content Area */}
      <div 
        style={{ 
          minHeight: '50vh',
          background: isDark 
            ? 'rgba(31, 41, 55, 0.3)'
            : 'rgba(249, 250, 251, 0.5)',
          borderRadius: '8px',
          padding: '1rem'
        }}
      >
        {module.contentType === 'READING' && (
          <ReadingContent content={module.content} />
        )}
        
        {module.contentType === 'VIDEO' && (
          <VideoContent content={module.content} />
        )}
        
        {module.contentType === 'QUIZ' && (
          <QuizContent content={module.content} />
        )}
      </div>
    </Stack>
  );
}

// Compact Text-to-Speech Component with ElevenLabs
function CompactTextToSpeech({ text }: { text: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  // Free tier voices - these are available on ElevenLabs free plan
  const VOICE_IDS = [
    'pNInz6obpgDQGcFmaJgB', // Adam - Free tier voice
    'EXAVITQu4vr4xnSDxMaL', // Bella - Free tier voice  
    'VR6AewLTigWG4xSOukaG', // Arnold - Free tier voice
    'TxGEqnHWrfWFTfGW9XjX'  // Josh - Free tier voice
  ];

  const getCleanText = (markdown: string) => {
    return markdown
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^-\s*/gm, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  };

  const handleElevenLabsTTS = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const cleanText = getCleanText(text);
      const voiceId = VOICE_IDS[0]; // Use first voice ID

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1', // Free tier compatible model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75, // Slightly higher for clearer free tier voices
          },
        }),
      });
      console.log(response);

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onpause = () => setIsPlaying(false);
        
        await audioRef.current.play();
      } else {
        throw new Error(`ElevenLabs API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      alert('Failed to generate speech. Please check your ElevenLabs API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if no API key is available
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  return (
    <Tooltip label={isPlaying ? "Stop AI audio" : "Listen with ElevenLabs AI voice"}>
      <ActionIcon
        size="sm"
        variant="light"
        loading={isLoading}
        onClick={handleElevenLabsTTS}
        color={isPlaying ? "red" : "indigo"}
      >
        {isPlaying ? <IconVolumeOff size={14} /> : <IconMicrophone size={14} />}
      </ActionIcon>
    </Tooltip>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Tooltip label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <ActionIcon
        variant="light"
        color={dark ? 'yellow' : 'blue'}
        onClick={() => toggleColorScheme()}
        size="sm"
      >
        {dark ? <IconSun size={14} /> : <IconMoon size={14} />}
      </ActionIcon>
    </Tooltip>
  );
}

// Reading Content Component with Reduced Spacing
function ReadingContent({ content }: { content: unknown }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const contentRef = useRef<HTMLDivElement>(null);

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Alert color="yellow" title="Content Not Available">
        Reading content is being generated. Please check back later.
      </Alert>
    );
  }

  // Check for new blog content structure
  if ('blogContent' in content) {
    const blogContent = content as { 
      blogContent: string; 
      summary: string; 
      readingTime: string;
    };

    return (
      <Stack gap="md">
        {/* Compact Header with Controls */}
        <Group justify="space-between" align="center" p="sm" style={{
          background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)',
          borderRadius: '8px',
          border: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid var(--mantine-color-gray-3)'
        }}>
          <Group gap="sm">
            <Badge color="blue" variant="light" size="xs" leftSection={<IconClock size={10} />}>
              {blogContent.readingTime}
            </Badge>
            <Badge color="green" variant="light" size="xs">
              📖 Article
            </Badge>
          </Group>
          
          <Group gap="xs">
            <CompactTextToSpeech text={blogContent.blogContent} />
            <ThemeToggle />
          </Group>
        </Group>

        {/* Compact Summary */}
        {blogContent.summary && (
          <Alert 
            color="blue" 
            variant="light"
            title="Summary" 
            icon={<IconFileText size={14} />}
            styles={{
              root: { padding: '12px' },
              title: { fontSize: '14px' },
              message: { fontSize: '13px' }
            }}
          >
            {blogContent.summary}
          </Alert>
        )}

        {/* Optimized Blog Content */}
        <TypographyStylesProvider>
          <div 
            ref={contentRef}
            style={{ 
              lineHeight: 1.6,
              fontSize: '16px',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: 'auto',
            }}
            dangerouslySetInnerHTML={{ 
              __html: blogContent.blogContent
                .replace(/^# /gm, `<h1 style="font-size: 1.75rem; font-weight: 700; margin: 1.5rem 0 1rem 0; color: ${isDark ? '#fff' : '#000'}; line-height: 1.3;">`)
                .replace(/\n# /g, `</h1>\n<h1 style="font-size: 1.75rem; font-weight: 700; margin: 1.5rem 0 1rem 0; color: ${isDark ? '#fff' : '#000'}; line-height: 1.3;">`)
                .replace(/^## /gm, `<h2 style="font-size: 1.4rem; font-weight: 600; margin: 1.25rem 0 0.75rem 0; color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'}; line-height: 1.4;">`)
                .replace(/\n## /g, `</h2>\n<h2 style="font-size: 1.4rem; font-weight: 600; margin: 1.25rem 0 0.75rem 0; color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'}; line-height: 1.4;">`)
                .replace(/^### /gm, `<h3 style="font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.4;">`)  
                .replace(/\n### /g, `</h3>\n<h3 style="font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.4;">`)
                .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 600; color: ${isDark ? '#fff' : '#000'};">$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em style="font-style: italic; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};">$1</em>`)
                .replace(/^- /gm, `<li style="margin-bottom: 0.25rem; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
                .replace(/\n- /g, `</li>\n<li style="margin-bottom: 0.25rem; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
                .replace(/\n\n/g, `</p>\n<p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6; color: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'}; text-align: justify; text-justify: inter-word;">`)
                .replace(/^(?!<)/gm, `<p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6; color: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'}; text-align: justify; text-justify: inter-word;">`)
                .replace(/(?<!>)$/gm, '</p>')
                .replace(/<p[^>]*><\/p>/g, '')
                .replace(/<p[^>]*><h/g, '<h')
                .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
                .replace(/<p[^>]*><li>/g, `<ul style="margin-bottom: 1rem; margin-top: 0.25rem; padding-left: 1.5rem; list-style-type: disc;"><li style="margin-bottom: 0.25rem; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
                .replace(/<\/li><\/p>/g, '</li></ul>')
            }}
          />
        </TypographyStylesProvider>
      </Stack>
    );
  }

  // Legacy support for old content structure
  if ('sections' in content) {
  const readingContent = content as { 
    introduction?: string; 
    sections: Array<{ title: string; content: string }>; 
    keyTakeaways?: string[] 
  };

  return (
    <Stack gap="lg">
      {readingContent.introduction && (
        <Alert color="blue" title="Introduction" icon={<IconFileText size={16} />}>
          {readingContent.introduction}
        </Alert>
      )}

      <TypographyStylesProvider>
        <Stack gap="xl">
          {readingContent.sections.map((section, index: number) => (
            <div key={index}>
              <Title order={3} mb="md">{section.title}</Title>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {section.content}
              </Text>
              {index < readingContent.sections.length - 1 && <Divider my="xl" />}
            </div>
          ))}
        </Stack>
      </TypographyStylesProvider>

      {readingContent.keyTakeaways && (
        <Card withBorder padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
          <Title order={4} mb="sm" c="green">Key Takeaways</Title>
          <Stack gap="xs">
            {readingContent.keyTakeaways.map((takeaway: string, index: number) => (
              <Group key={index} align="flex-start" gap="sm">
                <IconCheck size={16} color="var(--mantine-color-green-6)" style={{ marginTop: 2 }} />
                <Text size="sm">{takeaway}</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
    );
  }

  return (
    <Alert color="yellow" title="Content Not Available">
      Reading content is being generated. Please check back later.
    </Alert>
  );
}

// Video Content Component  
function VideoContent({ content }: { content: unknown }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Stack gap="lg" align="center" justify="center" style={{ minHeight: '50vh' }}>
        <IconPlayerPlay size={64} color={isDark ? 'red.4' : 'red.5'} />
        <Alert color="yellow" title="Video Not Available">
          Video content is being prepared. Please check back later.
        </Alert>
      </Stack>
    );
  }

  // Check for new "coming soon" structure
  if ('status' in content && content.status === 'coming_soon') {
    const comingSoonContent = content as {
      title: string;
      status: string;
      message: string;
      description: string;
      expectedDuration: string;
      comingSoonContent: string;
    };

    return (
      <Stack gap="lg">
        <Stack gap="lg" align="center" justify="center" style={{ minHeight: '20vh' }}>
          <IconPlayerPlay size={64} color="var(--mantine-color-red-5)" />
          <Title order={3} ta="center">{comingSoonContent.message}</Title>
        </Stack>

        <Alert color="blue" title="Video Coming Soon" icon={<IconPlayerPlay size={16} />}>
          <Stack gap="sm">
            <Text>{comingSoonContent.description}</Text>
            <Group gap="md">
              <Badge color="red" variant="light" leftSection={<IconClock size={12} />}>
                {comingSoonContent.expectedDuration}
              </Badge>
            </Group>
          </Stack>
        </Alert>

        {/* Coming soon content with markdown support */}
        <TypographyStylesProvider>
          <div 
            style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ 
              __html: comingSoonContent.comingSoonContent
                .replace(/^# /gm, '<h1>')
                .replace(/\n# /g, '</h1>\n<h1>')
                .replace(/^## /gm, '<h2>')
                .replace(/\n## /g, '</h2>\n<h2>')
                .replace(/^### /gm, '<h3>')  
                .replace(/\n### /g, '</h3>\n<h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^- /gm, '<li>')
                .replace(/\n- /g, '</li>\n<li>')
                .replace(/\n\n/g, '</p>\n<p>')
                .replace(/^(?!<)/gm, '<p>')
                .replace(/(?<!>)$/gm, '</p>')
                .replace(/<p><\/p>/g, '')
                .replace(/<p><h/g, '<h')
                .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
                .replace(/<p><li>/g, '<ul><li>')
                .replace(/<\/li><\/p>/g, '</li></ul>')
                .replace(/✅/g, '✅')
                .replace(/🔄/g, '🔄')
                .replace(/⏳/g, '⏳')
                .replace(/📝/g, '📝')
            }}
          />
        </TypographyStylesProvider>
      </Stack>
    );
  }

  // Legacy support for old video content structure
  const videoContent = content as { 
        videoUrl?: string; 
        title?: string; 
        duration?: string; 
        description?: string 
  };

  return (
    <Stack gap="lg" align="center" justify="center" style={{ minHeight: '50vh' }}>
      <IconPlayerPlay size={64} color="var(--mantine-color-red-5)" />
      <Title order={3} ta="center" c={isDark ? 'white' : 'dark'}>Video Content</Title>
      
      {videoContent?.videoUrl ? (
        <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px' }}>
          {/* Video player would go here */}
          <Text c={isDark ? 'gray.3' : 'white'} ta="center" style={{ paddingTop: '45%' }}>
            Video Player Placeholder
          </Text>
        </div>
      ) : (
        <Alert color="blue" title="Video Coming Soon" style={{ maxWidth: '500px' }}>
          <Stack gap="sm">
            <Text c={isDark ? 'gray.3' : 'dimmed'}>This video content is being prepared for you.</Text>
            {videoContent?.title && 
              <Text size="sm" c={isDark ? 'gray.5' : 'dimmed'}>Topic: {videoContent.title}</Text>}
            {videoContent?.duration && 
              <Text size="sm" c={isDark ? 'gray.5' : 'dimmed'}>Estimated Duration: {videoContent.duration}</Text>}
            {videoContent?.description && 
              <Text size="sm">{videoContent.description}</Text>}
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}

// Quiz Content Component
function QuizContent({ content }: { content: unknown }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Alert color="yellow" title="Quiz Not Available">
        Quiz content is being generated. Please check back later.
      </Alert>
    );
  }

  // Check for questions array first
  if (!('questions' in content) || !Array.isArray(content.questions)) {
    return (
      <Stack gap="lg" align="center" justify="center" style={{ minHeight: '40vh' }}>
        <IconQuestionMark size={64} color="var(--mantine-color-green-5)" />
        <Alert color="yellow" title="Quiz Not Available" style={{ maxWidth: '500px' }}>
          <Stack gap="sm">
            <Text>Quiz content is being generated. Please check back later.</Text>
            <Text size="sm" c="dimmed">
              We&apos;re creating engaging questions to test your understanding of this topic.
            </Text>
          </Stack>
        </Alert>
      </Stack>
    );
  }

  // Type guard for quiz content - handle both old and new field names
  const quizContent = content as { 
    introduction?: string; 
    totalQuestions?: number;
    estimatedTime?: string;
    difficulty?: string;
    questions: Array<{ 
      question?: string;
      questionText?: string; 
      options: string[]; 
      correctAnswer: string; 
      explanation?: string 
    }>
  };

  // Normalize question text field name
  const normalizedQuestions = quizContent.questions.map(q => ({
    ...q,
    question: q.questionText ?? q.question ?? 'Question text missing'
  }));

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    normalizedQuestions.forEach((question, index: number) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const allQuestionsAnswered = normalizedQuestions.every((_: unknown, index: number) => selectedAnswers[index] !== undefined);

  return (
    <Stack gap="lg">
      {/* Quiz Header with Meta Information */}
      <Card withBorder padding="lg" radius="md" style={{ background: isDark ? 'var(--mantine-color-dark-5)' : 'linear-gradient(135deg, var(--mantine-color-green-0) 0%, var(--mantine-color-blue-0) 100%)' }}>
        <Stack gap="sm">
      {quizContent.introduction && (
            <Text size="lg" fw={500} c={isDark ? 'green.3' : 'green.8'}>
          {quizContent.introduction}
            </Text>
          )}
          
          <Group gap="md">
            <Badge color="green" variant="light" leftSection={<IconQuestionMark size={12} />}>
              {quizContent.totalQuestions ?? normalizedQuestions.length} Questions
            </Badge>
            {quizContent.estimatedTime && (
              <Badge color="blue" variant="light" leftSection={<IconClock size={12} />}>
                {quizContent.estimatedTime}
              </Badge>
            )}
            {quizContent.difficulty && (
              <Badge color="orange" variant="light">
                {quizContent.difficulty}
              </Badge>
            )}
          </Group>
          
          {!showResults && (
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Progress: {Object.keys(selectedAnswers).length} / {normalizedQuestions.length} answered
              </Text>
              <Progress 
                value={(Object.keys(selectedAnswers).length / normalizedQuestions.length) * 100} 
                size="sm" 
                color="green"
                style={{ flex: 1, maxWidth: '200px' }}
              />
            </Group>
          )}
        </Stack>
      </Card>

      {!showResults ? (
        <>
          <Stack gap="xl">
            {normalizedQuestions.map((question, questionIndex: number) => (
              <Card 
                key={questionIndex} 
                withBorder 
                padding="lg" 
                radius="md"
                style={{
                  background: isDark ? (selectedAnswers[questionIndex] ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-dark-6)') : (selectedAnswers[questionIndex] ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-gray-0)'),
                  borderColor: selectedAnswers[questionIndex] ? 'var(--mantine-color-green-3)' : (isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'),
                  transition: 'none'
                }}
              >
                <Stack gap="md">
                  <Group align="flex-start" gap="sm">
                    <Badge 
                      color={selectedAnswers[questionIndex] ? "green" : "gray"} 
                      variant="light" 
                      size="lg"
                      leftSection={selectedAnswers[questionIndex] ? <IconCheck size={12} /> : null}
                    >
                      Q{questionIndex + 1}
                    </Badge>
                    <Text fw={500} size="lg" style={{ flex: 1 }} c={isDark ? 'white' : 'dark'}>
                      {question.question}
                    </Text>
                  </Group>

                  <Radio.Group
                    value={selectedAnswers[questionIndex] ?? ''}
                    onChange={(value) => handleAnswerSelect(questionIndex, value)}
                  >
                    <Stack gap="sm" ml="md">
                      {question.options.map((option: string, optionIndex: number) => (
                        <Card 
                          key={optionIndex} 
                          padding="sm" 
                          radius="sm" 
                          style={{ 
                            cursor: 'pointer',
                            background: isDark ? (selectedAnswers[questionIndex] === option ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-dark-6)') : (selectedAnswers[questionIndex] === option ? 'var(--mantine-color-green-1)' : 'transparent'),
                            border: selectedAnswers[questionIndex] === option ? '2px solid var(--mantine-color-green-4)' : (isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid var(--mantine-color-gray-3)'),
                            transition: 'none'
                          }}
                          onClick={() => handleAnswerSelect(questionIndex, option)}
                        >
                          <Radio 
                            value={option} 
                            label={option} 
                            size="md"
                            color={isDark ? 'white' : 'dark'}
                          />
                        </Card>
                      ))}
                    </Stack>
                  </Radio.Group>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Group justify="center" mt="xl">
            <Button
              size="xl"
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              leftSection={<IconTrophy size={20} />}
              color={allQuestionsAnswered ? "green" : "gray"}
            >
              {allQuestionsAnswered ? 'Submit Quiz & See Results!' : `Answer ${normalizedQuestions.length - Object.keys(selectedAnswers).length} more questions`}
            </Button>
          </Group>
        </>
      ) : (
        <Stack gap="lg" align="center">
          {/* Enhanced Results Card */}
          <Card 
            withBorder 
            padding="xl" 
            radius="md" 
            style={{ 
              textAlign: 'center', 
              maxWidth: '600px',
              background: isDark ? (score === normalizedQuestions.length ? 'var(--mantine-color-dark-5)' : score > normalizedQuestions.length / 2 ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-dark-6)') : (score === normalizedQuestions.length ? 'var(--mantine-color-green-1)' : score > normalizedQuestions.length / 2 ? 'var(--mantine-color-yellow-1)' : 'var(--mantine-color-red-1)')
            }}
          >
            <Stack gap="lg" align="center">
              <div style={{ position: 'relative' }}>
                <IconTrophy size={64} color={
                  score === normalizedQuestions.length ? 'var(--mantine-color-green-6)' :
                  score > normalizedQuestions.length / 2 ? 'var(--mantine-color-yellow-6)' :
                  'var(--mantine-color-red-6)'
                } />
                {score === normalizedQuestions.length && (
                  <Text size="4xl" style={{ position: 'absolute', top: '-10px', right: '-10px' }}>🎉</Text>
                )}
              </div>
              
              <Title order={1} size="2rem" fw={700} c={isDark ? 'white' : 'dark'}>
                {score === normalizedQuestions.length 
                  ? "Perfect Score! 🌟" 
                  : score > normalizedQuestions.length / 2 
                    ? "Great Job! 👍" 
                    : "Keep Learning! 💪"}
              </Title>
              
              <Group gap="xl" justify="center">
                <Stack align="center" gap="xs">
                  <Text size="4xl" fw={900} c={isDark ? (score === normalizedQuestions.length ? 'green.3' : score > normalizedQuestions.length / 2 ? 'yellow.3' : 'red.3') : (score === normalizedQuestions.length ? 'green' : score > normalizedQuestions.length / 2 ? 'yellow.7' : 'red')}>
                    {score}
                  </Text>
                  <Text size="lg" fw={500} c="dimmed">Correct</Text>
                </Stack>
                
                <Text size="3xl" c="dimmed" fw={300}>/</Text>
                
                <Stack align="center" gap="xs">
                  <Text size="4xl" fw={900}>
                    {normalizedQuestions.length}
                  </Text>
                  <Text size="lg" fw={500} c="dimmed">Total</Text>
                </Stack>
              </Group>

              <Stack gap="sm" style={{ width: '100%' }}>
                <Text size="lg" fw={500} c="dimmed">
                  Score: {Math.round((score / normalizedQuestions.length) * 100)}%
                </Text>
              <Progress 
                  value={(score / normalizedQuestions.length) * 100} 
                  size="xl" 
                  radius="xl"
                  color={score === normalizedQuestions.length ? 'green' : score > normalizedQuestions.length / 2 ? 'yellow' : 'red'}
                style={{ width: '100%' }}
              />
              </Stack>

              <Text size="xl" fw={500} ta="center" style={{ maxWidth: '400px' }}>
                {score === normalizedQuestions.length 
                  ? "Outstanding! You&apos;ve mastered this topic completely! 🎓" 
                  : score > normalizedQuestions.length / 2 
                    ? "Well done! You have a solid understanding of the material. 📚" 
                    : "Don&apos;t worry! Review the material and try again. Every attempt makes you stronger! 🚀"}
              </Text>
            </Stack>
          </Card>

          <Group gap="md">
            <Button 
              variant="outline" 
              size="lg"
              leftSection={<IconQuestionMark size={16} />}
              onClick={resetQuiz}
            >
              Retake Quiz
            </Button>
          </Group>

          {/* Enhanced Answer Review */}
          <Card withBorder padding="xl" radius="md" style={{ width: '100%', maxWidth: '900px', background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)' }}>
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Title order={2} c={isDark ? 'white' : 'dark'}>📝 Answer Review</Title>
                <Badge size="lg" color="blue" variant="light">
                  {score}/{normalizedQuestions.length} Correct
                </Badge>
              </Group>
              
              <Stack gap="lg">
                {normalizedQuestions.map((question, index: number) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <Card 
                      key={index} 
                      padding="lg" 
                      radius="md" 
                      withBorder
                      style={{
                        backgroundColor: isDark ? (isCorrect ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-dark-7)') : (isCorrect ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-red-0)'),
                        borderColor: isCorrect ? (isDark ? 'var(--mantine-color-green-9)' : 'var(--mantine-color-green-3)') : (isDark ? 'var(--mantine-color-red-9)' : 'var(--mantine-color-red-3)'),
                        borderWidth: '2px'
                      }}
                    >
            <Stack gap="md">
                        <Group gap="sm" align="flex-start">
                          <Badge 
                            color={isCorrect ? "green" : "red"} 
                            size="lg"
                            leftSection={
                              isCorrect ? 
                                <IconCheck size={14} /> : 
                                <Text size="sm">✗</Text>
                            }
                          >
                            Q{index + 1}
                          </Badge>
                          <Text fw={600} size="lg" style={{ flex: 1 }} c={isDark ? 'white' : 'dark'}>
                            {question.question}
                          </Text>
                    </Group>
                        
                        <Card padding="md" radius="sm" style={{ backgroundColor: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)' }}>
                          <Stack gap="xs">
                            <Text size="md" fw={500} c={isDark ? 'gray.3' : 'dark'}>
                              Your answer: <span style={{ color: isDark ? (isCorrect ? 'green.3' : 'red.3') : (isCorrect ? 'var(--mantine-color-green-7)' : 'var(--mantine-color-red-7)'), fontWeight: 700 }}>
                                {selectedAnswers[index]}
                              </span>
                    </Text>
                            
                            {!isCorrect && (
                              <Text size="md" fw={500} c={isDark ? 'gray.3' : 'dark'}>
                                Correct answer: <span style={{ color: isDark ? 'green.3' : 'var(--mantine-color-green-7)', fontWeight: 700 }}>
                                  {question.correctAnswer}
                                </span>
                      </Text>
                    )}
                            
                    {question.explanation && (
                              <Alert color={isCorrect ? "green" : "blue"} title="💡 Explanation" mt="sm">
                                <Text size="sm" c={isDark ? 'gray.3' : 'dimmed'}>{question.explanation}</Text>
                              </Alert>
                    )}
                  </Stack>
                </Card>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}