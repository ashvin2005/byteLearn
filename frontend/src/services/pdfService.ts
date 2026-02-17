import { API_BASE_URL } from '../config/api';

interface CourseOutlineResponse {
  welcome_message: string;
  course_title: string;
  course_content: {
    Chapters: {
      [chapterName: string]: {
        [topicKey: string]: string;
      };
    };
  };
  keywords: {
    technical_terms: string[];
    skills: string[];
    technologies: string[];
  };
}

export const sendPdfForProcessing = async (formData: FormData): Promise<CourseOutlineResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/process_pdf`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error (${response.status}): ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};