import React from "react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/textarea";

interface StepTwoProps {
  className?: string;
  textPrompt: string;
  onTextPromptChange: (value: string) => void;
}

const floatingPills = [
  { id: 1, color: "#FF6B6B", size: 12, delay: 0 },
  { id: 2, color: "#4ECDC4", size: 8, delay: 1.5 },
  { id: 3, color: "#45B7D1", size: 10, delay: 0.8 },
  { id: 4, color: "#96CEB4", size: 14, delay: 2 },
  { id: 5, color: "#D4A5A5", size: 6, delay: 1.2 },
];

const StepTwo: React.FC<StepTwoProps> = ({
  className,
  textPrompt,
  onTextPromptChange,
}) => {
  return (
    <div
      className={`${className} relative px-1 py-6 rounded-xl backdrop-blur-sm bg-zinc-900/20 border-zinc-800/30 overflow-hidden`}
    >
      {/* Animated Background Pills */}
      {floatingPills.map((pill) => (
        <motion.div
          key={pill.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${pill.size}px`,
            height: `${pill.size}px`,
            background: `${pill.color}20`,
            filter: "blur(8px)",
          }}
          initial={{
            x: -100,
            y: Math.random() * 400,
            opacity: 0,
          }}
          animate={{
            x: [null, window.innerWidth + 100],
            y: [null, Math.random() * 400],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 15,
            delay: pill.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <div className="space-y-4 w-full max-w-2xl mx-auto relative z-10">
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-zinc-100">
            Enter Text Prompt
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Provide a detailed prompt to guide the learning process
          </p>
        </motion.div>

        <motion.div
          className="relative group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Textarea
            value={textPrompt}
            onChange={(e) => onTextPromptChange(e.target.value)}
            placeholder="Enter your text prompt here..."
            className="min-h-[40vh] bg-zinc-800/40 backdrop-blur-xl border-zinc-700/30 text-zinc-100 placeholder:text-zinc-500  transition-all duration-300 rounded-xl shadow-xl"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-zinc-600/5 to-zinc-800/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 ease-in-out" />

          {/* Glowing effect on focus */}
          {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/10 to-zinc-600/0 opacity-0 group-focus-within:opacity-100 blur rounded-xl pointer-events-none transition-opacity duration-300" /> */}
        </motion.div>
      </div>
    </div>
  );
};

export default StepTwo;
