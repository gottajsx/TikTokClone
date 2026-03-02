import { supabase } from '@/lib/supabase';
import { Preferences, GenderType } from '@/types/types';

export const getMyPreferences = async (userId: string): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();  // ← retourne null si pas de ligne, sans erreur

  if (error) {
    console.error('[getMyPreferences] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};



export const updateGenderPreferences = async (
  userId: string,
  genderPreferences: GenderType[] | null
): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .upsert(
      {
        user_id: userId,
        gender_preferences: genderPreferences,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Erreur upsert gender_preferences :', error);
    throw error;
  }

  return data;
};