import { supabase } from '@/lib/supabase';

export interface CourseData {
  course_img: string | undefined;
  course_id: string;
  course_name: string;
  progress: number;
  teaching_pattern?: string[];
  skill_level?: number;
  chapters_json?: {
    chapters: string[];
  };
  keywords?: {
    technical_terms?: string[];
    skills?: string[];
    technologies?: string[];
  };
  created_at?: string;
}

const calculateCourseProgress = async (courseId: string): Promise<number> => {
  try {
    const { data: courseData } = await supabase
      .from('courses')
      .select('chapters_json')
      .eq('course_id', courseId)
      .single();

    if (!courseData?.chapters_json) return 0;

    const chapterIds = courseData.chapters_json.chapters || [];

    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('topics_json')
      .in('chapter_id', chapterIds);

    if (!chaptersData) return 0;

    const topicIds = chaptersData.reduce((acc: string[], chapter) => {
      if (!chapter.topics_json) return acc;
      const topics = typeof chapter.topics_json === 'string'
        ? JSON.parse(chapter.topics_json)
        : chapter.topics_json;
      return [...acc, ...(topics.topics || topics.topic_ids || [])];
    }, []);

    if (topicIds.length === 0) return 0;

    const { data: topicsData } = await supabase
      .from('topics')
      .select('isCompleted')
      .in('topic_id', topicIds);

    if (!topicsData) return 0;

    const completedTopics = topicsData.filter(topic => topic.isCompleted).length;
    const totalTopics = topicsData.length;

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  } catch (error) {
    console.error('Error calculating course progress:', error);
    return 0;
  }
};

export const fetchUserCourses = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return { data: null, error: userError };
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (userDataError) {
      console.error('Error fetching user data:', userDataError);
      return { data: null, error: userDataError };
    }

    if (!userData || !userData.courses_json) {
      return { data: [], error: null };
    }

    const courseIds = userData.courses_json || [];
    if (courseIds.length === 0) {
      return { data: [], error: null };
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('course_id', courseIds);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return { data: null, error: coursesError };
    }

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await calculateCourseProgress(course.course_id);
        return {
          ...course,
          progress,
          teaching_pattern: course.teaching_pattern || ['Online Learning']
        };
      })
    );

    return { data: coursesWithProgress as CourseData[], error: null };
  } catch (error) {
    console.error('Error in fetchUserCourses:', error);
    return { data: null, error };
  }
};