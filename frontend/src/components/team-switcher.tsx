"use client";

import * as React from "react";
import { Book } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
  className,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
  className?: string;
}) {
  const { state } = useSidebar();
  const [activeTeam] = React.useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={state === "collapsed" ? "w-full flex justify-center" : ""}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="md"
              className={`
                ${
                  state === "collapsed"
                    ? "w-full max-w-[2.5rem] justify-center"
                    : ""
                }
                data-[state=open]:bg-sidebar-accent 
                data-[state=open]:text-sidebar-accent-foreground
                ${className || ""}
              `}
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Book
                  className={`size-4 ${state === "collapsed" ? "mx-auto" : ""}`}
                />
              </div>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam.plan}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
