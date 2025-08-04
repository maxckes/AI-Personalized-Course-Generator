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