import React, { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BookmarkedArticles from "./pages/BookmarkedArticles";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "./components/ui/sidebar";

import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Blendy, createBlendy } from "blendy";
import History from "./pages/History";
import LandingPage from "./pages/landing";

import WorkflowModal from "./components/WorkflowModal";
import { GlowingEffectDemo } from "./components/glow-effect";
import { AppSidebar } from "./components/app-sidebar";
import SignUpForm from "./pages/SignUp";
import Profile01 from "./components/kokonutui/profile-01";
import { SignInForm } from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import CourseDetails from "./pages/CourseDetails";
import Courses from "./pages/Courses";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";
import ReadLaterArticle from "./pages/ReadLater";
import PlaylistPage from "./pages/PlaylistPage";
import Playlists from "./pages/Playlists";

// Home component that shows sidebar and glowing effect
function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const { state: sidebarState } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar onCreateClick={() => setModalOpen(true)} />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <SidebarInset>
          <div
            className={`w-full pt-2 pb-1 h-full overflow-x-hidden overflow-y-scroll scrollbar-hide transition-all   ${sidebarState === "collapsed" ? "pl-10 " : "pl-0"
              }`}
          >
            <div className="grid pl-2 ">
              <GlowingEffectDemo />
            </div>
          </div>
        </SidebarInset>
      </main>
      {modalOpen && (
        <WorkflowModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-8 text-center animate-pulse">
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.05s_infinite] mx-1">
          b
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.1s_infinite] mx-1">
          y
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.15s_infinite] mx-1">
          t
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.2s_infinite] mx-1">
          e
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.25s_infinite] mx-1">
          l
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.3s_infinite] mx-1">
          e
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.35s_infinite] mx-1">
          a
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.4s_infinite] mx-1">
          r
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.45s_infinite] mx-1">
          n
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.5s_infinite] mx-1">
          i
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.55s_infinite] mx-1">
          n
        </span>
        <span className="inline-block animate-[bounce_0.3s_ease-in-out_0.6s_infinite] mx-1">
          g
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function MainContent() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/profile1"
        element={
          <AuthGuard>
            <Profile01 />
          </AuthGuard>
        }
      />
      <Route
        path="/course/:courseId"
        element={
          <AuthGuard>
            <CourseDetails />
          </AuthGuard>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <AuthGuard>
            <CourseDetails />
          </AuthGuard>
        }
      />
      <Route
        path="/home"
        element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        }
      />
      <Route
        path="/courses"
        element={
          <AuthGuard>
            <Courses />
          </AuthGuard>
        }
      />
      <Route
        path="/read_later"
        element={
          <AuthGuard>
            <ReadLaterArticle />
          </AuthGuard>
        }
      />
      <Route
        path="/bookmarked_articles"
        element={
          <AuthGuard>
            <BookmarkedArticles />
          </AuthGuard>
        }
      />
      <Route
        path="/playlists"
        element={
          <AuthGuard>
            <Playlists />
          </AuthGuard>
        }
      />
      <Route
        path="/playlists/:playlistId"
        element={
          <AuthGuard>
            <PlaylistPage />
          </AuthGuard>
        }
      />
      <Route
        path="/history"
        element={
          <AuthGuard>
            <History />
          </AuthGuard>
        }
      />
      <Route
        path="/article/:article_id"
        element={
          <AuthGuard>
            <ArticlePage />
          </AuthGuard>
        }
      />

      {/* Redirect to landing page if user is not authenticated and tries to access other pages */}
      <Route
        path="*"
        element={
          loading ? (
            <div className="flex items-center justify-center min-h-screen">
              Loading...
            </div>
          ) : user ? (
            <NotFound />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  const queryClient = new QueryClient();
  const blendy = useRef<Blendy | null>(null);

  useEffect(() => {
    blendy.current = createBlendy({ animation: "dynamic" });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <SidebarProvider>
              <div className="relative flex min-h-screen ">
                <div className="flex-1">
                  <MainContent />
                </div>
              </div>
              <CommandPalette />
              <Toaster />
              <Sonner />
            </SidebarProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
