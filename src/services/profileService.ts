import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/types';

export const getMyProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();  // ← retourne null si pas de ligne, sans erreur

  if (error) {
    console.error('[getMyProfile] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};

export const updateGender = async (
  userId: string,
  gender: 'male' | 'female' | 'non-binary' | null
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ gender })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[updateGender] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};