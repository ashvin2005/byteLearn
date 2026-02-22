import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ArrowLeft, Bookmark } from "lucide-react";
import { fetchArticles, ArticleData } from "../services/articleService";

interface BookmarkedArticle {
  article_id: string;
  title: string;
}

const BookmarkedArticles = () => {
  const { user } = useAuth();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<ArticleData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Fetch user's bookmarked articles
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("bookmarked_articles")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) throw userError;

        // Check if user has bookmarked articles
        if (
          !userData?.bookmarked_articles ||
          userData.bookmarked_articles.length === 0
        ) {
          setBookmarkedArticles([]);
          setLoading(false);
          return;
        }

        // Get the article IDs from the bookmarked articles
        const bookmarkedIds = userData.bookmarked_articles.map(
          (bookmark: BookmarkedArticle) => bookmark.article_id
        );

        // Fetch full article data for the bookmarked articles
        const { data: articlesData, error: articlesError } =
          await fetchArticles(user.id);

        if (articlesError) throw new Error(articlesError);

        // Filter articles to only include the bookmarked ones
        const bookmarkedArticlesData =
          articlesData?.filter((article) =>
            bookmarkedIds.includes(article.article_id || "")
          ) || [];

        setBookmarkedArticles(bookmarkedArticlesData);
      } catch (err) {
        console.error("Error fetching bookmarked articles:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedArticles();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Please log in to view your bookmarked articles.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Loading bookmarked articles...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Error loading bookmarked articles:
        <br />
        {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-[#000000] to-[#0A0A0A] text-foreground">
      <div className="px-3 md:px-4 pt-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Bookmarked Articles
          </h1>
        </div>

        {bookmarkedArticles.length === 0 ? (
          <div className="text-lg text-muted-foreground p-4">
            No bookmarked articles found - start bookmarking articles that
            interest you!
          </div>
        ) : (
          <div className="grid gap-4 md:gap-4 lg:grid-cols-2 xl:grid-cols-2 w-full">
            {bookmarkedArticles.map((article) => (
              <Link
                key={article.article_id}
                to={`/article/${article.article_id}`}
                className="group transition-all hover:shadow-lg duration-300"
              >
                <div className="relative bg-gradient-to-b from-card to-card/90 text-card-foreground rounded-xl p-5 shadow-lg border border-border/40 backdrop-blur-sm hover:border-border/60 transition-all duration-300">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    children={undefined}
                  />
                  <div className="flex flex-col h-full gap-4">
                    <div className="relative w-full h-20 rounded-lg overflow-hidden">
                      <img
                        src={
                          article.image_path ||
                          "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                        }
                        alt={article.article_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0 bg-muted/60 p-2 rounded-lg border">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <h2 className="text-2xl font-semibold truncate">
                        {article.article_name}
                      </h2>
                    </div>

                    {/* <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content_text
                          ? article.content_text.substring(0, 120) + "..."
                          : "No content available."}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Bookmarked article
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                          View article
                        </span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedArticles;
