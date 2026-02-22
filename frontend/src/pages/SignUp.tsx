import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { SignUpFormData } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Aurora from "@/components/Aurora";
import { signInWithOAuth } from "@/lib/oauth";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      await signUp(data.email, data.password, { display_name: data.username });
      toast.success("Account created! Please check your email to verify your account.");
      navigate("/signin");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setLoading(true);
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Demo login failed — no user returned.");
      toast.success("Logged in as Demo User");
      navigate("/home");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Demo login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      await signInWithOAuth(provider, `${window.location.origin}/auth/callback`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "OAuth sign-in failed";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
      <div className="relative w-full max-w-5xl">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          children={undefined}
        />
        <div className={cn("relative z-10 w-full animate-fade-up")}>
          <Card className="overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
            <CardContent className="grid p-0 grid-cols-1 md:grid-cols-2 gap-0">

              {/* ── Decorative panel ── */}
              <div className="relative hidden md:flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <Aurora colorStops={["#3A29F9", "#FF94B4"]} blend={0.75} amplitude={2.0} speed={0.7} />
                <div className="relative z-10 p-12">
                  <blockquote className="space-y-3">
                    <p className="text-xl font-light leading-relaxed text-foreground/90">
                      "Education is not preparation for life; education is life itself."
                    </p>
                    <footer className="text-sm text-muted-foreground">― John Dewey</footer>
                  </blockquote>
                </div>
              </div>

              {/* ── Form panel ── */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12">
                <div className="flex flex-col gap-5">

                  {/* Header */}
                  <div className="flex flex-col items-center text-center space-y-2 mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="text-muted-foreground text-sm">
                      Join ByteLearn and start learning smarter
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register("username", { required: "Username is required" })}
                        placeholder="Username"
                        className={cn(
                          "pl-10 bg-white/5 border-white/10 focus:border-primary/60 transition-colors",
                          errors.username && "border-red-500 focus:border-red-500"
                        )}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-400 text-xs">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                          "pl-10 bg-white/5 border-white/10 focus:border-primary/60 transition-colors",
                          errors.email && "border-red-500 focus:border-red-500"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Password must be at least 8 characters" },
                        })}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        className={cn(
                          "pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary/60 transition-colors",
                          errors.password && "border-red-500 focus:border-red-500"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Demo access */}
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    {loading ? "Loading…" : "Try Demo — instant access"}
                  </button>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full font-semibold py-5 mt-1 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    disabled={loading}
                    style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-2 text-muted-foreground" style={{ background: "rgba(0,0,0,0.6)" }}>or</span>
                    </div>
                  </div>

                  {/* OAuth */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={loading}
                      className="bg-white/5 border-white/10 hover:bg-white/10 py-5 flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      <span className="text-sm">Google</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("github")}
                      disabled={loading}
                      className="bg-white/5 border-white/10 hover:bg-white/10 py-5 flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                      </svg>
                      <span className="text-sm">GitHub</span>
                    </Button>
                  </div>

                  {/* Switch to sign in */}
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signin")}
                      className="text-primary font-medium hover:underline focus:outline-none transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
