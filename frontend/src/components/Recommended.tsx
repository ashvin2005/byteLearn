import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Recommended({
  article_id,
  colorMode,
}: {
  article_id: string;
  colorMode: string;
}) {
  const [ArticleArray, setArticleArray] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (!user || !user.id || !article_id) {
          console.warn("User or article information not available");
          return;
        }

        const formData = new FormData();
        formData.append("user_id", user.id);
        formData.append("article_id", article_id);

        const response = await fetch(`${API_BASE_URL}/api/recommendation`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Recommendation failed");
        }

        const data = await response.json();
        setArticleArray(data.data);
      } catch (error) {
        console.error("Recommendation error:", error);
      }
    };

    fetchRecommendations();
  }, [article_id, user]);

  async function get_recommended_articles(articleIds: string[]) {
    const { data: RecommendedarticleData, error: RecommendedarticleError } =
      await supabase.from("articles").select("*").in("article_id", articleIds);

    if (RecommendedarticleError) {
      console.error(
        "Error fetching recommended articles:",
        RecommendedarticleError
      );
      return [];
    }

    return RecommendedarticleData || [];
  }

  useEffect(() => {
    if (ArticleArray.length > 0) {
      setLoading(true);
      get_recommended_articles(ArticleArray).then((articles) => {
        setRecommendedArticles(articles);
        setLoading(false);
      });
    }
  }, [ArticleArray]);

  return (
    <div className="recommended-articles">
      <div className="py-2">
        <h3 className="text-lg font-semibold mb-3">Recommended Articles :</h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[120px] text-lg text-gray-500">
          Loading recommendations...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {recommendedArticles.map((element) => (
            <div
              key={element.article_id}
              className={`border rounded-xl`}
              style={{
                borderColor: colorMode === "light" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.2)",
              }}
            >
              <Link to={`/article/${element.article_id}`}>
                <div className="relative rounded-xl overflow-hidden h-40 w-full">
                  <img
                    src={
                      element.content_img ||
                      `https://placehold.co/400x200/333/FFF?text=${encodeURIComponent(
                        element.article_name
                      )}`
                    }
                    alt={element.article_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  style={{ color: colorMode === "light" ? "black" : "white" }}
                  className="flex text-bold p-2"
                >
                  {element.article_name}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
