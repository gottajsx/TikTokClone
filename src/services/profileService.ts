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
    .maybeSingle();  // ← accepte 0 ou 1 ligne

  if (error) {
    console.error('[updateGender] Erreur Supabase :', error);
    throw error;
  }

  // Si pas de ligne affectée → on crée la ligne
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, gender })
      .select()
      .single();

    if (insertError) {
      console.error('[updateGender] Erreur insert :', insertError);
      throw insertError;
    }

    return newProfile;
  }

  return data;
};