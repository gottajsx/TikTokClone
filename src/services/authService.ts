import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const getCurrentUser = async (): Promise<User> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Utilisateur non authentifié');

  return user;
};