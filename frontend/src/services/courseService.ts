import { supabase } from '@/lib/supabase';

interface ChapterContent {
  [key: string]: string;
}

interface CourseContent {
  Chapters: {
    [key: string]: ChapterContent;
  };
}

interface CourseData {
  course_id: string;
  course_name: string;
  metadata: string;
  chapters_json: {
    chapters: string[];
  };
  skill_level: number;
  teaching_pattern: string[];
  user_prompt: string;
  progress: number;
  user_id: string;
  course_content?: CourseContent;
  keywords?: {
    technical_terms?: string[];
    skills?: string[];
    technologies?: string[];
  };
}

interface TopicInfo {
  chapterTopicIds: { [key: string]: string[] };
  topicNames: { [key: string]: string[] };
}

interface CourseCallbackPayload {
  course_id: string;
  teaching_pattern: string[];
  user_prompt: string;
  skill_level: number;
  topic_info: TopicInfo;
}

const createTopics = async (courseContent: CourseContent) => {
  try {
    const chapterTopicsMap = new Map<string, string[]>();

    Object.entries(courseContent.Chapters).forEach(([chapterKey, topics]) => {
      const chapterName = chapterKey.split(':')[1]?.trim();
      if (chapterName) {
        chapterTopicsMap.set(chapterName, Object.values(topics));
      }
    });

    const chapterTopicIds = new Map<string, string[]>();

    for (const [chapterName, topics] of chapterTopicsMap) {
      const topicsForChapter = topics.map((topicName: string) => ({
        topic_name: topicName,
        tags: {},
        content: '',
        articles_json: {}
      }));

      const { data: insertedTopics, error } = await supabase
        .from('topics')
        .insert(topicsForChapter)
        .select('topic_id, topic_name');

      if (error || !insertedTopics) {
        console.error('Error creating topics for chapter:', chapterName, error);
        continue;
      }

      chapterTopicIds.set(chapterName, insertedTopics.map(t => t.topic_id));
    }

    return { data: chapterTopicIds, error: null };
  } catch (error) {
    console.error('Error in createTopics:', error);
    return { data: null, error };
  }
};

export const fetchUserCourses = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: userError };
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('courses_json')
      .eq('user_id', user.id)
      .maybeSingle();

    if (userDataError) {
      return { data: null, error: userDataError };
    }

    if (!userData) {
      return { data: [], error: null };
    }

    let coursesJson = userData.courses_json;
    if (typeof coursesJson === 'string') {
      try { coursesJson = JSON.parse(coursesJson); } catch { /* already parsed or bad data */ }
    }

    const courseIds = coursesJson || [];
    if (courseIds.length === 0) return { data: [], error: null };

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('course_id, course_name, created_at')
      .in('course_id', courseIds);

    if (coursesError) {
      return { data: null, error: coursesError };
    }

    return { data: courses, error: null };
  } catch (error) {
    console.error('Error in fetchUserCourses:', error);
    return { data: null, error };
  }
};

const createChapters = async (chapterNames: string[], chapterTopics: Map<string, string[]>) => {
  try {
    const chaptersToInsert = chapterNames.map(chapterName => ({
      chapter_name: chapterName,
      tags: {},
      topics_json: { topic_ids: chapterTopics.get(chapterName) || [] }
    }));

    const { data: chapters, error } = await supabase
      .from('chapters')
      .insert(chaptersToInsert)
      .select('chapter_id');

    if (error) {
      console.error('Error creating chapters:', error);
      return { data: null, error };
    }

    return { data: chapters.map(ch => ch.chapter_id), error: null };
  } catch (error) {
    console.error('Error in createChapters:', error);
    return { data: null, error };
  }
};

export const createCourse = async (courseData: CourseData) => {
  try {
    const { user_id, course_content, keywords, ...coursePayload } = courseData;

    // create topics first
    let chapterTopicIds = new Map<string, string[]>();
    if (course_content) {
      const { data: topicsMap, error: topicsError } = await createTopics(course_content);
      if (topicsError) return { data: null, error: topicsError };
      if (topicsMap) chapterTopicIds = topicsMap;
    }

    // create chapters with their topic IDs
    const { data: chapterIds, error: chaptersError } = await createChapters(
      coursePayload.chapters_json.chapters,
      chapterTopicIds
    );

    if (chaptersError || !chapterIds) {
      return { data: null, error: chaptersError };
    }

    // create the course itself
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert([{
        course_name: coursePayload.course_name,
        metadata: coursePayload.metadata || '',
        chapters_json: { chapters: chapterIds },
        skill_level: coursePayload.skill_level,
        teaching_pattern: coursePayload.teaching_pattern,
        user_prompt: coursePayload.user_prompt,
        progress: coursePayload.progress || 0,
        course_id: coursePayload.course_id,
        user_id,
        keywords: keywords || {}
      }])
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      return { data: null, error: courseError };
    }

    // add course to user's courses_json
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('courses_json')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchError) return { data: newCourse, error: fetchError };

    const coursesJson: string[] = Array.isArray(userData?.courses_json) ? userData.courses_json : [];
    coursesJson.push(newCourse.course_id);

    const { error: updateError } = await supabase
      .from('users')
      .update({ courses_json: coursesJson })
      .eq('user_id', user_id);

    if (updateError) return { data: newCourse, error: updateError };

    return { data: newCourse, error: null };
  } catch (error) {
    console.error('Error in createCourse:', error);
    return { data: null, error };
  }
};

export const prepareCourseData = (
  courseData: CourseCallbackPayload,
  chapterTopicIds: Map<string, string[]>
): CourseCallbackPayload => {
  const topicIdsObject: { [key: string]: string[] } = {};
  chapterTopicIds.forEach((ids, chapterName) => {
    topicIdsObject[chapterName] = ids;
  });

  return {
    ...courseData,
    topic_info: {
      ...courseData.topic_info,
      chapterTopicIds: topicIdsObject
    }
  };
};
