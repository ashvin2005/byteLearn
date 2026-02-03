import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, PenNib, Target, Books, GraduationCap } from "@phosphor-icons/react";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between w-full px-8 pb-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <motion.div
              className="flex items-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 relative z-10 cursor-pointer hover:scale-110",
                  isActive &&
                  "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/25",
                  isCompleted && "border-primary/50 bg-primary/5 text-primary",
                  !isActive &&
                  !isCompleted &&
                  "border-zinc-600/30 bg-zinc-800/30 text-zinc-400 hover:border-zinc-500/50 hover:bg-zinc-700/50"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {stepNumber === 1
                  ? <FileText weight="fill" className="w-5 h-5" />
                  : stepNumber === 2
                    ? <PenNib weight="fill" className="w-5 h-5" />
                    : stepNumber === 3
                      ? <Target weight="fill" className="w-5 h-5" />
                      : stepNumber === 4
                        ? <Books weight="fill" className="w-5 h-5" />
                        : stepNumber === 5
                          ? <GraduationCap weight="fill" className="w-5 h-5" />
                          : stepNumber}
                {(isActive || isCompleted) && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </motion.div>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 text-xs text-center font-medium transition-colors duration-300 whitespace-nowrap">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full transition-colors duration-300",
                    isActive ? "text-primary" : "text-zinc-500"
                  )}
                >
                  {`Step ${stepNumber}`}
                </span>
              </div>
            </motion.div>
            {stepNumber < totalSteps && (
              <div className="flex-1 relative">
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px]">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full",
                      "bg-gradient-to-r from-zinc-700/50 to-zinc-600/30"
                    )}
                  />
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-primary/30"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;

