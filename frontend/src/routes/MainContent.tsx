import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInForm } from "@/pages/SignIn";
import SignUpForm from "@/pages/SignUp";
import Profile01 from "@/components/kokonutui/profile-01";
import CourseDetails from "@/pages/CourseDetails";
import Courses from "@/pages/Courses";
import NotFound from "@/pages/NotFound";
import { AppSidebar } from "@/components/app-sidebar";
import { GlowingEffectDemo } from "@/components/glow-effect";
import WorkflowModal from "@/components/WorkflowModal";
import {
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
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
            <div className="grid pl-6 pr-4">
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
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

export const MainContent: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignUpForm />} />
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
        path="/"
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

      {/* Redirect to signin if user is not authenticated and tries to access other pages */}
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
            <Navigate to="/signin" replace />
          )
        }
      />
    </Routes>
  );
};

export default MainContent;
