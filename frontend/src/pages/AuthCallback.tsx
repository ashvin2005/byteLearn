import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();
  const { user, handleAuthRedirect } = useAuth();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        setProcessing(true);

        if (user) {
          toast.success("Welcome back!");
          navigate("/home", { replace: true });
          return;
        }

        if (window.location.hash) {
          await handleAuthRedirect("/home");
          toast.success("Successfully signed in!");
        } else {
          const { data, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (data?.session) {
            toast.success("Successfully signed in!");
            navigate("/home", { replace: true });
          } else {
            setError("Authentication failed. Please try again.");
            setTimeout(() => navigate("/signin", { replace: true }), 2000);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => navigate("/signin", { replace: true }), 2000);
      } finally {
        setProcessing(false);
      }
    };

    processAuthCallback();
  }, [navigate, user, handleAuthRedirect]);

  // Show a loading state while processing the redirect
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="text-center">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4 mx-auto"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing sign in...
            </h2>
            <p className="text-gray-400">
              Please wait while we set up your session.
            </p>
            {!processing && setTimeout(() => navigate("/home"), 5000)}
          </>
        )}
      </div>
    </div>
  );
}
