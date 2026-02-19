import { supabase } from '@/lib/supabase';

export interface ArticleData {
  article_name: string;
  tags: string[] | null;
  content_text: string | null;
  created_at: string;
  id: string;
  article_id: string;
  image_path: string;
  is_completed: boolean;
}

export interface RawArticle {
  article_name?: string;
  tags?: string[] | null;
  content_text?: string | null;
  created_at?: string;
  article_id?: string;
  content_img?: string;
  is_completed?: boolean;
}

export const fetchArticles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Supabase fetch error:', error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const articles: ArticleData[] = data.map(article => ({
      article_name: article.article_name || 'Untitled',
      tags: article.tags || null,
      content_text: article.content_text || null,
      created_at: article.created_at || new Date().toISOString(),
      id: article.article_id,
      article_id: article.article_id || '',
      image_path: article.content_img,
      is_completed: article.is_completed || false
    }));

    return { data: articles, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'Failed to fetch articles' };
  }
};

export const fetchRecommendedArticles = async (user_id: string): Promise<{ data: ArticleData[] | null, error: string | null }> => {
  try {
    const { data: recommendedData, error: recommendedError } = await supabase
      .from("users")
      .select("recommended_json")
      .eq("user_id", user_id)
      .maybeSingle();

    if (recommendedError) {
      console.error("Error fetching recommended articles:", recommendedError);
      return { data: null, error: recommendedError.message };
    }

    if (!recommendedData?.recommended_json || recommendedData.recommended_json.length === 0) {
      return { data: [], error: null };
    }

    const recommendedArticles: ArticleData[] = recommendedData.recommended_json.map((article: RawArticle) => ({
      article_name: article.article_name || 'Untitled',
      tags: article.tags || null,
      content_text: article.content_text || null,
      created_at: article.created_at || new Date().toISOString(),
      id: article.article_id || '',
      article_id: article.article_id || '',
      image_path: article.content_img || '',
      is_completed: article.is_completed || false
    }));

    return { data: recommendedArticles, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'Failed to fetch recommended articles' };
  }
};
