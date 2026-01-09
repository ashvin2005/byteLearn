import { supabase } from './supabase';

export async function signInWithOAuth(provider: 'google' | 'github', redirectTo?: string): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || window.location.origin + '/auth/callback',
      scopes: provider === 'google' ? 'email profile' : 'user:email'
    }
  });
}
