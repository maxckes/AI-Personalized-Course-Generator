// /types/ai.ts

// Define the shape of a single module within a week
export interface AIModule {
    title: string;
    contentType: 'READING' | 'VIDEO' | 'QUIZ';
  }

// Define the shape of a single week in the course
  export interface AIWeek {
    weekNumber: number;
    title: string;
    modules: AIModule[];
  }

// Define the overall shape of the course skeleton JSON
  export interface AICourseSkeleton {
    title: string;
    description: string;
    weeks: AIWeek[];
  }

// Define the parameters for course generation
export interface CourseGenerationParams {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expertiseLevel: 'novice' | 'intermediate' | 'expert' | 'general';
  numberOfWeeks: number;
  quizzesPerWeek: number;
  questionsPerQuiz: number;
}

// Define quiz content structure
export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizContent {
  introduction: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  estimatedTime: string;
  difficulty: string;
}

// Define reading content structure
export interface ReadingContent {
  blogContent: string;
  summary: string;
  readingTime: string;
}

// Define video content structure
export interface VideoContent {
  title: string;
  status: string;
  message: string;
  description: string;
  expectedDuration: string;
  comingSoonContent: string;
}