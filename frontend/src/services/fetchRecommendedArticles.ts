import { supabase } from "@/lib/supabase";
import { ArticleData } from "@/services/articleService";
import type { RawArticle } from "@/services/articleService";

export const fetchRecommendedArticles = async (
  user_id: string
): Promise<{ data: ArticleData[] | null; error: string | null }> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("recommended_json")
      .eq("user_id", user_id)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching recommended articles:", userError);
      return { data: null, error: userError.message };
    }

    if (!userData) return { data: [], error: null };

    const articleIds: string[] = Array.isArray(userData)
      ? userData[0]?.recommended_json ?? []
      : userData?.recommended_json ?? [];

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return { data: [], error: null };
    }

    // try article_id column first, fall back to id
    let { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("*")
      .in("article_id", articleIds);

    if ((!articlesData || articlesData.length === 0) && !articlesError) {
      const fallback = await supabase
        .from("articles")
        .select("*")
        .in("id", articleIds);

      if (fallback.data && fallback.data.length > 0) {
        articlesData = fallback.data;
        articlesError = fallback.error;
      } else {
        return { data: [], error: null };
      }
    }

    if (articlesError) {
      console.error("Error fetching article details:", articlesError);
      return { data: null, error: articlesError.message };
    }

    const recommendedArticles: ArticleData[] = (articlesData ?? []).map((article: RawArticle) => ({
      article_name: article.article_name || "Untitled",
      tags: article.tags || null,
      content_text: article.content_text || null,
      created_at: article.created_at || new Date().toISOString(),
      id: article.article_id || "",
      article_id: article.article_id || "",
      image_path: article.content_img || "",
      is_completed: article.is_completed || false,
    }));

    return { data: recommendedArticles, error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error in fetchRecommendedArticles:", error);
    return { data: null, error: msg };
  }
};

