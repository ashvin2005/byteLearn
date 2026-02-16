import { supabase } from '@/lib/supabase';

interface ReadLaterArticle {
  article_id: string;
  title: string;
}

export const toggleReadLater = async (
  user_id: string,
  article_id: string,
  article_name: string
) => {
  try {
    const { data: userFetch, error: fetchError } = await supabase
      .from('users')
      .select('watch_later')
      .eq('user_id', user_id)
      .maybeSingle();
    let userData = userFetch;

    if (!userData) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ user_id, watch_later: [] }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user record:', createError);
        return { data: null, error: createError.message };
      }

      userData = newUser;
    } else if (fetchError) {
      console.error('Error fetching watch later articles:', fetchError);
      return { data: null, error: fetchError.message };
    }

    let watchLaterArticles: ReadLaterArticle[] = userData?.watch_later || [];
    const articleIndex = watchLaterArticles.findIndex(a => a.article_id === article_id);

    if (articleIndex > -1) {
      watchLaterArticles = watchLaterArticles.filter(a => a.article_id !== article_id);
    } else {
      watchLaterArticles.push({ article_id, title: article_name });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ watch_later: watchLaterArticles })
      .eq('user_id', user_id)
      .select();

    if (updateError) {
      console.error('Error updating watch later articles:', updateError);
      return { data: null, error: updateError.message };
    }

    return {
      data: watchLaterArticles,
      error: null,
      isInWatchLater: articleIndex === -1
    };
  } catch (error) {
    console.error('Unexpected error updating watch later:', error);
    return { data: null, error: 'Failed to update read later status' };
  }
};
