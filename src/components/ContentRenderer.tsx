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
import { useTheme } from '~/lib/theme-context';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div style={{
      height: '100%',
      maxHeight: '100%',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: 'clamp(8px, 2vw, 20px)',
      boxSizing: 'border-box'
    }}>
      {/* Responsive Module Header with Theme Toggle */}
      <Card
        className="content-header-card"
        style={{
          background: isDark ? '#1a1a1a' : `linear-gradient(135deg, ${getModuleColor() === 'blue' ? '#e6f7ff' : getModuleColor() === 'red' ? '#fff2f0' : getModuleColor() === 'green' ? '#f6ffed' : '#fafafa'} 0%, #ffffff 100%)`,
          borderColor: localCompleted ? '#52c41a' : (getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#d9d9d9'),
          width: '100%',
          flexShrink: 0,
          marginBottom: 'clamp(12px, 3vw, 20px)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{
          padding: 'clamp(16px, 4vw, 24px)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'clamp(12px, 3vw, 20px)',
          padding: 'clamp(16px, 4vw, 24px)',
          width: '100%'
        }}>
          <Space align="center" style={{ 
            flex: 1, 
            minWidth: 'clamp(200px, 50vw, 300px)',
            maxWidth: '100%'
          }}>
            <div style={{
              padding: 'clamp(6px, 1.5vw, 10px)',
              borderRadius: '50%',
              backgroundColor: isDark ? '#2a2a2a' : (getModuleColor() === 'blue' ? '#bae7ff' : getModuleColor() === 'red' ? '#ffccc7' : getModuleColor() === 'green' ? '#d9f7be' : '#f0f0f0'),
              border: isDark ? '1px solid #404040' : `1px solid ${getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#d9d9d9'}`,
              flexShrink: 0
            }}>
              {getModuleIcon()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Space direction="vertical" size={['small', 'small']} style={{ width: '100%' }}>
              <Space wrap style={{ gap: 'clamp(4px, 1vw, 8px)' }}>
                <AntBadge
                  count={module.contentType.toLowerCase()}
                  style={{
                    backgroundColor: getModuleColor() === 'blue' ? '#1c7ed6' : getModuleColor() === 'red' ? '#ff4d4f' : getModuleColor() === 'green' ? '#52c41a' : '#6b7280',
                    fontSize: 'clamp(10px, 2vw, 12px)'
                  }}
                />

                {localCompleted && (
                  <AntBadge
                    count="✨ Done"
                    style={{
                      backgroundColor: '#52c41a',
                      fontSize: 'clamp(10px, 2vw, 12px)'
                    }}
                  />
                )}
              </Space>

              <Title
                level={2}
                style={{
                  fontSize: 'clamp(1.2rem, 4.5vw, 1.75rem)',
                  fontWeight: 600,
                  color: isDark ? 'white' : 'black',
                  margin: 0,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}
              >
                {module.title}
              </Title>
              </Space>
            </div>
          </Space>

                    <div style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'clamp(8px, 2vw, 12px)',
            alignItems: 'flex-end',
            minWidth: 'fit-content'
          }}>
            <Space style={{ gap: 'clamp(6px, 1.5vw, 10px)' }}>
              <ThemeToggle />
            </Space>
            <Button
              type={localCompleted ? "default" : "primary"}
              icon={localCompleted ? <TrophyOutlined /> : <ClockCircleOutlined />}
              onClick={handleToggleComplete}
              aria-label={localCompleted ? "Mark module as incomplete" : "Mark module as complete"}
              style={{
                backgroundColor: localCompleted ? '#52c41a' : undefined,
                borderColor: localCompleted ? '#52c41a' : undefined,
                fontSize: 'clamp(13px, 3vw, 16px)',
                height: 'clamp(40px, 8vw, 48px)',
                minWidth: 'clamp(100px, 18vw, 140px)',
                fontWeight: 500
              }}
              size="large"
            >
              <span className="hide-text-mobile">{localCompleted ? "✅ Complete" : "Mark Done"}</span>
              <span className="show-text-mobile" style={{ display: 'none' }}>{localCompleted ? "✅" : "✓"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Responsive Content Area */}
      <div
        className="scrollable-content content-text responsive-content-area"
        style={{
          flex: 1,
          height: '100%',
          maxHeight: '100%',
          background: isDark
            ? 'rgba(31, 41, 55, 0.4)'
            : 'rgba(249, 250, 251, 0.7)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          padding: 'clamp(16px, 4vw, 24px)',
          width: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
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
    </div>
  );
}

// Responsive Text-to-Speech Component with ElevenLabs
function CompactTextToSpeech({ text }: { text: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      const voiceId = VOICE_IDS[0];

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onpause = () => setIsPlaying(false);
        
        await audioRef.current.play();
      } else {
        const errorData = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      // Show user-friendly error message
      message.error('Unable to generate audio. Please check your internet connection and try again.');
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
        size="large"
        type="text"
        loading={isLoading}
        onClick={handleElevenLabsTTS}
        icon={isPlaying ? <AudioMutedOutlined /> : <AudioOutlined />}
        className="responsive-audio-btn"
        style={{
          color: isPlaying ? '#ff4d4f' : '#1c7ed6',
          height: 'clamp(40px, 8vw, 48px)',
          width: 'clamp(40px, 8vw, 48px)',
          minWidth: 'clamp(40px, 8vw, 48px)',
          fontSize: 'clamp(16px, 4vw, 20px)',
          border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      />
    </Tooltip>
  );
}

// Responsive Theme Toggle Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    toggleTheme();
    message.info(theme === 'light' ? 'Switched to dark mode 🌙' : 'Switched to light mode ☀️');
  };

  return (
    <Tooltip title={theme === 'dark' ? "Switch to light mode ☀️" : "Switch to dark mode 🌙"}>
      <Button
        type="text"
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={handleToggle}
        size="large"
        className="responsive-theme-btn"
        style={{
          height: 'clamp(40px, 8vw, 48px)',
          width: 'clamp(40px, 8vw, 48px)',
          minWidth: 'clamp(40px, 8vw, 48px)',
          fontSize: 'clamp(16px, 4vw, 20px)',
          border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      />
    </Tooltip>
  );
}

// Responsive Reading Content Component
function ReadingContent({ content }: { content: unknown }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <Space direction="vertical" size="large" className="responsive-reading-content">
        {/* Responsive Header with Controls */}
        <Card 
          className="reading-header-card"
          style={{
            background: isDark ? '#1a1a1a' : '#fafafa',
            borderColor: isDark ? '#404040' : '#d9d9d9',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            <Space>
              <AntBadge
                count={blogContent.readingTime}
                style={{
                  backgroundColor: '#1c7ed6',
                  fontSize: 'clamp(10px, 2vw, 12px)'
                }}
              />
              <AntBadge
                count="📖 Article"
                style={{
                  backgroundColor: '#52c41a',
                  fontSize: 'clamp(10px, 2vw, 12px)'
                }}
              />
            </Space>

            <Space wrap style={{ gap: 'clamp(6px, 1.5vw, 10px)' }}>
              <CompactTextToSpeech text={blogContent.blogContent} />
            </Space>
          </div>
        </Card>

        {/* Responsive Summary */}
        {blogContent.summary && (
          <Alert
            message="Summary"
            description={blogContent.summary}
            type="info"
            showIcon
            className="reading-summary-alert"
            style={{
              padding: 'clamp(12px, 3vw, 20px)',
              marginBottom: 'clamp(12px, 3vw, 20px)',
              borderRadius: 'clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(15px, 3.5vw, 18px)',
              lineHeight: 1.5
            }}
          />
        )}

        {/* Optimized Blog Content */}
        <div className="reading-content">
          <div
            ref={contentRef}
            className="content-text"
            style={{
              lineHeight: 1.6,
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: 'auto',
              wordSpacing: '0.1em',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{
              __html: blogContent.blogContent
                .replace(/^# /gm, `<h1 style="font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 700; margin: clamp(1rem, 3vw, 1.5rem) 0 clamp(0.75rem, 2vw, 1rem) 0; color: ${isDark ? '#fff' : '#000'}; line-height: 1.3;">`)
                .replace(/\n# /g, `</h1>\n<h1 style="font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 700; margin: clamp(1rem, 3vw, 1.5rem) 0 clamp(0.75rem, 2vw, 1rem) 0; color: ${isDark ? '#fff' : '#000'}; line-height: 1.3;">`)
                .replace(/^## /gm, `<h2 style="font-size: clamp(1.1rem, 3vw, 1.4rem); font-weight: 600; margin: clamp(0.875rem, 2.5vw, 1.25rem) 0 clamp(0.5rem, 1.5vw, 0.75rem) 0; color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'}; line-height: 1.4;">`)
                .replace(/\n## /g, `</h2>\n<h2 style="font-size: clamp(1.1rem, 3vw, 1.4rem); font-weight: 600; margin: clamp(0.875rem, 2.5vw, 1.25rem) 0 clamp(0.5rem, 1.5vw, 0.75rem) 0; color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'}; line-height: 1.4;">`)
                .replace(/^### /gm, `<h3 style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 600; margin: clamp(0.75rem, 2vw, 1rem) 0 clamp(0.375rem, 1vw, 0.5rem) 0; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.4;">`)
                .replace(/\n### /g, `</h3>\n<h3 style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 600; margin: clamp(0.75rem, 2vw, 1rem) 0 clamp(0.375rem, 1vw, 0.5rem) 0; color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.4;">`)
                .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 600; color: ${isDark ? '#fff' : '#000'};">$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em style="font-style: italic; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};">$1</em>`)
                .replace(/^- /gm, `<li style="margin-bottom: clamp(0.25rem, 1vw, 0.5rem); color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
                .replace(/\n- /g, `</li>\n<li style="margin-bottom: clamp(0.25rem, 1vw, 0.5rem); color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
                .replace(/\n\n/g, `</p>\n<p style="margin-bottom: clamp(0.75rem, 2vw, 1rem); font-size: clamp(14px, 3vw, 16px); line-height: 1.6; color: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'}; text-align: justify; text-justify: inter-word;">`)
                .replace(/^(?!<)/gm, `<p style="margin-bottom: clamp(0.75rem, 2vw, 1rem); font-size: clamp(14px, 3vw, 16px); line-height: 1.6; color: ${isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'}; text-align: justify; text-justify: inter-word;">`)
                .replace(/(?<!>)$/gm, '</p>')
                .replace(/<p[^>]*><\/p>/g, '')
                .replace(/<p[^>]*><h/g, '<h')
                .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
                .replace(/<p[^>]*><li>/g, `<ul style="margin-bottom: clamp(0.75rem, 2vw, 1rem); margin-top: clamp(0.25rem, 1vw, 0.5rem); padding-left: clamp(1rem, 3vw, 1.5rem); list-style-type: disc;"><li style="margin-bottom: clamp(0.25rem, 1vw, 0.5rem); color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}; line-height: 1.6;">`)
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

// Responsive Video Content Component
function VideoContent({ content }: { content: unknown }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!content || typeof content !== 'object' || content === null) {
    return (
      <Space direction="vertical" size={['large', 'large']} className="responsive-video-placeholder" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'clamp(250px, 40vh, 350px)',
        padding: 'clamp(20px, 5vw, 40px)',
        textAlign: 'center'
      }}>
        <PlayCircleOutlined style={{
          fontSize: 'clamp(64px, 18vw, 80px)',
          color: '#ff4d4f',
          marginBottom: 'clamp(12px, 3vw, 16px)'
        }} />
        <Alert
          message="Video Not Available"
          description="Video content is being prepared. Please check back later."
          type="warning"
          showIcon
          style={{
            maxWidth: 'clamp(320px, 85vw, 600px)',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            textAlign: 'left'
          }}
        />
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
      <Space direction="vertical" size={['large', 'large']}>
        <Space direction="vertical" size={['large', 'large']} className="responsive-video-coming-soon" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'clamp(180px, 25vh, 220px)',
          padding: 'clamp(20px, 5vw, 40px)',
          textAlign: 'center'
        }}>
          <PlayCircleOutlined style={{
            fontSize: 'clamp(64px, 18vw, 80px)',
            color: '#ff4d4f',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }} />
          <Title
            level={3}
            style={{
              textAlign: 'center',
              fontSize: 'clamp(20px, 5.5vw, 28px)',
              margin: 0,
              fontWeight: 600,
              lineHeight: 1.3
            }}
          >
            {comingSoonContent.message}
          </Title>
        </Space>

        <Alert
          message="Video Coming Soon"
          description={
            <Space direction="vertical" size={['small', 'small']}>
              <Text style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', lineHeight: 1.4 }}>
                {comingSoonContent.description}
              </Text>
              <Space wrap style={{ gap: 'clamp(6px, 1.5vw, 10px)', justifyContent: 'center' }}>
                <AntBadge
                  count={comingSoonContent.expectedDuration}
                  style={{
                    backgroundColor: '#ff4d4f',
                    fontSize: 'clamp(11px, 2.5vw, 14px)'
                  }}
                />
              </Space>
            </Space>
          }
          type="info"
          showIcon
          style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            maxWidth: 'clamp(320px, 85vw, 600px)',
            margin: '0 auto'
          }}
        />

        {/* Responsive coming soon content with markdown support */}
        <div className="video-coming-soon-content" style={{
          marginTop: 'clamp(20px, 5vw, 32px)',
          padding: 'clamp(16px, 4vw, 24px)',
          background: isDark ? 'rgba(26, 26, 26, 0.6)' : 'rgba(249, 250, 251, 0.7)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          border: isDark ? '1px solid #404040' : '1px solid #e5e7eb',
          maxWidth: 'clamp(320px, 90vw, 800px)',
          margin: '0 auto'
        }}>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: 'clamp(15px, 3.5vw, 18px)',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
              textAlign: 'justify'
            }}
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

// Responsive Quiz Content Component
function QuizContent({ content }: { content: unknown }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <Space direction="vertical" size={['large', 'large']} className="responsive-quiz-content">
      {/* Responsive Quiz Header with Meta Information */}
      <Card
        bordered
        className="quiz-header-card"
        
        style={{
          background: isDark ? '#1a1a1a' : 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
          borderRadius: 'clamp(8px, 2vw, 16px)',
          marginBottom: 'clamp(20px, 5vw, 32px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: 'clamp(20px, 5vw, 32px)'
        }}
      >
        <Space direction="vertical" size={['small', 'small']}>
          {quizContent.introduction && (
            <Text style={{
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: 500,
              color: isDark ? '#d9f7be' : '#52c41a'
            }}>
              {quizContent.introduction}
            </Text>
          )}

          <Space wrap style={{ 
            gap: 'clamp(6px, 1.5vw, 12px)',
            justifyContent: 'center'
          }}>
            <AntBadge
              count={`${quizContent.totalQuestions ?? normalizedQuestions.length} Questions`}
              style={{
                backgroundColor: '#52c41a',
                fontSize: 'clamp(11px, 2.5vw, 14px)'
              }}
            />
            {quizContent.estimatedTime && (
              <AntBadge
                count={quizContent.estimatedTime}
                style={{
                  backgroundColor: '#1c7ed6',
                  fontSize: 'clamp(10px, 2vw, 12px)'
                }}
              />
            )}
            {quizContent.difficulty && (
              <AntBadge
                count={quizContent.difficulty}
                style={{
                  backgroundColor: '#fa8c16',
                  fontSize: 'clamp(10px, 2vw, 12px)'
                }}
              />
            )}
          </Space>

          {!showResults && (
            <Space direction="vertical" size={['small', 'small']} style={{ width: '100%' }}>
              <Text style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                color: isDark ? '#a6a6a6' : '#8c8c8c',
                fontWeight: 500
              }}>
                Progress: {Object.keys(selectedAnswers).length} / {normalizedQuestions.length} answered
              </Text>
              <Progress
                percent={(Object.keys(selectedAnswers).length / normalizedQuestions.length) * 100}
                strokeWidth={8}
                strokeColor="#52c41a"
                style={{
                  width: '100%',
                  maxWidth: 'clamp(200px, 60vw, 300px)'
                }}
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
                className="quiz-question-card"
                bodyStyle={{ padding: 'clamp(20px, 5vw, 32px)' }}
                style={{
                  background: isDark ? (selectedAnswers[questionIndex] ? '#262626' : '#1a1a1a') : (selectedAnswers[questionIndex] ? '#f6ffed' : '#fafafa'),
                  borderColor: selectedAnswers[questionIndex] ? '#b7eb8f' : (isDark ? '#404040' : '#d9d9d9'),
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  padding: 'clamp(20px, 5vw, 32px)'
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
                    <Text style={{ 
                      flex: 1, 
                      fontWeight: 500, 
                      fontSize: 'clamp(16px, 4vw, 20px)', 
                      color: isDark ? 'white' : 'black',
                      lineHeight: 1.4
                    }}>
                      {question.question}
                    </Text>
                  </Space>

                  <Radio.Group
                    value={selectedAnswers[questionIndex] ?? ''}
                    onChange={(e) => handleAnswerSelect(questionIndex, String(e.target.value))}
                  >
                    <Space direction="vertical" size="middle" style={{ 
                      marginLeft: 'clamp(12px, 3vw, 20px)',
                      width: '100%'
                    }}>
                      {question.options.map((option: string, optionIndex: number) => (
                        <Card
                          key={optionIndex}
                          className="quiz-option-card"
                          bodyStyle={{ padding: 'clamp(16px, 4vw, 20px)' }}
                          style={{
                            cursor: 'pointer',
                            background: isDark ? (selectedAnswers[questionIndex] === option ? '#262626' : '#1a1a1a') : (selectedAnswers[questionIndex] === option ? '#f0f9ff' : 'transparent'),
                            border: selectedAnswers[questionIndex] === option ? '2px solid #52c41a' : (isDark ? '1px solid #404040' : '1px solid #d9d9d9'),
                            borderRadius: 'clamp(6px, 1.5vw, 10px)',
                            transition: 'all 0.2s ease',
                            minHeight: 'clamp(48px, 10vw, 56px)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onClick={() => handleAnswerSelect(questionIndex, option)}
                        >
                          <Radio
                            value={option}
                            style={{
                              fontSize: 'clamp(14px, 3.5vw, 16px)',
                              lineHeight: 1.4,
                              width: '100%'
                            }}
                          >
                            <span style={{
                              fontSize: 'clamp(14px, 3.5vw, 16px)',
                              lineHeight: 1.4
                            }}>
                              {option}
                            </span>
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>
                </Space>
              </Card>
            ))}
          </Space>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: 'clamp(32px, 8vw, 48px)',
            padding: '0 clamp(16px, 4vw, 24px)'
          }}>
            <Button
              size="large"
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              icon={<TrophyOutlined />}
              className="quiz-submit-btn"
              style={{
                backgroundColor: allQuestionsAnswered ? '#52c41a' : undefined,
                borderColor: allQuestionsAnswered ? '#52c41a' : undefined,
                height: 'clamp(48px, 10vw, 56px)',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: 600,
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                minWidth: 'clamp(200px, 50vw, 300px)',
                maxWidth: '100%'
              }}
            >
              <span style={{ textAlign: 'center', lineHeight: 1.2 }}>
                {allQuestionsAnswered ? 'Submit Quiz & See Results!' : `Answer ${normalizedQuestions.length - Object.keys(selectedAnswers).length} more questions`}
              </span>
            </Button>
          </div>
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