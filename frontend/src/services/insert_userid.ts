import { supabase } from "@/lib/supabase";

export interface UserCheckResult {
  exists: boolean;
  userId: string | null;
  message: string;
  error?: string;
}

export const checkAndSyncUser = async (): Promise<UserCheckResult> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { exists: false, userId: null, message: 'No authenticated user found' };
    }

    const userId = session.user.id;

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      return { exists: false, userId, message: 'Error checking users table', error: checkError.message };
    }

    if (!existingUser) {
      const { error: createError } = await supabase
        .from('users')
        .insert([{ user_id: userId, courses_json: [] }])
        .select()
        .maybeSingle();

      if (createError) {
        return { exists: false, userId, message: 'Failed to create user row', error: createError.message };
      }

      return { exists: true, userId, message: 'Created user row' };
    }

    return { exists: true, userId, message: 'User already exists' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { exists: false, userId: null, message: 'Error syncing user', error: msg };
  }
};
