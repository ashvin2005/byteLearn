import { supabase } from '@/lib/supabase';

interface Topic {
  topic_id: string;
  topic_name: string;
}

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  topics: Topic[];
}

interface CourseDetails {
  course_id: string;
  course_name: string;
  chapters: Chapter[];
}

export const fetchCourseDetails = async (courseId: string): Promise<CourseDetails | null> => {
  try {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (courseError || !courseData) {
      console.error('Error fetching course:', courseError);
      return null;
    }

    let chapterIds: string[] = [];

    if (courseData.chapters_json) {
      try {
        const parsed = typeof courseData.chapters_json === 'string'
          ? JSON.parse(courseData.chapters_json)
          : courseData.chapters_json;

        if (parsed && typeof parsed === 'object' && 'chapters' in parsed) {
          chapterIds = parsed.chapters;
        }
      } catch (e) {
        console.error('Failed to parse chapters_json:', e);
      }
    }

    if (!chapterIds.length) {
      return {
        course_id: courseData.course_id,
        course_name: courseData.course_name,
        chapters: []
      };
    }

    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .in('chapter_id', chapterIds);

    if (chaptersError || !chaptersData?.length) {
      if (chaptersError) console.error('Error fetching chapters:', chaptersError);
      return {
        course_id: courseData.course_id,
        course_name: courseData.course_name,
        chapters: []
      };
    }

    // Collect all topic IDs from every chapter
    const allTopicIds = chaptersData.reduce((acc: string[], chapter) => {
      if (!chapter.topics_json) return acc;
      try {
        const parsed = typeof chapter.topics_json === 'string'
          ? JSON.parse(chapter.topics_json)
          : chapter.topics_json;

        if (parsed && typeof parsed === 'object') {
          const topicIds = parsed.topics || parsed.topic_ids || [];
          return [...acc, ...topicIds];
        }
        return acc;
      } catch (e) {
        console.error(`Failed to parse topics_json for chapter ${chapter.chapter_id}:`, e);
        return acc;
      }
    }, []);

    if (!allTopicIds.length) {
      return {
        course_id: courseData.course_id,
        course_name: courseData.course_name,
        chapters: chaptersData.map(chapter => ({
          chapter_id: chapter.chapter_id,
          chapter_name: chapter.chapter_name,
          topics: []
        }))
      };
    }

    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .select('topic_name, topic_id, iscompleted')
      .in('topic_id', allTopicIds);

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return null;
    }

    if (!topicsData) {
      return {
        course_id: courseData.course_id,
        course_name: courseData.course_name,
        chapters: chaptersData.map(chapter => ({
          chapter_id: chapter.chapter_id,
          chapter_name: chapter.chapter_name,
          topics: []
        }))
      };
    }

    const topicsMap = new Map(
      topicsData.map(topic => [topic.topic_id, {
        ...topic,
        isCompleted: topic.iscompleted || false
      }])
    );

    const chapters = chaptersData.map(chapter => {
      let topicIds: string[] = [];

      if (chapter.topics_json) {
        try {
          const parsed = typeof chapter.topics_json === 'string'
            ? JSON.parse(chapter.topics_json)
            : chapter.topics_json;

          if (parsed && typeof parsed === 'object') {
            topicIds = parsed.topics || parsed.topic_ids || [];
          }
        } catch (e) {
          console.error(`Failed to parse topics_json for chapter ${chapter.chapter_id}:`, e);
        }
      }

      const chapterTopics = topicIds
        .map(topicId => topicsMap.get(topicId))
        .filter(Boolean) as Topic[];

      return {
        chapter_id: chapter.chapter_id,
        chapter_name: chapter.chapter_name,
        topics: chapterTopics
      };
    });

    return {
      course_id: courseData.course_id,
      course_name: courseData.course_name,
      chapters
    };
  } catch (error) {
    console.error('Error in fetchCourseDetails:', error);
    return null;
  }
};
