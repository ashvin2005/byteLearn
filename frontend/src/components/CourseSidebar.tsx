import { Check } from "lucide-react";

// Define the structure for chapters
export const chapters = [
  {
    title: "Introduction to Computer Networks",
    completed: true,
    subtopics: [
      { title: "What are Computer Networks?", completed: true },
      { title: "Types of Networks", completed: true },
      { title: "Network Topologies", completed: true },
    ],
  },
  {
    title: "OSI Model",
    completed: false,
    current: true,
    subtopics: [
      { title: "Physical Layer", completed: true },
      { title: "Data Link Layer", completed: true },
      { title: "Network Layer", completed: false, current: true },
      { title: "Transport Layer", completed: false },
      { title: "Session Layer", completed: false },
      { title: "Presentation Layer", completed: false },
      { title: "Application Layer", completed: false },
    ],
  },
  {
    title: "TCP/IP Protocol Suite",
    completed: false,
    subtopics: [
      { title: "IP Addressing", completed: false },
      { title: "Subnetting", completed: false },
      { title: "Routing Protocols", completed: false },
    ],
  },
];

const calculateProgress = () => {
  let totalTopics = 0;
  let completedTopics = 0;

  chapters.forEach((chapter) => {
    totalTopics += chapter.subtopics.length;
    completedTopics += chapter.subtopics.filter(
      (topic) => topic.completed
    ).length;
  });

  return Math.round((completedTopics / totalTopics) * 100);
};

export const CourseSidebar = () => {
  const progress = calculateProgress();

  return (
    <div className="h-full bg-[#070707] border-r border-[#2D2D2D]">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-white mb-1">
            Computer Networks
          </h2>
          <p className="text-sm text-gray-400">Essential Concepts</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Course Progress</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
          <div className="h-1 bg-[#2D2D2D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4B6CC1] transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Course Material Label */}
        <div className="text-sm text-gray-400 font-medium">Course Material</div>

        {/* Course chapters */}
        <div className="space-y-1">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors
                ${chapter.current ? "bg-[#2D2D2D]" : "hover:bg-[#2D2D2D]"}`}
            >
              {chapter.completed ? (
                <div className="w-5 h-5 rounded-full bg-[#4B6CC1] flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0
                  ${chapter.current ? "border-[#4B6CC1]" : "border-gray-500"}`}
                />
              )}
              <span
                className={`text-sm ${
                  chapter.current ? "text-white font-medium" : "text-gray-400"
                }`}
              >
                {chapter.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
