"use client";

import type * as React from "react";
import { type LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  SquareTerminal,
  Beaker,
  Bookmark,
  Clock,
  Gamepad2,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "./ui/sidebar";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { supabase } from "@/lib/supabase";
import { fetchUserCourses } from "@/services/courseService";
import { useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  url: string;
  onClick?: () => void;
}

interface NavMainItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items: NavItem[];
}

// Sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ByteLearn",
      logo: Gamepad2,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Ongoing Courses",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Introduction to AI",
          url: "#",
        },
        {
          title: "Data Link Layer",
          url: "#",
        },
        {
          title: "CMOS Inverter Basics",
          url: "#",
        },
      ],
    },
    {
      title: "Bookmarked Articles",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Data Link Layer",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Courses",
      url: "/courses",
      icon: BookOpen,
    },
    {
      name: "History",
      url: "/history",
      icon: Clock,
    },
    {
      name: "Playlists",
      url: "/playlists",
      icon: PlusCircle,
    },
    {
      name: "Read Later",
      url: "/read_later",
      icon: GalleryVerticalEnd,
    },
    {
      name: "Bookmarked Articles",
      url: "/bookmarked_articles",
      icon: Bookmark,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onCreateClick: () => void;
}

export function AppSidebar({ onCreateClick, ...props }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [navMainItems, setNavMainItems] = useState<NavMainItem[]>([
    {
      title: "Ongoing Courses",
      url: "#",
      icon: Beaker,
      isActive: true,
      items: [],
    },
    {
      title: "Bookmarked Articles",
      url: "#",
      icon: Bookmark,
      isActive: false,
      items: [],
    },
  ]);
  useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("bookmarked_articles")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userData?.bookmarked_articles) {
          setNavMainItems((prev) => {
            const newItems = [...prev];
            const bookmarkIndex = newItems.findIndex(
              (item) => item.title === "Bookmarked Articles"
            );
            if (bookmarkIndex !== -1) {
              newItems[bookmarkIndex].items = userData.bookmarked_articles.map(
                (article: { title: string; article_id: string }) => {
                  const truncatedTitle =
                    article.title.length > 25
                      ? article.title.substring(0, 25) + "..."
                      : article.title;
                  return {
                    title: truncatedTitle,
                    url: `/article/${article.article_id}`,
                  };
                }
              );
            }
            return newItems;
          });
        }
      }
    };

    fetchBookmarkedArticles();
  }, [user]);
  // Fetch user's courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        const { data: courses, error } = await fetchUserCourses();
        if (error) {
          console.error("Error fetching courses:", error);
          return;
        }
        if (courses) {
          const sortedCourses = [...courses].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          const recentCourses = sortedCourses.slice(0, 5);

          setNavMainItems((prev) => {
            const newItems = [...prev];
            const coursesIndex = newItems.findIndex(
              (item) => item.title === "Ongoing Courses"
            );
            if (coursesIndex !== -1) {
              newItems[coursesIndex].items = recentCourses.map((course) => {
                const truncatedTitle =
                  course.course_name.length > 30
                    ? course.course_name.substring(0, 25) + "..."
                    : course.course_name;
                return {
                  title: truncatedTitle,
                  url: `/course/${course.course_id}`,
                  onClick: () => {
                    navigate(`/course/${course.course_id}`);
                  },
                };
              });
            }
            return newItems;
          });
        }
      }
    };

    fetchCourses();
  }, [user, navigate]);

  return (
    <>
      <Sidebar
        {...props}
        className={`
          fixed top-4 left-4 bottom-4 right z-50
          ${state === "collapsed" ? "w-[5rem]" : "w-[280px]"}
          transition-all duration-100 ease-in-out
        `}
        collapsible="icon"
      >
        <div
          className="
            h-[96%]
            bg-background/70 backdrop-blur-sm 
            shadow-xl rounded-3xl 
            border border-white/10
            p-0
          "
        >
          <GlowingEffect
            spread={60}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            children={undefined}
          />

          <div className="relative z-10 h-full flex flex-col rounded-2xl overflow-hidden">
            <SidebarHeader
              className={`
                p-4 border-b border-border/50 
                ${
                  state === "collapsed"
                    ? "flex flex-col items-center"
                    : "flex flex-col space-y-2"
                }
                transition-all duration-500 ease-in-out
                ${
                  state === "collapsed"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-100 transform translate-x-0"
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <TeamSwitcher teams={data.teams} />

                {state === "expanded" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleSidebar}
                          className="h-8 w-8"
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Collapse Sidebar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {state === "expanded" && (
                <HoverBorderGradient
                  className=" bg-none justify-center text-sm inline-flex items-center px-4 py-2 "
                  onClick={onCreateClick}
                  duration={0.55}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>Create a Course</span>
                </HoverBorderGradient>
              )}

              {state === "collapsed" && (
                <div className="flex flex-col items-center w-full mt-3 space-y-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleSidebar}
                          className="h-8 w-8"
                        >
                          <PanelLeftOpen className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Expand Sidebar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HoverBorderGradient
                          className=" bg-none justify-center text-sm inline-flex items-center px-4 py-2 "
                          onClick={onCreateClick}
                          duration={0.5}
                        >
                          <PlusCircle className="h-5 w-5 bg-none hover:bg-none " />
                        </HoverBorderGradient>
                      </TooltipTrigger>
                      <TooltipContent>Create New Project</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </SidebarHeader>
            <NavProjects projects={data.projects} />

            <SidebarContent
              className={`
                flex-1 py-2 overflow-y-auto no-scrollbar
                transition-all duration-500 ease-in-out
                ${state === "collapsed" ? "opacity-100" : "opacity-100"}
              `}
            >
              <div className="flex flex-col transition-all duration-300">
                <div className="flex min-w-max items-center gap-2 overflow-hidden transition-all duration-500">
                  <NavMain
                    items={navMainItems}
                    className={`transition-all duration-500 ${
                      state === "collapsed"
                        ? "opacity-0 transform -translate-x-4"
                        : "opacity-100 transform translate-x-0"
                    }`}
                  />
                </div>
                <div className="mt-6 flex min-w-max items-center gap-2 overflow-hidden transition-all duration-500"></div>
              </div>
            </SidebarContent>

            <SidebarFooter
              className={`
                p-4 border-t border-border/50
                transition-all duration-500 ease-in-out
                ${
                  state === "collapsed"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-100 transform translate-x-0"
                }
              `}
            >
              <NavUser />
            </SidebarFooter>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
