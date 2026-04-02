import { supabase } from '@/integrations/supabase/client';
import { AuthError, Session, User } from '@supabase/supabase-js';

export const getSession = async (): Promise<{ session: Session | null; user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    user: data.session?.user ?? null,
    error,
  };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
};

export const getAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string;
  }
  return 'An unknown authentication error occurred.';
};