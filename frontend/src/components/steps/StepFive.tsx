import React, { useEffect, useRef } from "react";
import { Slider } from "../ui/slider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plant, RocketLaunch, Star } from "@phosphor-icons/react";

interface StepFiveProps {
  className?: string;
  skillLevel: number;
  onSkillLevelChange: (value: number) => void;
}

interface SkillLevel {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  benefits: string[];
}

const skillLevels: SkillLevel[] = [
  {
    name: "Beginner",
    icon: <Plant weight="duotone" className="w-full h-full text-emerald-400" />,
    description: "Just starting out and eager to learn",
    color: "#4ade80",
    benefits: [
      "Step-by-step guidance",
      "Basic concept explanations",
      "Regular practice exercises",
    ],
  },
  {
    name: "Intermediate",
    icon: <RocketLaunch weight="duotone" className="w-full h-full text-blue-400" />,
    description: "Building on the fundamentals",
    color: "#60a5fa",
    benefits: [
      "In-depth analysis",
      "Real-world applications",
      "Advanced problem-solving",
    ],
  },
  {
    name: "Advanced",
    icon: <Star weight="duotone" className="w-full h-full text-pink-400" />,
    description: "Mastering complex concepts",
    color: "#f472b6",
    benefits: [
      "Expert-level challenges",
      "Research opportunities",
      "Industry best practices",
    ],
  },
];

const StepFive: React.FC<StepFiveProps> = ({
  className,
  skillLevel,
  onSkillLevelChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }> = [];

    const currentColor = skillLevels[skillLevel - 1].color;

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: currentColor,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}40`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [skillLevel]);

  return (
    <div
      className={cn(
        className,
        "px-2 py-4 rounded-xl backdrop-blur-sm bg-zinc-900/30 border-zinc-800/50 relative overflow-hidden"
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.4 }}
      />

      <div className="space-y-8 w-full max-w-2xl mx-auto relative z-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Select Your Skill Level
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Help us tailor the content to your experience
          </p>
        </div>

        <div className="space-y-8">
          <motion.div
            className="text-center space-y-4 min-h-[120px]"
            key={skillLevel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <div className="w-16 h-16 mx-auto">
                {skillLevels[skillLevel - 1].icon}
              </div>
            </motion.div>
            <div className="space-y-3">
              <motion.span
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${skillLevels[skillLevel - 1].color
                    }, ${skillLevels[skillLevel - 1].color}60)`,
                }}
              >
                {skillLevels[skillLevel - 1].name}
              </motion.span>
              <motion.p
                className="text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {skillLevels[skillLevel - 1].description}
              </motion.p>
              <motion.div
                className="flex justify-center gap-4 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {skillLevels[skillLevel - 1].benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${skillLevels[skillLevel - 1].color}20`,
                      color: skillLevels[skillLevel - 1].color,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {benefit}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <div className="px-4 space-y-6">
            <div className="relative">
              <Slider
                value={[skillLevel]}
                onValueChange={(value) => onSkillLevelChange(value[0])}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-xl opacity-50" />
            </div>

            <div className="flex justify-between">
              {skillLevels.map((level, index) => (
                <motion.div
                  key={level.name}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => onSkillLevelChange(index + 1)}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: index + 1 === skillLevel ? 1.1 : 1,
                    color: index + 1 === skillLevel ? level.color : "#9ca3af",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.span
                    className="w-8 h-8 relative flex items-center justify-center text-zinc-400 transition-colors"
                    whileHover={{ y: -3 }}
                  >
                    {level.icon}
                    {index + 1 === skillLevel && (
                      <motion.div
                        className="absolute -inset-2 rounded-full"
                        style={{ backgroundColor: `${level.color}20` }}
                        layoutId="activeEmoji"
                      />
                    )}
                  </motion.span>
                  <span className="text-sm font-medium">{level.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFive;
