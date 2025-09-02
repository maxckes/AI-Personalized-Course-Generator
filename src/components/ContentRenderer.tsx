"use client";

import {
  Space,
  Typography,
  Button,
  Card,
  Badge as AntBadge,
  Radio,
  Progress,
  Alert,
  Tooltip,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  AudioOutlined,
  SunOutlined,
  MoonOutlined,
  AudioMutedOutlined
} from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';

const { Title, Text } = Typography;

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
  const [isDark] = useState(false);

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
        return <FileTextOutlined style={{ fontSize: '20px' }} />;
      case 'VIDEO':
        return <PlayCircleOutlined style={{ fontSize: '20px' }} />;
      case 'QUIZ':
        return <QuestionCircleOutlined style={{ fontSize: '20px' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: '20px' }} />;
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
    <Space direction="vertical" size="middle">
      {/* Compact Module Header with Theme Toggle */}
      <Card
        style={{
          background: isDark ? '#1a1a1a' : `linear-gradient(135deg, ${getModuleColor() === 'blue' ? '#e6f7ff' : getModuleColor() === 'red' ? '#fff2f0' : getModuleColor() === 'green' ? '#f6ffed' : '#fafafa'} 0%, #ffffff 100%)`,
          borderColor: localCompleted ? '#52c41a' : (getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#d9d9d9'),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center">
            <div style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#2a2a2a' : (getModuleColor() === 'blue' ? '#bae7ff' : getModuleColor() === 'red' ? '#ffccc7' : getModuleColor() === 'green' ? '#d9f7be' : '#f0f0f0'),
              border: isDark ? '1px solid #404040' : `1px solid ${getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#d9d9d9'}`
            }}>
              {getModuleIcon()}
            </div>

            <Space direction="vertical" size={4}>
              <Space>
                <AntBadge
                  count={module.contentType.toLowerCase()}
                  style={{
                    backgroundColor: getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#6b7280'
                  }}
                />

                {localCompleted && (
                  <AntBadge
                    count="✨ Done"
                    style={{ backgroundColor: '#52c41a' }}
                  />
                )}
              </Space>

              <Title
                level={2}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: isDark ? 'white' : 'black',
                  margin: 0
                }}
              >
                {module.title}
              </Title>
            </Space>
          </Space>

          <Space>
            <ThemeToggle />
            <Button
              type={localCompleted ? "default" : "primary"}
              icon={localCompleted ? <TrophyOutlined /> : <ClockCircleOutlined />}
              onClick={handleToggleComplete}
              style={{
                backgroundColor: localCompleted ? '#52c41a' : undefined,
                borderColor: localCompleted ? '#52c41a' : undefined
              }}
            >
              {localCompleted ? "✅ Done" : "Complete"}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Streamlined Content Area */}
      <div
        style={{
          minHeight: '50vh',
          background: isDark
            ? 'rgba(31, 41, 55, 0.3)'
            : 'rgba(249, 250, 251, 0.5)',
          borderRadius: '8px',
          padding: '16px'
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
    </Space>
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
    <Tooltip title={isPlaying ? "Stop AI audio" : "Listen with ElevenLabs AI voice"}>
      <Button
        size="small"
        type="text"
        loading={isLoading}
        onClick={handleElevenLabsTTS}
        icon={isPlaying ? <AudioMutedOutlined /> : <AudioOutlined />}
        style={{ color: isPlaying ? '#ff4d4f' : '#1c7ed6' }}
      />
    </Tooltip>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    message.info(isDark ? 'Switched to light mode' : 'Switched to dark mode');
  };

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        size="small"
      />
    </Tooltip>
  );
}

// Reading Content Component with Reduced Spacing
function ReadingContent({ content }: { content: unknown }) {
  const [isDark] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Alert
        message="Content Not Available"
        description="Reading content is being generated. Please check back later."
        type="warning"
        showIcon
      />
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
      <Space direction="vertical" size="middle">
        {/* Compact Header with Controls */}
        <Card size="small" style={{
          background: isDark ? '#1a1a1a' : '#fafafa',
          borderColor: isDark ? '#404040' : '#d9d9d9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <AntBadge
                count={blogContent.readingTime}
                style={{ backgroundColor: '#1c7ed6' }}
              />
              <AntBadge
                count="📖 Article"
                style={{ backgroundColor: '#52c41a' }}
              />
            </Space>

            <Space>
              <CompactTextToSpeech text={blogContent.blogContent} />
              <ThemeToggle />
            </Space>
          </div>
        </Card>

        {/* Compact Summary */}
        {blogContent.summary && (
          <Alert
            message="Summary"
            description={blogContent.summary}
            type="info"
            showIcon
            style={{ padding: '12px' }}
          />
        )}

        {/* Optimized Blog Content */}
        <div>
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
        </div>
      </Space>
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
    <Space direction="vertical" size="large">
      {readingContent.introduction && (
        <Alert message="Introduction" description={readingContent.introduction} type="info" showIcon />
      )}

      <div>
        <Space direction="vertical" size="large">
          {readingContent.sections.map((section, index: number) => (
            <div key={index}>
              <Title level={3} style={{ marginBottom: '16px' }}>{section.title}</Title>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {section.content}
              </Text>
            </div>
          ))}
        </Space>
      </div>

      {readingContent.keyTakeaways && (
        <Card bordered style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Title level={4} style={{ marginBottom: '12px', color: '#52c41a' }}>Key Takeaways</Title>
          <Space direction="vertical" size="small">
            {readingContent.keyTakeaways.map((takeaway: string, index: number) => (
              <Space key={index} align="start">
                <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                <Text>{takeaway}</Text>
              </Space>
            ))}
          </Space>
        </Card>
      )}
    </Space>
    );
  }

  return (
    <Alert message="Content Not Available" description="Reading content is being generated. Please check back later." type="warning" showIcon />
  );
}

// Video Content Component
function VideoContent({ content }: { content: unknown }) {
  const [isDark] = useState(false);

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <PlayCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
        <Alert message="Video Not Available" description="Video content is being prepared. Please check back later." type="warning" showIcon />
      </Space>
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
      <Space direction="vertical" size="large">
        <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20vh' }}>
          <PlayCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
          <Title level={3} style={{ textAlign: 'center' }}>{comingSoonContent.message}</Title>
        </Space>

        <Alert message="Video Coming Soon" description={
          <Space direction="vertical" size="small">
            <Text>{comingSoonContent.description}</Text>
            <Space>
              <AntBadge count={comingSoonContent.expectedDuration} style={{ backgroundColor: '#ff4d4f' }} />
            </Space>
          </Space>
        } type="info" showIcon />

        {/* Coming soon content with markdown support */}
        <div>
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
        </div>
      </Space>
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
    <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <PlayCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
      <Title level={3} style={{ textAlign: 'center', color: isDark ? 'white' : 'black' }}>Video Content</Title>

      {videoContent?.videoUrl ? (
        <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px' }}>
          {/* Video player would go here */}
          <Text style={{ color: isDark ? '#d1d5db' : 'white', textAlign: 'center', paddingTop: '45%' }}>
            Video Player Placeholder
          </Text>
        </div>
      ) : (
        <Alert message="Video Coming Soon" description={
          <Space direction="vertical" size="small" style={{ maxWidth: '500px' }}>
            <Text style={{ color: isDark ? '#d1d5db' : '#8c8c8c' }}>This video content is being prepared for you.</Text>
            {videoContent?.title &&
              <Text style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#8c8c8c' }}>Topic: {videoContent.title}</Text>}
            {videoContent?.duration &&
              <Text style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#8c8c8c' }}>Estimated Duration: {videoContent.duration}</Text>}
            {videoContent?.description &&
              <Text style={{ fontSize: '14px' }}>{videoContent.description}</Text>}
          </Space>
        } type="info" showIcon />
      )}
    </Space>
  );
}

// Quiz Content Component
function QuizContent({ content }: { content: unknown }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isDark] = useState(false);

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Alert message="Quiz Not Available" description="Quiz content is being generated. Please check back later." type="warning" showIcon />
    );
  }

  // Check for questions array first
  if (!('questions' in content) || !Array.isArray(content.questions)) {
    return (
      <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <QuestionCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
        <Alert message="Quiz Not Available" description={
          <Space direction="vertical" size="small" style={{ maxWidth: '500px' }}>
            <Text>Quiz content is being generated. Please check back later.</Text>
            <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
              We&apos;re creating engaging questions to test your understanding of this topic.
            </Text>
          </Space>
        } type="warning" showIcon />
      </Space>
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
    <Space direction="vertical" size="large">
      {/* Quiz Header with Meta Information */}
      <Card bordered bodyStyle={{ padding: '24px' }} style={{ background: isDark ? '#1a1a1a' : 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)' }}>
        <Space direction="vertical" size="small">
      {quizContent.introduction && (
            <Text style={{ fontSize: '18px', fontWeight: 500, color: isDark ? '#d9f7be' : '#52c41a' }}>
          {quizContent.introduction}
            </Text>
          )}

          <Space>
            <AntBadge count={`${quizContent.totalQuestions ?? normalizedQuestions.length} Questions`} style={{ backgroundColor: '#52c41a' }} />
            {quizContent.estimatedTime && (
              <AntBadge count={quizContent.estimatedTime} style={{ backgroundColor: '#1c7ed6' }} />
            )}
            {quizContent.difficulty && (
              <AntBadge count={quizContent.difficulty} style={{ backgroundColor: '#fa8c16' }} />
            )}
          </Space>

          {!showResults && (
            <Space>
              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                Progress: {Object.keys(selectedAnswers).length} / {normalizedQuestions.length} answered
              </Text>
              <Progress
                percent={(Object.keys(selectedAnswers).length / normalizedQuestions.length) * 100}
                size="small"
                strokeColor="#52c41a"
                style={{ flex: 1, maxWidth: '200px' }}
              />
            </Space>
          )}
        </Space>
      </Card>

      {!showResults ? (
        <>
          <Space direction="vertical" size="large">
            {normalizedQuestions.map((question, questionIndex: number) => (
              <Card
                key={questionIndex}
                bordered
                bodyStyle={{ padding: '24px' }}
                style={{
                  background: isDark ? (selectedAnswers[questionIndex] ? '#262626' : '#1a1a1a') : (selectedAnswers[questionIndex] ? '#f6ffed' : '#fafafa'),
                  borderColor: selectedAnswers[questionIndex] ? '#b7eb8f' : (isDark ? '#404040' : '#d9d9d9'),
                  transition: 'none'
                }}
              >
                <Space direction="vertical" size="middle">
                  <Space align="start">
                    <AntBadge
                      count={`Q${questionIndex + 1}`}
                      style={{
                        backgroundColor: selectedAnswers[questionIndex] ? '#52c41a' : '#d9d9d9',
                        color: selectedAnswers[questionIndex] ? 'white' : 'black'
                      }}
                    />
                    <Text style={{ flex: 1, fontWeight: 500, fontSize: '18px', color: isDark ? 'white' : 'black' }}>
                      {question.question}
                    </Text>
                  </Space>

                  <Radio.Group
                    value={selectedAnswers[questionIndex] ?? ''}
                    onChange={(e) => handleAnswerSelect(questionIndex, String(e.target.value))}
                  >
                    <Space direction="vertical" size="small" style={{ marginLeft: '16px' }}>
                      {question.options.map((option: string, optionIndex: number) => (
                        <Card
                          key={optionIndex}
                          bodyStyle={{ padding: '12px' }}
                          style={{
                            cursor: 'pointer',
                            background: isDark ? (selectedAnswers[questionIndex] === option ? '#262626' : '#1a1a1a') : (selectedAnswers[questionIndex] === option ? '#f0f9ff' : 'transparent'),
                            border: selectedAnswers[questionIndex] === option ? '2px solid #52c41a' : (isDark ? '1px solid #404040' : '1px solid #d9d9d9'),
                            transition: 'none'
                          }}
                          onClick={() => handleAnswerSelect(questionIndex, option)}
                        >
                          <Radio
                            value={option}
                          >
                            {option}
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>
                </Space>
              </Card>
            ))}
          </Space>

          <Space style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
            <Button
              size="large"
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              icon={<TrophyOutlined />}
              style={{
                backgroundColor: allQuestionsAnswered ? '#52c41a' : undefined,
                borderColor: allQuestionsAnswered ? '#52c41a' : undefined
              }}
            >
              {allQuestionsAnswered ? 'Submit Quiz & See Results!' : `Answer ${normalizedQuestions.length - Object.keys(selectedAnswers).length} more questions`}
            </Button>
          </Space>
        </>
      ) : (
        <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Enhanced Results Card */}
          <Card
            bordered
            bodyStyle={{ padding: '48px' }}
            style={{
              textAlign: 'center',
              maxWidth: '600px',
              background: isDark ? (score === normalizedQuestions.length ? '#262626' : score > normalizedQuestions.length / 2 ? '#1a1a1a' : '#141414') : (score === normalizedQuestions.length ? '#f6ffed' : score > normalizedQuestions.length / 2 ? '#fff7e6' : '#fff2f0')
            }}
          >
            <Space direction="vertical" size="large" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <TrophyOutlined style={{
                  fontSize: '64px',
                  color: score === normalizedQuestions.length ? '#52c41a' :
                         score > normalizedQuestions.length / 2 ? '#fa8c16' : '#ff4d4f'
                }} />
                {score === normalizedQuestions.length && (
                  <Text style={{ fontSize: '36px', position: 'absolute', top: '-10px', right: '-10px' }}>🎉</Text>
                )}
              </div>

              <Title level={1} style={{ fontSize: '2rem', fontWeight: 700, color: isDark ? 'white' : 'black' }}>
                {score === normalizedQuestions.length
                  ? "Perfect Score! 🌟"
                  : score > normalizedQuestions.length / 2
                    ? "Great Job! 👍"
                    : "Keep Learning! 💪"}
              </Title>
              
              <Space style={{ gap: '48px', justifyContent: 'center' }}>
                <Space direction="vertical" size="small" style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: '36px',
                    fontWeight: 900,
                    color: isDark ? (score === normalizedQuestions.length ? '#d9f7be' : score > normalizedQuestions.length / 2 ? '#ffe58f' : '#ffccc7') : (score === normalizedQuestions.length ? '#52c41a' : score > normalizedQuestions.length / 2 ? '#fa8c16' : '#ff4d4f')
                  }}>
                    {score}
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 500, color: '#8c8c8c' }}>Correct</Text>
                </Space>

                <Text style={{ fontSize: '28px', color: '#8c8c8c', fontWeight: 300 }}>/</Text>

                <Space direction="vertical" size="small" style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: '36px', fontWeight: 900 }}>
                    {normalizedQuestions.length}
                  </Text>
                  <Text style={{ fontSize: '18px', fontWeight: 500, color: '#8c8c8c' }}>Total</Text>
                </Space>
              </Space>

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text style={{ fontSize: '18px', fontWeight: 500, color: '#8c8c8c' }}>
                  Score: {Math.round((score / normalizedQuestions.length) * 100)}%
                </Text>
              <Progress
                  percent={(score / normalizedQuestions.length) * 100}
                  strokeColor={score === normalizedQuestions.length ? '#52c41a' : score > normalizedQuestions.length / 2 ? '#fa8c16' : '#ff4d4f'}
                  style={{ width: '100%' }}
                />
              </Space>

              <Text style={{ fontSize: '20px', fontWeight: 500, textAlign: 'center', maxWidth: '400px' }}>
                {score === normalizedQuestions.length
                  ? "Outstanding! You&apos;ve mastered this topic completely! 🎓"
                  : score > normalizedQuestions.length / 2
                    ? "Well done! You have a solid understanding of the material. 📚"
                    : "Don&apos;t worry! Review the material and try again. Every attempt makes you stronger! 🚀"}
              </Text>
            </Space>
          </Card>

          <Space>
            <Button
              onClick={resetQuiz}
              icon={<QuestionCircleOutlined />}
            >
              Retake Quiz
            </Button>
          </Space>

          {/* Enhanced Answer Review */}
          <Card bordered bodyStyle={{ padding: '48px' }} style={{ width: '100%', maxWidth: '900px', background: isDark ? '#1a1a1a' : '#fafafa' }}>
            <Space direction="vertical" size="large">
              <Space style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ color: isDark ? 'white' : 'black' }}>📝 Answer Review</Title>
                <AntBadge count={`${score}/${normalizedQuestions.length} Correct`} style={{ backgroundColor: '#1c7ed6' }} />
              </Space>

              <Space direction="vertical" size="large">
                {normalizedQuestions.map((question, index: number) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <Card
                      key={index}
                      bodyStyle={{ padding: '24px' }}
                      bordered
                      style={{
                        backgroundColor: isDark ? (isCorrect ? '#262626' : '#141414') : (isCorrect ? '#f6ffed' : '#fff2f0'),
                        borderColor: isCorrect ? (isDark ? '#52c41a' : '#b7eb8f') : (isDark ? '#ff4d4f' : '#ffccc7'),
                        borderWidth: '2px'
                      }}
                    >
            <Space direction="vertical" size="middle">
                        <Space align="start" style={{ gap: '12px' }}>
                          <AntBadge
                            count={`Q${index + 1}`}
                            style={{
                              backgroundColor: isCorrect ? '#52c41a' : '#ff4d4f',
                              color: 'white'
                            }}
                          />
                          <Text style={{ flex: 1, fontWeight: 600, fontSize: '18px', color: isDark ? 'white' : 'black' }}>
                            {question.question}
                          </Text>
                    </Space>

                        <Card bodyStyle={{ padding: '16px' }} style={{ backgroundColor: isDark ? '#262626' : '#fafafa' }}>
                          <Space direction="vertical" size="small">
                            <Text style={{ fontSize: '16px', fontWeight: 500, color: isDark ? '#d1d5db' : 'black' }}>
                              Your answer: <span style={{ color: isDark ? (isCorrect ? '#d9f7be' : '#ffccc7') : (isCorrect ? '#52c41a' : '#ff4d4f'), fontWeight: 700 }}>
                                {selectedAnswers[index]}
                              </span>
                    </Text>

                            {!isCorrect && (
                              <Text style={{ fontSize: '16px', fontWeight: 500, color: isDark ? '#d1d5db' : 'black' }}>
                                Correct answer: <span style={{ color: isDark ? '#d9f7be' : '#52c41a', fontWeight: 700 }}>
                                  {question.correctAnswer}
                                </span>
                      </Text>
                    )}

                    {question.explanation && (
                              <Alert message="💡 Explanation" description={question.explanation} type={isCorrect ? "success" : "info"} showIcon style={{ marginTop: '12px' }} />
                    )}
                  </Space>
                </Card>
                      </Space>
                    </Card>
                  );
                })}
              </Space>
            </Space>
          </Card>
        </Space>
      )}
    </Space>
  );
}