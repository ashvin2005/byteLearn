import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  MoreVertical,
  ExternalLink,
  Lock,
  Globe,
} from "lucide-react";
import { fetchArticles, ArticleData } from "@/services/articleService";

// Interface for playlist data from Supabase
interface PlaylistData {
  id: string; // This is the playlist name serving as the identifier
  name: string;
  description?: string;
  cover_image?: string;
  article_count: number;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  article_ids: string[];
}

// Interface for playlist article
interface PlaylistArticle extends ArticleData {
  position: number;
}

const PlaylistPage = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [articles, setArticles] = useState<PlaylistArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        if (!user?.id || !playlistId) {
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("playlists")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (!userData || !userData.playlists) {
          throw new Error("No playlists found");
        }

        const playlistsData = userData.playlists;
        const trimmedPlaylistId = playlistId.trim();

        // Find the playlist by comparing trimmed keys
        const playlistKey = Object.keys(playlistsData).find(
          (key) => key.trim() === trimmedPlaylistId
        );

        if (!playlistKey) {
          throw new Error("Playlist not found");
        }

        const playlistDetails = playlistsData[playlistKey];

        // Format the playlist data
        const formattedPlaylist: PlaylistData = {
          id: playlistKey,
          name: playlistKey,
          description: playlistDetails.description || "",
          cover_image: playlistDetails.cover_image || "",
          article_count: playlistDetails.article_ids?.length || 0,
          is_public: playlistDetails.is_public,
          updated_at: playlistDetails.updated_at,
          created_at: playlistDetails.created_at,
          article_ids: playlistDetails.article_ids || [],
        };

        setPlaylist(formattedPlaylist);

        // If the playlist has articles, fetch them
        if (
          formattedPlaylist.article_ids &&
          formattedPlaylist.article_ids.length > 0
        ) {
          // Fetch all articles
          const { data: allArticles, error: articlesError } =
            await fetchArticles(user.id);

          if (articlesError) {
            throw new Error(articlesError);
          }

          if (!allArticles) {
            throw new Error("Failed to fetch articles");
          }

          // Filter articles to only include those in the playlist
          const playlistArticles = formattedPlaylist.article_ids
            .map((articleId, index) => {
              const article = allArticles.find(
                (a) => a.article_id === articleId
              );
              if (article) {
                return {
                  ...article,
                  position: index + 1,
                };
              }
              return null;
            })
            .filter((article): article is PlaylistArticle => article !== null);

          setArticles(playlistArticles);
        }
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [user?.id, playlistId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Please log in to view this playlist.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Loading playlist...
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Error loading playlist:
        <br />
        {error?.message || "Playlist not found"}
      </div>
    );
  }

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-[#000000] to-[#0A0A0A] text-foreground">
      <div className="px-3 md:px-4 pt-8 max-w-[1400px] mx-auto w-full">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/playlists")}
            className="flex items-center text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            {playlist.name}
          </h1>
        </div>

        {/* Playlist header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="w-full lg:w-[320px] aspect-video relative rounded-xl overflow-hidden">
            <img
              src={
                playlist.cover_image ||
                `https://placehold.co/400x225/333/FFF?text=${encodeURIComponent(
                  playlist.name
                )}`
              }
              alt={playlist.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, replace with placeholder
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/400x225/333/FFF?text=${encodeURIComponent(
                  playlist.name
                )}`;
              }}
            />
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={60}
              inactiveZone={0.01}
              children={undefined}
            />
          </div>

          <div className="flex flex-col justify-between flex-grow">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span>
                    {playlist.article_count}{" "}
                    {playlist.article_count === 1 ? "article" : "articles"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-1">
                    {playlist.is_public ? (
                      <>
                        <Globe className="w-4 h-4" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Private
                      </>
                    )}
                    {" • Playlist"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(playlist.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(playlist.updated_at)}</span>
                </div>
              </div>

              {playlist.description && (
                <p className="text-muted-foreground">{playlist.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {articles.length > 0 && (
                <>
                  <Link
                    to={`/article/${articles[0].article_id}`}
                    className="flex items-center gap-2 bg-primary rounded-full px-6 py-2 font-medium"
                  >
                    <Play className="w-5 h-5" fill="currentColor" /> Play all
                  </Link>
                  {/* <button className="flex items-center gap-2 bg-card/30 hover:bg-card/50 rounded-full px-4 py-2 text-sm">
                    <Shuffle className="w-4 h-4" /> Shuffle
                  </button> */}
                </>
              )}
              {/* <button className="flex items-center gap-2 bg-card/30 hover:bg-card/50 rounded-full px-4 py-2 text-sm">
                <Download className="w-4 h-4" /> Download
              </button> */}
              {/* <button className="p-2 bg-card/30 hover:bg-card/50 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button> */}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-0 border-b border-border/30 mb-6">
          <div className="flex gap-6 text-sm font-medium">
            {["All", "Articles", "Recent"].map((tab) => (
              <button
                key={tab}
                className={`py-3 border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                } transition-colors`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Articles list */}
        <div className="py-4">
          {articles.length === 0 ? (
            <div className="text-lg text-muted-foreground p-4">
              This playlist has no articles.
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <Link
                  key={article.article_id}
                  to={`/article/${article.article_id}`}
                  className="block"
                >
                  <div className="relative bg-gradient-to-b from-card/60 to-card/40 text-card-foreground rounded-lg p-4 shadow border border-border/30 backdrop-blur-sm hover:border-border/60 transition-all duration-300 group">
                    <GlowingEffect
                      spread={30}
                      glow={true}
                      disabled={false}
                      proximity={50}
                      inactiveZone={0.01}
                      children={undefined}
                    />
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 text-muted-foreground text-center">
                        {article.position}
                      </div>

                      <div className="relative flex-shrink-0 w-40 h-24 bg-card/50 rounded-lg overflow-hidden">
                        <img
                          src={
                            article.image_path ||
                            `https://placehold.co/320x180/333/FFF?text=Article+${article.position}`
                          }
                          alt={article.article_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, replace with placeholder
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/320x180/333/FFF?text=Article+${article.position}`;
                          }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                          <div className="bg-primary/90 rounded-full p-2">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-medium line-clamp-2 text-lg">
                            {article.article_name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {article.content_text
                              ? article.content_text.slice(0, 100) +
                                (article.content_text.length > 100 ? "..." : "")
                              : "No description available"}
                          </p>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                          {article.is_completed && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                                {article.tags[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button className="self-start p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
