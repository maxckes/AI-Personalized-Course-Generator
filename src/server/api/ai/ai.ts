// /server/api/ai.ts

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { type AICourseSkeleton } from "~/types/ai"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Safety settings to reduce the chance of the AI refusing to answer
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  // Ensure the model returns valid JSON
  generationConfig: { responseMimeType: "application/json" },
  safetySettings,
});



/**
 * Generates the main skeleton of the course: weeks and modules.
 */
export async function generateCourseSkeleton(topic: string) {
  const prompt = `Create a 2-week course syllabus on the topic: "${topic}".

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Course title here",
  "description": "Course description here",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1 title",
      "modules": [
        {"title": "Module 1 title", "contentType": "READING"},
        {"title": "Module 2 title", "contentType": "VIDEO"},
        {"title": "Module 3 title", "contentType": "QUIZ"}
      ]
    },
    {
      "weekNumber": 2,
      "title": "Week 2 title",
      "modules": [
        {"title": "Module 1 title", "contentType": "READING"},
        {"title": "Module 2 title", "contentType": "VIDEO"},
        {"title": "Module 3 title", "contentType": "QUIZ"}
      ]
    }
  ]
}

contentType must be exactly one of: "READING", "VIDEO", or "QUIZ".
Return only valid JSON, no additional text or explanations.`;
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt]);
      const responseText = result.response.text().trim();
      
      // Remove any potential markdown code block markers
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      const courseData = JSON.parse(cleanJson) as AICourseSkeleton;
      
      // Basic validation
      if (!courseData.title || !courseData.description || !Array.isArray(courseData.weeks)) {
        throw new Error('Invalid course skeleton structure');
      }
      
      return courseData;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed to generate course skeleton:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error(`Failed to generate valid course skeleton after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Generates content for a "READING" module in blog format.
 */
export async function generateReadingContent(moduleTitle: string) {
  const prompt = `Write a comprehensive, engaging blog post about "${moduleTitle}". 
The blog post should be 500-800 words, well-structured with clear sections, and written in an informative yet engaging tone.

Include:
- An engaging introduction that hooks the reader
- Clear headings and subheadings (use ## for main headings, ### for subheadings)
- Practical examples and real-world applications
- Key takeaways or bullet points where appropriate
- A conclusion that summarizes the main points

Format the content using Markdown for better readability.

Return ONLY a valid JSON object with this exact structure:
{
  "blogContent": "Your complete blog post content here with Markdown formatting...",
  "summary": "A brief 2-3 sentence summary of the key points covered",
  "readingTime": "5-8 min read"
}

Return only valid JSON, no additional text or explanations.`;
  
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt]);
      const responseText = result.response.text().trim();
      
      // Remove any potential markdown code block markers
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      const content = JSON.parse(cleanJson) as { 
        blogContent: string;
        summary: string;
        readingTime: string;
      };
      
      if (!content.blogContent || typeof content.blogContent !== 'string') {
        throw new Error('Invalid reading content structure');
      }
      
      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed to generate reading content:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  
  // Fallback content if AI fails
  console.warn(`Failed to generate reading content after ${maxRetries} attempts: ${lastError?.message}`);
  return {
    blogContent: `# ${moduleTitle}\n\nThis comprehensive blog post about ${moduleTitle} is currently being generated. \n\n## Coming Soon\n\nWe're working on creating detailed, engaging content for this module. Please check back later for the complete blog post with:\n\n- In-depth explanations\n- Practical examples\n- Real-world applications\n- Key takeaways\n\nThank you for your patience!`,
    summary: "Content is being generated for this module.",
    readingTime: "2 min read"
  };
}

/**
 * Generates a comprehensive quiz for a "QUIZ" module with enhanced content.
 */
export async function generateQuizContent(moduleTitle: string) {
  const prompt = `Create an engaging 5-question multiple-choice quiz about "${moduleTitle}".

Return ONLY a valid JSON object with this exact structure:
{
  "introduction": "Brief engaging introduction about what this quiz covers (1-2 sentences)",
  "questions": [
    {
      "questionText": "Clear, specific question about the topic?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is the correct answer"
    },
    {
      "questionText": "Another thoughtful question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ],
  "totalQuestions": 5,
  "estimatedTime": "8-12 minutes",
  "difficulty": "Beginner" or "Intermediate" or "Advanced"
}

Requirements:
- Make questions engaging and practical, not just theoretical
- Each question must have exactly 4 options
- The correctAnswer must match one of the options exactly
- Include helpful explanations for learning
- Questions should test understanding, not just memorization
- Make the introduction welcoming and encouraging

Return only valid JSON, no additional text or explanations.`;
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt]);
      const responseText = result.response.text().trim();
      
      // Remove any potential markdown code block markers
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      const content = JSON.parse(cleanJson) as { 
        introduction: string;
        questions: Array<{ 
          questionText: string; 
          options: string[]; 
          correctAnswer: string;
          explanation?: string;
        }>;
        totalQuestions: number;
        estimatedTime: string;
        difficulty: string;
      };
      
      if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
        throw new Error('Invalid quiz content structure');
      }
      
      // Validate each question has the required fields
      for (const question of content.questions) {
        if (!question.questionText || !question.options || !question.correctAnswer) {
          throw new Error('Invalid question structure');
        }
        if (!question.options.includes(question.correctAnswer)) {
          throw new Error('Correct answer not found in options');
        }
      }
      
      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed to generate quiz content:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  // Enhanced fallback content if AI fails
  console.warn(`Failed to generate quiz content after ${maxRetries} attempts: ${lastError?.message}`);
  return {
    introduction: `Test your knowledge of ${moduleTitle} with this interactive quiz!`,
    questions: [
      {
        questionText: `What is the main focus of ${moduleTitle}?`,
        options: [
          `Understanding ${moduleTitle}`,
          "Something else entirely",
          "Not related to the topic",
          "Unknown concept"
        ],
        correctAnswer: `Understanding ${moduleTitle}`,
        explanation: `This question focuses on the core concept of ${moduleTitle}.`
      },
      {
        questionText: `Why is learning about ${moduleTitle} important?`,
        options: [
          "It's not important",
          "It helps build foundational knowledge",
          "It's just for fun",
          "No specific reason"
        ],
        correctAnswer: "It helps build foundational knowledge",
        explanation: "Learning foundational concepts is crucial for building expertise."
      },
      {
        questionText: "How can you apply knowledge gained from this module?",
        options: [
          "You cannot apply it",
          "Only in theoretical contexts",
          "In real-world scenarios and practical situations",
          "Only in academic settings"
        ],
        correctAnswer: "In real-world scenarios and practical situations",
        explanation: "Knowledge is most valuable when it can be applied practically."
      },
      {
        questionText: "What's the best approach to mastering this topic?",
        options: [
          "Memorizing everything",
          "Skipping the difficult parts",
          "Practice and consistent review",
          "Reading once is enough"
        ],
        correctAnswer: "Practice and consistent review",
        explanation: "Consistent practice and review lead to better retention and understanding."
      },
      {
        questionText: "How does this topic connect to broader learning?",
        options: [
          "It doesn't connect to anything",
          "It serves as a building block for advanced concepts",
          "It's completely isolated",
          "It only matters for tests"
        ],
        correctAnswer: "It serves as a building block for advanced concepts",
        explanation: "Foundational topics often connect to and support more advanced learning."
      }
    ],
    totalQuestions: 5,
    estimatedTime: "8-12 minutes",
    difficulty: "Beginner"
  };
}

/**
 * For "VIDEO" modules, show coming soon message.
 * A real implementation would use the YouTube API curation logic here.
 */
export function getVideoContentPlaceholder(moduleTitle: string) {
  return {
    title: moduleTitle,
    status: "coming_soon",
    message: "🎥 Video content coming soon!",
    description: `We're curating the best video content about ${moduleTitle}. This will include carefully selected educational videos, tutorials, and demonstrations to enhance your learning experience.`,
    expectedDuration: "15-30 minutes",
    comingSoonContent: `## Video Module: ${moduleTitle}\n\n### What to Expect\n\nThis video module will cover:\n- Visual demonstrations and examples\n- Step-by-step tutorials\n- Expert insights and explanations\n- Practical applications\n\n### Coming Soon!\n\nOur content team is currently:\n- ✅ Researching the best educational videos\n- 🔄 Curating high-quality content\n- ⏳ Preparing interactive elements\n- 📝 Creating supplementary materials\n\n**Estimated completion:** Within the next few days\n\nStay tuned for an engaging video learning experience!`
  };
}