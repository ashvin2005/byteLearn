import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Users, ArrowRight, Link, Grid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      } else if (e.key === "/") {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.075, type: "tween" }}
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.075,
                type: "tween"
              }}
              className="w-full max-w-[640px] relative"
            >
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(-45deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15))',
                  backgroundSize: '400% 400%',
                  animation: 'gradient 15s ease infinite'
                }}
              />
              <div className="relative w-full bg-[#1a1a1a]/90 backdrop-blur-[2px] rounded-lg border border-[#303030]/50 shadow-2xl overflow-hidden">
                <style>{`
                  @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
                <div className="flex items-center px-3 border-b border-[#303030]/50">
                  {/* <Search className="w-4 h-4 mr-2 text-[#666]" /> */}
                  <CommandInput
                    placeholder="Search..."
                    className="h-14 bg-transparent border-0 focus:ring-0 focus:outline-none text-white placeholder:text-[#666]"
                  />
                  <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-[#303030]/50 bg-[#1a1a1a] text-[#666]">
                    Esc
                  </kbd>
                </div>
                <CommandList className="max-h-[400px] overflow-y-auto p-2">
                  <CommandEmpty>No results found.</CommandEmpty>

                  <CommandGroup heading="Projects" className="text-[#666] text-xs">
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/v0-bytelearn"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <Grid className="mr-2 h-4 w-4" />
                      <span>v0-bytelearn</span>
                    </CommandItem>
                  </CommandGroup>

                  <CommandSeparator className="my-2 bg-[#303030]" />

                  <CommandGroup heading="Teams" className="text-[#666] text-xs">
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/teams"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>umanghiraniexe-gmailcom's projects</span>
                    </CommandItem>
                  </CommandGroup>

                  <CommandSeparator className="my-2 bg-[#303030]" />

                  <CommandGroup heading="General" className="text-[#666] text-xs">
                    <CommandItem
                      onSelect={() => runCommand(() => navigator.clipboard.writeText(window.location.href))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <Link className="mr-2 h-4 w-4" />
                      <span>Copy Current URL</span>
                    </CommandItem>
                  </CommandGroup>

                  <CommandSeparator className="my-2 bg-[#303030]" />

                  <CommandGroup heading="Navigation" className="text-[#666] text-xs">
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/home"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>Go to umanghiraniexe-gmailcom's projects</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/overview"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>Go to umanghiraniexe-gmailcom's projects Overview</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/integrations"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>Go to umanghiraniexe-gmailcom's projects Integrations</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => navigate("/activity"))}
                      className="flex items-center px-2 py-3 rounded-md hover:bg-[#303030] text-white"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span>Go to umanghiraniexe-gmailcom's projects Activity</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommandDialog>
  );
}

