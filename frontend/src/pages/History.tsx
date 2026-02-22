import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ArrowLeft, Clock } from "lucide-react";
import { fetchArticles } from "../services/articleService";

interface HistoryEntry {
  timestamp: string;
  articleId: string;
  articleName?: string;
  imagePath?: string;
  date: string; // For grouping by day
  time: string; // For displaying time
}

// Group type for organizing entries by date
interface GroupedHistory {
  [date: string]: HistoryEntry[];
}

const History = () => {
  const { user } = useAuth();
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Fetch user history
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("history")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) throw userError;
        if (!userData) {
          setLoading(false);
          return;
        }

        // Fetch all articles to match with history
        const { data: articlesData, error: articlesError } =
          await fetchArticles(user.id);

        if (articlesError) throw new Error(articlesError);

        // Process and enrich history data with article details
        const historyData = userData?.history?.history || {};
        const processedHistory: HistoryEntry[] = Object.entries(
          historyData
        ).map(([timestamp, articleId]) => {
          const matchedArticle = articlesData?.find(
            (article) => article.article_id === articleId
          );
          const date = new Date(timestamp);

          return {
            timestamp,
            articleId: articleId as string,
            articleName: matchedArticle?.article_name || "Unknown Article",
            imagePath: matchedArticle?.image_path || "",
            // Format date as YYYY-MM-DD for grouping
            date: date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            // Format time for display
            time: date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        // Group by date
        const grouped: GroupedHistory = {};
        processedHistory
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .forEach((entry) => {
            if (!grouped[entry.date]) {
              grouped[entry.date] = [];
            }
            grouped[entry.date].push(entry);
          });

        setGroupedHistory(grouped);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Please log in to view your history.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Error loading history:
        <br />
        {error.message}
      </div>
    );
  }

  // Get today's date string for comparison
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Function to check if time gap between entries is significant
  const hasSignificantTimeGap = (
    current: HistoryEntry,
    next: HistoryEntry
  ): boolean => {
    if (!next) return false;
    const currentTime = new Date(current.timestamp).getTime();
    const nextTime = new Date(next.timestamp).getTime();
    // Consider 30+ minutes a significant gap
    return currentTime - nextTime > 30 * 60 * 1000;
  };

  // Get all dates sorted from newest to oldest
  const allDates = Object.keys(groupedHistory).sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    return dateB - dateA;
  });

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
            My History
          </h1>
        </div>

        {Object.keys(groupedHistory).length === 0 ? (
          <div className="text-lg text-muted-foreground p-4">
            No reading history found - start exploring articles!
          </div>
        ) : (
          <div className="space-y-8">
            {allDates.map((date) => (
              <div key={date} className="space-y-4">
                <h2 className="text-xl font-medium px-2 py-1 bg-opacity-20  rounded-md inline-block">
                  {date === today ? "Today" : date}
                </h2>

                <div className="space-y-1">
                  {groupedHistory[date].map((entry, index) => (
                    <React.Fragment key={entry.timestamp}>
                      <Link
                        to={`/article/${entry.articleId}`}
                        className="block"
                      >
                        <div className="relative bg-gradient-to-b from-card/60 to-card/40 text-card-foreground rounded-lg p-4 shadow border border-border/30 backdrop-blur-sm hover:border-border/60 transition-all duration-300">
                          <GlowingEffect
                            spread={30}
                            glow={true}
                            disabled={false}
                            proximity={50}
                            inactiveZone={0.01}
                            children={undefined}
                          />
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 bg-muted/60 p-2 rounded-lg border">
                              <Clock className="w-4 h-4" />
                            </div>

                            <div className="w-20 text-sm text-muted-foreground">
                              {entry.time}
                            </div>

                            <div className="flex-grow flex items-center gap-3">
                              <div className="relative h-10 w-[100px] rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={
                                    entry.imagePath ||
                                    "/placeholder-article.jpg"
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <h3 className="text-base font-medium truncate">
                                {entry.articleName}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Show divider if there's a significant time gap between entries */}
                      {hasSignificantTimeGap(
                        entry,
                        groupedHistory[date][index + 1]
                      ) && (
                        <div className="flex items-center py-2">
                          <div className="flex-grow border-t border-border/30"></div>
                          <div className="mx-4 text-xs text-muted-foreground">
                            Time gap
                          </div>
                          <div className="flex-grow border-t border-border/30"></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
