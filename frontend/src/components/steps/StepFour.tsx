import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Image,
  ListOrdered,
  Newspaper,
  Pencil,
  MessageSquare,
} from "lucide-react";

interface StepFourProps {
  className?: string;
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
}

const studyMethods = [
  {
    id: "bullet-points",
    title: "Bullet Points",
    description: "Concise, organized learning points",
    icon: ListOrdered,
  },
  {
    id: "story",
    title: "Story",
    description: "Learn through narrative and context",
    icon: MessageSquare,
  },
  {
    id: "illustration",
    title: "Illustration",
    description: "Visual learning with diagrams",
    icon: Image,
  },
  {
    id: "examples",
    title: "Examples",
    description: "Practice with real-world cases",
    icon: BookOpen,
  },
  {
    id: "news",
    title: "News",
    description: "Current events and applications",
    icon: Newspaper,
  },
  {
    id: "pictorial",
    title: "Pictorial",
    description: "Image-based learning approach",
    icon: Pencil,
  },
];

const StepFour: React.FC<StepFourProps> = ({
  className,
  selectedMethods,
  onMethodsChange,
}) => {
  const handleMethodClick = (methodId: string) => {
    if (selectedMethods.includes(methodId)) {
      onMethodsChange(selectedMethods.filter((id) => id !== methodId));
    } else {
      onMethodsChange([...selectedMethods, methodId]);
    }
  };

  return (
    <div
      className={`${className} px-1 py-4 rounded-xl backdrop-blur-sm bg-zinc  border-zinc-800/50`}
    >
      <div className="space-y-4 w-full max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-zinc-100">
            Select Study Methods
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Choose one or more methods that suit your learning style
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {studyMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethods.includes(method.id);

            return (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleMethodClick(method.id)}
                className={`
                  relative overflow-hidden rounded-xl p-3 cursor-pointer
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/2"
                      : "bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/80"
                  }
                  border transition-all duration-300
                `}
              >
                <div className="space-y-2">
                  <div className="p-1.5 rounded-lg w-fit bg-zinc-800/60">
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected ? "text-zinc-200" : "text-zinc-400"
                      } 
                      transition-colors duration-300`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200">
                      {method.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      {method.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-zinc-700/5 to-transparent animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepFour;
