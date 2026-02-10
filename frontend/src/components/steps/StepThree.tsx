import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StepThreeProps {
  className?: string;
  welcomeMessage: string;
  courseTitle: string;
  onCourseTitleChange?: (title: string) => void;
  technicalTerms: Array<{
    name: string;
    color: string;
  }>;
  isProcessing: boolean;
}

const StepThree: React.FC<StepThreeProps> = ({ className, welcomeMessage, courseTitle: initialTitle, onCourseTitleChange, technicalTerms, isProcessing }) => {
  const [editableTitle, setEditableTitle] = useState(initialTitle || "");
  const [isEditing, setIsEditing] = useState(!initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);


  const realTerms = technicalTerms.filter(t => t.name && t.name.trim() && !t.name.startsWith("Technical Skill"));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);


  useEffect(() => {
    if (initialTitle) {
      setEditableTitle(initialTitle);
      setIsEditing(false);
    }
  }, [initialTitle]);

  const saveTitle = () => {
    const trimmed = editableTitle.trim();
    if (trimmed) {
      onCourseTitleChange?.(trimmed);
      setIsEditing(false);
    }
  };

  const messageLines = welcomeMessage ? welcomeMessage.split("\n").filter(Boolean) : [];

  return (
    <div className={className}>
      <motion.div
        className="space-y-6 w-full max-w-4xl mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-5 relative z-10">
          {/* Course Title — always-visible input or display */}
          <div className="flex items-center justify-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-lg">
                <input
                  ref={inputRef}
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                  onBlur={saveTitle}
                  placeholder="Type your course title…"
                  className="flex-1 text-2xl md:text-3xl font-bold text-white bg-zinc-800/40 border border-zinc-600/50 focus:border-primary rounded-xl outline-none text-center px-4 py-3 transition-all duration-300 placeholder:text-zinc-500"
                />
                <button
                  onMouseDown={(e) => { e.preventDefault(); saveTitle(); }}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <motion.div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h2 className="text-2xl md:text-3xl p-2 font-bold text-white">
                  {editableTitle || "Click to add title"}
                </h2>
                <Edit2 size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
              </motion.div>
            )}
          </div>

          {/* Welcome message */}
          {messageLines.length > 0 && (
            <motion.div
              className="relative bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <AnimatePresence mode="wait">
                {messageLines.map((line, index) => (
                  <motion.p
                    key={`message-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className="text-gray-300 mb-3 last:mb-0 text-sm md:text-base leading-relaxed"
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Technical Terms — only show real ones, no placeholders */}
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                className="text-center text-gray-400 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-primary rounded-full animate-spin" />
                  <span>Analyzing your PDF…</span>
                </div>
              </motion.div>
            ) : realTerms.length > 0 ? (
              <motion.div
                className="flex flex-wrap gap-3 justify-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="w-full text-xs text-zinc-500 mb-1">Extracted Keywords</p>
                {realTerms.map((topic, index) => (
                  <motion.div
                    key={`term-${topic.name}-${index}`}
                    className="relative px-4 py-2 rounded-xl text-sm md:text-base font-medium shadow-lg cursor-default"
                    style={{
                      backgroundColor: `${topic.color}15`,
                      border: `1px solid ${topic.color}30`,
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: `${topic.color}25`,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                      {topic.name}
                    </span>
                    <div
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{
                        background: `linear-gradient(45deg, ${topic.color}20, transparent)`,
                        filter: "blur(8px)",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : !isProcessing && (
              <motion.p
                className="text-sm text-zinc-500 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Keywords will appear here after PDF processing
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default StepThree;
