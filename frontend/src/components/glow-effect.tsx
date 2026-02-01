"use client";
import { Blendy, createBlendy } from "blendy";
import { useEffect, useId, useRef, useState } from "react";
import { ArticleData } from "@/services/articleService";
import { fetchRecommendedArticles } from "@/services/fetchRecommendedArticles";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Clock, Plus } from "lucide-react";
import { toggleReadLater } from "@/services/ReadLaterArticle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlaylistCombobox } from "./playlist-combobox";
import ByteLearning from "./ui/bytelearning";
import { API_BASE_URL } from "@/config/api";

export function GlowingEffectDemo() {
  const [processedArticles, setProcessedArticles] = useState<{
    names: string[];
    images: string[];
    ids: string[];
  }>({
    names: [],
    images: [],
    ids: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process articles into separate arrays
  const processArticleArrays = (articles: ArticleData[]) => {
    const names = articles.map((article) => article.article_name);
    const ids = articles.map(
      (article) =>
        article.id || article.article_name.toLowerCase().replace(/\s+/g, "-")
    );
    const images = articles.map((article) => article.image_path);

    setProcessedArticles({ names, images, ids });
  };


  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        // Get current user ID
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          console.warn("No user ID found, skipping recommended fetch");
          return;
        }

        // Fetch the recommended articles from the users table
        const { error: recommendedError } =
          await supabase
            .from("users")
            .select("recommended_json")
            .eq("user_id", userId)
            .maybeSingle();

        if (recommendedError) {
          console.error("Error fetching recommended articles:", recommendedError);
          return;
        }
      } catch (error) {
        console.error("Error fetching recommended articles:", error);
      }
    };

    fetchRecommended();
  }, []);


  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          setError("Please log in to view your articles");
          setIsLoading(false);
          return;
        }

        const { data, error } = await fetchRecommendedArticles(userId);

        if (error) {
          setError(error);
        } else if (Array.isArray(data)) {
          processArticleArrays(data);
        }
      } catch (err) {
        setError("Failed to load articles");
        console.error("Error loading articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (isLoading) {
    return <ByteLearning />;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!isLoading && processedArticles.ids.length === 0) {
    return <div className="py-8 text-center text-gray-400">No recommended articles found.</div>;
  }

  // Create a structured layered layout
  const articleCount = processedArticles.ids.length;

  // Group articles into chunks of 10
  const articleChunks = [];
  for (let i = 0; i < articleCount; i += 10) {
    articleChunks.push(processedArticles.ids.slice(i, i + 10));
  }

  return (
    <div className="p-4 overflow-y-auto max-h-[calc(100vh)] scrollbar-hide">
      <div className="flex flex-col space-y-4">
        {articleChunks.map((chunk, chunkIndex) => (
          <div key={`chunk-${chunkIndex}`} className="space-y-4">
            {/* Layer 1: Left side one big div, right side two divs (one up, one down) */}
            {chunk.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left big div */}
                {chunk[0] && (
                  <div
                    className={`${chunk.length === 1 ? "md:col-span-12" : "md:col-span-8"
                      } md:row-span-2 min-h-[380px]`}
                  >
                    <GridItem
                      title={processedArticles.names[chunkIndex * 10]}
                      backgroundImage={
                        processedArticles.images[chunkIndex * 10] ||
                        "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                      }
                      article_id={chunk[0]}
                      cardStyle={{
                        backgroundColor: "none",
                        border: "0.2px solid zinc",
                        color: "white",
                      }}
                    />
                  </div>
                )}

                {/* Right side divs - only show if there are more than 1 article */}
                {chunk.length > 1 && (
                  <>
                    {/* Right side, top div */}
                    {chunk[1] && (
                      <div className="md:col-span-4 md:row-span-1 min-h-[180px]">
                        <GridItem
                          title={processedArticles.names[chunkIndex * 10 + 1]}
                          backgroundImage={
                            processedArticles.images[chunkIndex * 10 + 1] ||
                            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                          }
                          article_id={chunk[1]}
                          cardStyle={{
                            backgroundColor: "none",
                            border: "0.2px solid zinc",
                            color: "white",
                          }}
                        />
                      </div>
                    )}

                    {/* Right side, bottom div */}
                    {chunk[2] && (
                      <div className="md:col-span-4 md:row-span-1 min-h-[180px]">
                        <GridItem
                          title={processedArticles.names[chunkIndex * 10 + 2]}
                          backgroundImage={
                            processedArticles.images[chunkIndex * 10 + 2] ||
                            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                          }
                          article_id={chunk[2]}
                          cardStyle={{
                            backgroundColor: "none",
                            border: "0.2px solid zinc",
                            color: "white",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Layer 2: Two divs side by side */}
            {chunk.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left div */}
                {chunk[3] && (
                  <div
                    className={`${chunk.length === 4 ? "md:col-span-12" : "md:col-span-6"
                      } min-h-[200px]`}
                  >
                    <GridItem
                      title={processedArticles.names[chunkIndex * 10 + 3]}
                      backgroundImage={
                        processedArticles.images[chunkIndex * 10 + 3] ||
                        "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                      }
                      article_id={chunk[3]}
                      cardStyle={{
                        backgroundColor: "none",
                        border: "0.2px solid zinc",
                        color: "white",
                      }}
                    />
                  </div>
                )}

                {/* Right div */}
                {chunk.length > 4 && chunk[4] && (
                  <div className="md:col-span-6 min-h-[200px]">
                    <GridItem
                      title={processedArticles.names[chunkIndex * 10 + 4]}
                      backgroundImage={
                        processedArticles.images[chunkIndex * 10 + 4] ||
                        "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                      }
                      article_id={chunk[4]}
                      cardStyle={{
                        backgroundColor: "none",
                        border: "0.2px solid zinc",
                        color: "white",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Layer 3: One big div right side, left side two divs (one up, one down) - mirrored from layer 1 */}
            {chunk.length > 5 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* If only one item in this layer, make it full width */}
                {chunk.length === 6 && chunk[5] && (
                  <div className="md:col-span-12 min-h-[280px]">
                    <GridItem
                      title={processedArticles.names[chunkIndex * 10 + 5]}
                      backgroundImage={
                        processedArticles.images[chunkIndex * 10 + 5] ||
                        "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                      }
                      article_id={chunk[5]}
                      cardStyle={{
                        backgroundColor: "none",
                        border: "0.2px solid zinc",
                        color: "white",
                      }}
                    />
                  </div>
                )}

                {chunk.length > 6 && (
                  <>
                    <div className="md:col-span-4 md:row-span-2 flex flex-col gap-4">
                      {/* Left side, top div */}
                      {chunk[5] ? (
                        <div className="min-h-[180px] h-full">
                          <GridItem
                            title={processedArticles.names[chunkIndex * 10 + 5]}
                            backgroundImage={
                              processedArticles.images[chunkIndex * 10 + 5] ||
                              "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                            }
                            article_id={chunk[5]}
                            cardStyle={{
                              backgroundColor: "none",
                              border: "0.2px solid zinc",
                              color: "white",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="min-h-[180px]"></div>
                      )}

                      {/* Left side, bottom div */}
                      {chunk[6] ? (
                        <div className="min-h-[180px] h-full">
                          <GridItem
                            title={processedArticles.names[chunkIndex * 10 + 6]}
                            backgroundImage={
                              processedArticles.images[chunkIndex * 10 + 6] ||
                              "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                            }
                            article_id={chunk[6]}
                            cardStyle={{
                              backgroundColor: "none",
                              border: "0.2px solid zinc",
                              color: "white",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="min-h-[180px]"></div>
                      )}
                    </div>

                    {/* Right big div */}
                    {chunk[7] && (
                      <div className="md:col-span-8 md:row-span-2 min-h-[380px]">
                        <GridItem
                          title={processedArticles.names[chunkIndex * 10 + 7]}
                          backgroundImage={
                            processedArticles.images[chunkIndex * 10 + 7] ||
                            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                          }
                          article_id={chunk[7]}
                          cardStyle={{
                            backgroundColor: "none",
                            border: "0.2px solid zinc",
                            color: "white",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Layer 4: Two divs side by side or one full-width div if only one item remains */}
            {chunk.length > 8 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* If only one item in this layer, make it full width */}
                {chunk.length === 9 && chunk[8] && (
                  <div className="md:col-span-12 min-h-[280px]">
                    <GridItem
                      title={processedArticles.names[chunkIndex * 10 + 8]}
                      backgroundImage={
                        processedArticles.images[chunkIndex * 10 + 8] ||
                        "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                      }
                      article_id={chunk[8]}
                      cardStyle={{
                        backgroundColor: "none",
                        border: "0.2px solid zinc",
                        color: "white",
                      }}
                    />
                  </div>
                )}

                {chunk.length > 9 && (
                  <>
                    {/* Left div */}
                    {chunk[8] && (
                      <div className="md:col-span-6 min-h-[200px]">
                        <GridItem
                          title={processedArticles.names[chunkIndex * 10 + 8]}
                          backgroundImage={
                            processedArticles.images[chunkIndex * 10 + 8] ||
                            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                          }
                          article_id={chunk[8]}
                          cardStyle={{
                            backgroundColor: "none",
                            border: "0.2px solid zinc",
                            color: "white",
                          }}
                        />
                      </div>
                    )}

                    {/* Right div */}
                    {chunk[9] && (
                      <div className="md:col-span-6 min-h-[200px]">
                        <GridItem
                          title={processedArticles.names[chunkIndex * 10 + 9]}
                          backgroundImage={
                            processedArticles.images[chunkIndex * 10 + 9] ||
                            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60"
                          }
                          article_id={chunk[9]}
                          cardStyle={{
                            backgroundColor: "none",
                            border: "0.2px solid zinc",
                            color: "white",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface GridItemProps {
  title: string;
  cardStyle: React.CSSProperties;
  backgroundImage?: string;
  article_id: string;
}

const GridItem = ({
  title,
  cardStyle,
  backgroundImage,
  article_id,
}: GridItemProps) => {
  const darkenColor = (color: string, factor: number = 0.1): string => {
    let hex = color.replace("#", "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.floor(r * (1 - factor)));
    g = Math.max(0, Math.floor(g * (1 - factor)));
    b = Math.max(0, Math.floor(b * (1 - factor)));

    const toHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return "#" + toHex(r) + toHex(g) + toHex(b);
  };

  const containerRef = useRef(null);
  const outerCardStyle = {
    ...cardStyle,
    backgroundColor: darkenColor(cardStyle.backgroundColor as string, 0.9999),
  };
  const blendy = useRef<Blendy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlaylistCombobox, setShowPlaylistCombobox] = useState(false);

  const rawId = useId();
  const id = rawId.replace(/:/g, "_");

  useEffect(() => {
    blendy.current = createBlendy({ animation: "dynamic" });

    return () => {
      if (showModal) {
        blendy.current?.untoggle(id, () => {
          setShowModal(false);
        });
      }
    };
  }, [showModal]);

  useEffect(() => {
    async function get_recommendation() {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        console.warn("No user information available, skipping recommendation upload");
        return;
      }
      const userId = userData?.user?.id;
      try {
        if (!userId || !article_id) {
          console.warn("No user or article information available, skipping recommendation upload");
          return;
        }

        const formData = new FormData();
        formData.append("user_id", userId);
        // formData.append("article_id", article_id);

        const response = await fetch(`${API_BASE_URL}/api/recommendationHome`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Recommendation failed");
        }
      } catch (error) {
        console.error("Recommendation error:", error);
      }
    }

    get_recommendation();
  }, []);





  const navigate = useNavigate();

  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    // Check if the article is in watch later when component mounts
    const checkWatchLaterStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: userData } = await supabase
          .from("users")
          .select("watch_later")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userData?.watch_later) {
          const isInList = userData.watch_later.some(
            (article: { article_id: string }) =>
              article.article_id === article_id
          );
          setIsInWatchLater(isInList);
        }
      }
    };
    checkWatchLaterStatus();
  }, [article_id]);

  const handleReadLater = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User must be logged in to use read later feature");
      return;
    }

    try {
      const { error, isInWatchLater: newStatus } = await toggleReadLater(
        user.id,
        article_id,
        title
      );
      if (error) {
        console.error("Error toggling read later status:", error);
        return;
      }

      setIsAnimating(true);
      setShowConfirmation(true);
      setConfirmationMessage(
        newStatus ? "Added to read later" : "Removed from read later"
      );
      setTimeout(() => {
        setShowConfirmation(false);
        setIsAnimating(false);
      }, 2000);

      setIsInWatchLater(newStatus ?? false);
    } catch (error) {
      console.error("Error in read later operation:", error);
    }
  };

  return (
    <div className="h-full w-full">
      <div
        className="relative h-full rounded-2xl border shadow-lg group/card"
        data-blendy-from={id}
        style={outerCardStyle}
        onClick={() => navigate(`/article/${article_id}`)}
      >
        <TooltipProvider>
          <div className="absolute right-3 top-3 flex flex-col gap-2 z-50">
            {/* Read Later Button Container */}
            <div
              className={`${isInWatchLater
                  ? "opacity-100"
                  : "opacity-0 group-hover/card:opacity-100"
                } transition-opacity duration-200 relative h-[32px]`}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  width: isAnimating
                    ? confirmationMessage.includes("Removed")
                      ? "200px"
                      : "180px"
                    : "32px",
                  transition: "width 300ms ease-in-out",
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`
                        w-full relative overflow-hidden
                        transition-all duration-300 ease-in-out
                        backdrop-blur-sm flex items-center justify-center
                        ${backgroundImage
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-black/10 hover:bg-black/20 text-black"
                        }
                        ${isInWatchLater}
                        rounded-full
                        ${showConfirmation ? "px-3 py-1.5" : "p-1.5"}
                      `}
                      onClick={handleReadLater}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        {showConfirmation && (
                          <span className="text-sm whitespace-nowrap">
                            {confirmationMessage}
                          </span>
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      {isInWatchLater ? "Remove from Read Later" : "Read Later"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Add to Playlist Button Container */}
            <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 h-[32px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      p-1.5 rounded-full backdrop-blur-sm transition-colors
                      flex items-center justify-center
                      ${backgroundImage
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-black/10 hover:bg-black/20 text-black"
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showPlaylistCombobox) {
                        setShowPlaylistCombobox(false);
                      } else {
                        setShowPlaylistCombobox(true);
                      }
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Add to Playlist</p>
                </TooltipContent>
              </Tooltip>
              {showPlaylistCombobox && (
                <div className="absolute right-0 top-8 z-50">
                  <PlaylistCombobox
                    onClose={() => setShowPlaylistCombobox(false)}
                    articleId={article_id}
                  />
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>
        {/* <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          children={undefined}
        /> */}
        <div
          className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl hover:cursor-pointer"
          style={{
            ...cardStyle,
            backgroundImage: backgroundImage
              ? `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.85) 100%), url(${backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: backgroundImage
              ? "grayscale(40%) hover:grayscale(0)"
              : "none",
            padding: "17px",
            fontWeight: "500",
            transition: "all 0.4s ease",
          }}
        >
          <div className="relative flex flex-1 flex-col justify-end gap-3">
            <div className="mt-auto z-10">
              <h3 className="text-xl text-balance">
                <div ref={containerRef}>
                  {title}
                </div>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

