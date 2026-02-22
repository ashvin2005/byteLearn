import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserCourses } from "../services/fetchCourses";
import { CourseData } from "../services/fetchCourses";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

const skillLevelMap: Record<number, { label: string; icon: React.ReactNode; color: string }> = {
  1: {
    label: "Beginner",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
  2: {
    label: "Intermediate",
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
  },
  3: {
    label: "Advanced",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
  },
};

const getSkillInfo = (level?: number) => {
  return skillLevelMap[level ?? 1] || skillLevelMap[1];
};

const getChapterCount = (course: CourseData): number => {
  return course.chapters_json?.chapters?.length ?? 0;
};

const getTags = (course: CourseData): string[] => {
  const kw = course.keywords;
  if (!kw) return [];
  const all = [
    ...(kw.technical_terms || []),
    ...(kw.skills || []),
    ...(kw.technologies || []),
  ];
  return [...new Set(all.map((t) => t.trim()).filter(Boolean))];
};

const tagColors = [
  "bg-violet-500/15 text-violet-300 border-violet-500/20",
  "bg-sky-500/15 text-sky-300 border-sky-500/20",
  "bg-teal-500/15 text-teal-300 border-teal-500/20",
  "bg-pink-500/15 text-pink-300 border-pink-500/20",
  "bg-orange-500/15 text-orange-300 border-orange-500/20",
  "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  "bg-lime-500/15 text-lime-300 border-lime-500/20",
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20",
];

const Courses = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const { data, error } = await fetchUserCourses();
          if (error) throw error;
          if (data) setCourses(data);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Please log in to view your courses.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Loading courses…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Error loading courses:
        <br />
        {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-[#000000] to-[#0A0A0A] text-foreground">
      <div className="px-4 md:px-6 pt-8 pb-12 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            My Learning
          </h1>
        </div>

        {/* Course Grid */}
        <div className="grid gap-5 md:gap-5 lg:grid-cols-2 xl:grid-cols-2 w-full">
          {courses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">
                No courses found — start your learning journey!
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const skill = getSkillInfo(course.skill_level);
              const chapterCount = getChapterCount(course);
              const tags = getTags(course);
              const methods = course.teaching_pattern || [];
              const displayName = course.course_name?.trim() || "Untitled Course";

              return (
                <Link
                  key={course.course_id}
                  to={`/courses/${course.course_id}`}
                  className="group transition-all duration-300"
                >
                  <div className="relative bg-gradient-to-b from-card to-card/90 text-card-foreground rounded-xl p-5 shadow-lg border border-border/40 backdrop-blur-sm hover:border-border/60 transition-all duration-300 h-full">
                    <GlowingEffect
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      children={undefined}
                    />

                    <div className="flex flex-col h-full gap-4">
                      {/* Course Image */}
                      <div className="relative w-full h-24 rounded-lg overflow-hidden">
                        <img
                          src={
                            course.course_img ||
                            `https://placehold.co/400x200/1a1a2e/e0e0e0?text=${encodeURIComponent(displayName.slice(0, 20))}`
                          }
                          alt={displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

                        {/* Skill Level Badge — overlaid on image */}
                        <div
                          className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-gradient-to-r backdrop-blur-md ${skill.color}`}
                        >
                          {skill.icon}
                          {skill.label}
                        </div>
                      </div>

                      {/* Title + Meta row */}
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0 bg-muted/60 p-2 rounded-lg border">
                          <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold leading-snug line-clamp-2">
                            {displayName}
                          </h2>
                          {/* Study methods + chapter count */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            {chapterCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {chapterCount} Chapters
                              </span>
                            )}
                            {methods.length > 0 && chapterCount > 0 && (
                              <span className="text-border">•</span>
                            )}
                            {methods.length > 0 && (
                              <span className="truncate">
                                {methods.join(" · ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.slice(0, 6).map((tag, idx) => (
                            <span
                              key={tag}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${tagColors[idx % tagColors.length]}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 6 && (
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-white/5 text-muted-foreground border-white/10">
                              +{tags.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progress */}
                      <div className="mt-auto space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Course Progress
                          </span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted/60 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-primary/90 to-primary/70 transition-all duration-300 ease-out shadow-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

