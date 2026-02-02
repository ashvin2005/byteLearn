import {
  Video,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  // BarChart,
  Beaker,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { chapters } from "./CourseSidebar";
import { useState } from "react";

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-gray-500" />;
    case "reading":
      return <BookOpen className="h-4 w-4 text-gray-500" />;
    case "quiz":
      return <ClipboardCheck className="h-4 w-4 text-gray-500" />;
    case "lab":
      return <Beaker className="h-4 w-4 text-gray-500" />;
    default:
      return <Video className="h-4 w-4 text-gray-500" />;
  }
};

const chapterContent = [
  {
    title: "Stay informed about AI",
    expanded: true,
    items: [
      {
        title: "Introduction to AI Fundamentals",
        type: "video",
        duration: "5 min",
      },
      {
        title: "Understanding AI Concepts",
        type: "reading",
        duration: "10 min",
      },
      { title: "AI Foundations Quiz", type: "quiz", duration: "15 min" },
      { title: "Hands-on AI Lab", type: "lab", duration: "30 min" },
    ],
  },
  {
    title: "Learn from AI Innovation",
    items: [
      { title: "AI Use Cases in Industry", type: "video", duration: "8 min" },
      {
        title: "Case Study: AI Implementation",
        type: "reading",
        duration: "15 min",
      },
      { title: "AI Innovation Assessment", type: "quiz", duration: "20 min" },
    ],
  },
  {
    title: "Continue your AI Journey",
    items: [
      { title: "Advanced AI Concepts", type: "video", duration: "10 min" },
      { title: "Future of AI", type: "reading", duration: "12 min" },
      { title: "Course Feedback", type: "survey", duration: "5 min" },
    ],
  },
];

export const CourseContent = () => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    "Stay informed about AI": true,
  });

  const currentChapter =
    chapters.find((chapter) => chapter.current) || chapters[0];

  const chapterProgress = () => {
    const completedTopics = currentChapter.subtopics.filter(
      (topic) => topic.completed
    ).length;
    return Math.round(
      (completedTopics / currentChapter.subtopics.length) * 100
    );
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="flex-1 w-full bg-[#000000] p-8">
      {/* Chapter Overview Card */}
      <div className="bg-[#1E1E1E] rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-medium text-white mb-1">
                {currentChapter.title}
              </h2>
              <p className="text-sm text-gray-400">
                Master the fundamentals of {currentChapter.title}
              </p>
            </div>
            <div className="h-1 w-32 bg-[#282828] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4B6CC1] transition-all duration-300 ease-in-out"
                style={{ width: `${chapterProgress()}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>22 min of videos left</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>12 min of readings left</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>All graded assessments completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content Sections */}
      <div className="space-y-2">
        {chapterContent.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-[#050505] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#282828] transition-colors"
            >
              <span className="text-base font-medium text-white">
                {section.title}
              </span>
              {expandedSections[section.title] ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSections[section.title] && (
              <div className="divide-y divide-[#282828]">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#282828] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getContentTypeIcon(item.type)}
                      <div>
                        <h4 className="text-sm font-medium text-white">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}{" "}
                          • {item.duration}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#1E364D] hover:bg-[#254563] text-[#B4D0F3] text-xs px-4 py-1 rounded font-medium transition-colors"
                    >
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
