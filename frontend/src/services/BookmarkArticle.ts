
import { supabase } from '@/lib/supabase';

interface BookmarkedArticle {
  article_id: string;
  title: string;
}

export const toggleArticleBookmark = async (
  user_id: string,
  article_id: string,
  article_name: string
) => {
  try {
    const { data: userFetch, error: fetchError } = await supabase
      .from('users')
      .select('bookmarked_articles')
      .eq('user_id', user_id)
      .maybeSingle();
    let userData = userFetch;

    if (!userData) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ user_id, bookmarked_articles: [] }])
        .select()
        .single();

      if (createError) return { data: null, error: createError.message };
      userData = newUser;
    } else if (fetchError) {
      return { data: null, error: fetchError.message };
    }

    let bookmarkedArticles: BookmarkedArticle[] = userData?.bookmarked_articles || [];

    const articleIndex = bookmarkedArticles.findIndex(article => article.article_id === article_id);

    if (articleIndex > -1) {
      bookmarkedArticles = bookmarkedArticles.filter(article => article.article_id !== article_id);
    } else {
      bookmarkedArticles.push({ article_id, title: article_name });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ bookmarked_articles: bookmarkedArticles })
      .eq('user_id', user_id)
      .select();

    if (updateError) return { data: null, error: updateError.message };

    return {
      data: bookmarkedArticles,
      error: null,
      isBookmarked: articleIndex === -1
    };
  } catch {
    return { data: null, error: 'Failed to update article bookmark status' };
  }
};