import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const toggleArticleCompletion = async (article_id: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({ is_completed: true })
      .eq('article_id', article_id)
      .select();

    if (error) {
      console.error('Error updating article completion:', error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: null, error: 'Article not found' };
    }

    // also mark the linked topic as completed
    const { data: topicData } = await supabase
      .from('articles')
      .select('topic_id')
      .eq('article_id', article_id)
      .single();

    const topic_id = topicData?.topic_id;

    const { data: updatedTopic } = await supabase
      .from('topics')
      .update({ isCompleted: true })
      .eq('topic_id', topic_id)
      .select();

    if (updatedTopic?.[0]) {
      toast.success(`You successfully learnt ${updatedTopic[0].topic_name} through this article!`);
    } else {
      toast.success(`You successfully completed the article : ${data[0].article_name}.`);
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating article completion:', error);
    return { data: null, error: 'Failed to update article completion status' };
  }
};