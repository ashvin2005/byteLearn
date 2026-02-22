import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetails } from "../services/courseDetailsService";
import { Check, ArrowLeft } from "lucide-react";

interface Topic {
  topic_id: string;
  topic_name: string;
  isCompleted?: boolean;
}

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  topics: Topic[];
  isCompleted?: boolean;
}

interface CourseDetails {
  course_id: string;
  course_name: string;
  chapters: Chapter[];
  tags?: string[];
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        if (!courseId) {
          setError("Course ID is required");
          setLoading(false);
          return;
        }

        const details = await fetchCourseDetails(courseId);

        if (!details) {
          setError("Failed to load course details");
          setLoading(false);
          return;
        }

        setCourseDetails(details);
        setLoading(false);
      } catch (err) {
        console.error("Error loading course details:", err);
        setError("An error occurred while loading course details");
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [courseId]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!courseDetails) {
    return <div className="p-4">No course details found</div>;
  }

  // Calculate chapter progress
  const calculateChapterProgress = (chapter: Chapter) => {
    if (!chapter.topics.length) return 0;
    const completedTopics = chapter.topics.filter(
      (topic) => topic.isCompleted
    ).length;
    return Math.round((completedTopics / chapter.topics.length) * 100);
  };

  // Set initial selected chapter if not already set
  if (courseDetails?.chapters.length && !selectedChapter) {
    setSelectedChapter(courseDetails.chapters[0].chapter_id);
  }

  const currentChapter = courseDetails?.chapters.find(
    (chapter) => chapter.chapter_id === selectedChapter
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#000000] to-[#0A0A0A] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-[#070707] to-[#0A0A0A] border-r border-[#2D2D2D] overflow-y-auto shadow-xl">
        <div className="p-6 space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {courseDetails.course_name}
            </h2>
            {courseDetails.tags && (
              <div className="flex flex-wrap gap-2">
                {courseDetails.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-[#2D2D2D] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {courseDetails.chapters.map((chapter) => {
              const isSelected = chapter.chapter_id === selectedChapter;
              return (
                <button
                  key={chapter.chapter_id}
                  onClick={() => setSelectedChapter(chapter.chapter_id)}
                  className={`w-full text-left p-4 rounded-lg flex items-center gap-3 transition-all duration-300 ease-in-out backdrop-blur-sm
                    ${
                      isSelected
                        ? "bg-[#2D2D2D]/90 shadow-lg ring-1 ring-white/10"
                        : "hover:bg-[#2D2D2D]/60 hover:shadow-md hover:scale-[1.02]"
                    }`}
                >
                  {chapter.isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-[#4B6CC1] flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0
                      ${isSelected ? "border-[#4B6CC1]" : "border-gray-500"}`}
                    />
                  )}
                  <span className="flex-1 truncate">
                    {chapter.chapter_name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {currentChapter && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">
                {currentChapter.chapter_name}
              </h1>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Chapter Progress</span>
                  <span className="text-white font-medium">
                    {calculateChapterProgress(currentChapter)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#2D2D2D] rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#4B6CC1] to-[#6C8CE1] transition-all duration-300 ease-in-out shadow-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer"
                    style={{
                      width: `${calculateChapterProgress(currentChapter)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
              {currentChapter.topics.map((topic) => (
                <div
                  key={topic.topic_id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[#1E1E1E]/80 hover:bg-[#2D2D2D]/80 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01] backdrop-blur-sm border border-white/5"
                >
                  {topic.isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-[#4B6CC1] flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0" />
                  )}
                  <span className="flex-1">{topic.topic_name}</span>
                </div>
              ))}

              {currentChapter.topics.length === 0 && (
                <p className="text-gray-500">
                  No topics available for this chapter
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
