import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";

import Recommended from "@/components/Recommended";
import {
  extractColorsFromImage,
  ColorPalette,
  generateThemePalette,
  ColorMode,
  ExtractedColors,
  getTextColor,
  extractColors,
  hexToHsv,
  hsvToHex,
} from "@/utils/materialColorUtils";
import { toggleArticleCompletion } from "@/services/CompleteArticle";
import { toggleArticleBookmark } from "@/services/BookmarkArticle";
import { downloadPDF } from "@/services/downloadPDF";

export default function ArticlePage() {
  const { article_id } = useParams();
  const navigate = useNavigate();


  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [themePalette, setThemePalette] = useState<ColorPalette | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [extractedColors, setExtractedColors] = useState<ExtractedColors>({
    primary: "#ffffff",
    secondary: "#ffffff",
    textColor: "#000000",
    accentColor: "#ffffff",
  });


  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setIsLoading(true);

        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("article_id", article_id)
          .single();

        if (articleError) throw articleError;

        if (articleData) {
          setTitle(articleData.article_name);
          setContent(articleData.content_text);


          const imageUrl =
            articleData.content_img ||
            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=60";
          setBackgroundImage(imageUrl);


          setIsCompleted(!!articleData.is_completed);


          if (imageUrl) {
            try {
              const colors = await extractColorsFromImage(imageUrl);
              setExtractedColors(colors);
              const colorHexes = await extractColors(imageUrl);
              const palette = generateThemePalette(colorHexes);
              setThemePalette(palette);
            } catch (colorError) {
              console.error("Error extracting colors:", colorError);
            }
          }


          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user?.id) {
            const { data: userData } = await supabase
              .from("users")
              .select("bookmarked_articles")
              .eq("user_id", user.id)
              .maybeSingle();

            if (userData?.bookmarked_articles) {
              const isBookmarkedArticle = userData.bookmarked_articles.some(
                (article: { article_id: string }) =>
                  article.article_id === article_id,
              );
              setIsBookmarked(isBookmarkedArticle);
            }
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {

          const currentTime = new Date().toISOString();
          const newHistoryEntry = {
            [currentTime]: article_id,
          };

          const { data: userData } = await supabase
            .from("users")
            .select("history")
            .eq("user_id", user.id)
            .maybeSingle();

          if (userData?.history) {
            await supabase
              .from("users")
              .update({
                history: {
                  history: { ...userData.history.history, ...newHistoryEntry },
                },
              })
              .eq("user_id", user.id);
          } else {
            await supabase
              .from("users")
              .update({
                history: {
                  history: newHistoryEntry,
                },
              })
              .eq("user_id", user.id);
          }
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => setShowContent(true), 50);
      }
    };

    if (article_id) {
      fetchArticleData();
    }
  }, [article_id]);

  const toggleColorMode = () => {
    setColorMode(colorMode === "light" ? "dark" : "light");
  };

  const getThemeColors = () => {
    if (themePalette) {
      return colorMode === "light" ? themePalette.light : themePalette.dark;
    }
    return null;
  };

  const themeColors = getThemeColors();


  const getTextTint = () => {
    if (!themePalette) return colorMode === "light" ? "#1A1A1A" : "#F5F5F5";

    const primaryHsv = hexToHsv(
      colorMode === "light"
        ? themePalette.light.primary
        : themePalette.dark.primary,
    );

    if (!primaryHsv) return colorMode === "light" ? "#1A1A1A" : "#F5F5F5";



    const [h, ,] = primaryHsv;
    if (colorMode === "light") {
      return hsvToHex(h, 3, 10);
    } else {
      return hsvToHex(h, 3, 97);
    }
  };


  const getButtonBgStyle = (color?: string, alpha = 0.08) => {
    const baseColor = color || themeColors?.primary || extractedColors.primary;
    return {
      backgroundColor: `${baseColor}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`,
      borderColor: `${baseColor}${Math.round(alpha * 2 * 255)
        .toString(16)
        .padStart(2, "0")}`,
    };
  };


  const pageStyle = {
    backgroundColor: themeColors?.background || extractedColors.primary,
    color: getTextTint(),
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={pageStyle}
      >
        <div className="animate-pulse">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ ...pageStyle }}>
      <div
        className={`transition-opacity duration-200 ${showContent ? "opacity-100" : "opacity-0"
          } overflow-y-auto h-screen scrollbar-hide`}
      >
        <div className="p-4">
          <div className="bg-opacity-80" style={pageStyle}>
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* For the back button - very subtle background */}
                <button
                  onClick={() => navigate("/home")}
                  className="p-2 rounded-full hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center"
                  style={getButtonBgStyle(themeColors?.primary, 0.08)}
                  aria-label="Go back"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    style={{ color: pageStyle.color }} // Match text color
                  />
                </button>

                {/* For the ByteLearn title and icon - subtle tint */}
                <h2 className="modal__title flex items-center gap-2 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={pageStyle.color} // Just match text color
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span style={{ color: pageStyle.color }}>ByteLearn</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* For the download PDF button - subtle background */}
                <button
                  className="px-3 py-2 rounded-full flex items-center gap-2 justify-center group border hover:bg-opacity-80"
                  onClick={() => {
                    const content = document.querySelector(".article-content");
                    if (content) {
                      downloadPDF(content as HTMLElement, title);
                    }
                  }}
                  style={getButtonBgStyle(undefined, 0.08)} // 8% opacity background
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={themeColors?.primary} // Match text color
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>

                {/* For the complete button - subtle primary for background, more visible secondary for active state */}
                <button
                  className={`px-3 py-2 rounded-full flex items-center gap-2 justify-center group border ${isCompleted ? "cursor-default" : "hover:bg-opacity-80"
                    }`}
                  onClick={async () => {
                    if (!isCompleted) {
                      setIsCompleted(true);
                      const result = await toggleArticleCompletion(article_id!);
                      if (result.error) {
                        setIsCompleted(false);
                        console.error(
                          "Failed to update completion status:",
                          result.error,
                        );
                      }
                    }
                  }}
                  disabled={isCompleted}
                  style={
                    isCompleted
                      ? {
                        backgroundColor:
                          themeColors?.secondary || extractedColors.secondary,
                        borderColor:
                          themeColors?.secondary || extractedColors.secondary,
                      }
                      : getButtonBgStyle(undefined, 0.08) // 8% opacity for normal state
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={
                      isCompleted ? pageStyle.backgroundColor : pageStyle.color // Match text color when not active
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span
                    style={{
                      color: isCompleted
                        ? pageStyle.backgroundColor
                        : pageStyle.color, // Match text color when not active
                    }}
                  >
                    {isCompleted ? "Completed" : "Mark as completed"}
                  </span>
                </button>

                {/* For the bookmark button - very subtle background, only icon gets themed */}
                <button
                  className="p-2 rounded-full hover:bg-opacity-80 transition-all duration-200"
                  onClick={async () => {
                    const user = await supabase.auth.getUser();
                    const user_id = user?.data?.user?.id;
                    if (user_id && article_id) {
                      const result = await toggleArticleBookmark(
                        user_id,
                        article_id,
                        title,
                      );
                      if (!result.error) {
                        setIsBookmarked(!isBookmarked);
                      }
                    }
                  }}
                  style={getButtonBgStyle(undefined, 0.08)} // 8% opacity background
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={
                      isBookmarked
                        ? themeColors?.primary || extractedColors.primary
                        : "none"
                    }
                    stroke={
                      isBookmarked
                        ? themeColors?.primary || extractedColors.primary
                        : themeColors?.primary
                    } // Match text color when not active
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>

                {/* For the theme toggle button - subtle background */}
                <button
                  className="p-2 rounded-full hover:bg-opacity-80 transition-colors duration-200"
                  onClick={toggleColorMode}
                  style={getButtonBgStyle(undefined, 0.08)} // 8% opacity background
                >
                  {colorMode === "dark" ? (
                    <Sun
                      className="h-4 w-4"
                      style={{ color: themeColors?.primary }} // Match text color
                    />
                  ) : (
                    <Moon
                      className="h-4 w-4"
                      style={{ color: themeColors?.primary }} // Match text color
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <article className="max-w-[89%] mx-auto article-content pb-8 relative">
          <div
            className="relative rounded-xl overflow-hidden mt-4 mb-6 h-[300px] w-full"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>

          <div className="space-y-6">
            {/* For the article title - keep it simple with the text color (no gradient) */}
            <h1
              className="text-6xl font-bold"
              style={{ color: pageStyle.color }}
            >
              {title}
            </h1>

            <div
              className="prose inner-html dark:prose-invert max-w-none overflow-x-hidden"
              style={{
                // color: "inherit",
                width: "100%",
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content),
              }}
            />

            {/* For the Material You Theme - minimal accent */}
            {themePalette && (
              <div
                className="mt-6 pt-6 border-t border-opacity-20"
                style={{ borderColor: pageStyle.color }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{
                    color: pageStyle.color,
                    opacity: 0.9, // Slightly dimmer than main text
                  }}
                >
                  Material You Theme
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {Object.entries(themeColors || {}).map(([key, color]) => (
                    <div key={key} className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-7">
            <Recommended
              article_id={article_id || ""}
              colorMode={colorMode}
            />{" "}
          </div>
        </article>
        {/* <div>{get_recommendation()}</div> */}
        <div className="w-full flex mt-8">
          {[
            ...(themeColors
              ? [
                themeColors.primary,
                themeColors.secondary,
                themeColors.tertiary,
                themeColors.background,
                themeColors.surface,
                themeColors.error,
              ]
              : []),
            "#000000", // Black
            "#ffffff", // White
          ].map((color, index) => {
            const letters = "";
            return (
              <div
                key={index}
                className="flex-1 h-2 flex items-center justify-center font-bold text-lg group border-t"
                style={{
                  backgroundColor: color,
                  color: getTextColor(color),
                  borderColor: pageStyle.color,
                }}
              >
                <span className="transform group-hover:scale-125 transition-transform duration-300 cursor-default">
                  {letters[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
