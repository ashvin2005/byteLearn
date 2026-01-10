import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { display_name: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  handleAuthRedirect: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

class AuthenticationError extends Error {
  constructor(message: string, public originalError?: AuthError) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        const publicRoutes = ['/', '/signin', '/signup'];
        if (publicRoutes.includes(window.location.pathname)) {
          navigate('/home');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async (email: string, password: string, metadata: { display_name: string }) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) {
        throw new AuthenticationError(`Registration failed: ${error.message}`, error);
      }

      // sign out right after so user has to verify email first
      if (data.user) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError('An unexpected error occurred during registration');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new AuthenticationError(`Sign in failed: ${error.message}`, error);
      }

      if (user && !user.email_confirmed_at) {
        await signOut();
        throw new AuthenticationError('Please verify your email before signing in.');
      }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError('An unexpected error occurred during sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new AuthenticationError(`Sign out failed: ${error.message}`, error);
      }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError('An unexpected error occurred during sign out');
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw new AuthenticationError(`Session refresh failed: ${error.message}`, error);
      }

      setUser(data.session?.user ?? null);
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError('An unexpected error occurred during session refresh');
    }
  };

  const handleAuthRedirect = async (redirectTo?: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new AuthenticationError(`Auth redirect failed: ${error.message}`, error);
      }

      if (data.session) {
        setUser(data.session.user);
        navigate(redirectTo || '/home');
      }
    } catch (error) {
      throw error instanceof AuthenticationError
        ? error
        : new AuthenticationError('An unexpected error occurred during auth redirect');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshSession, handleAuthRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
