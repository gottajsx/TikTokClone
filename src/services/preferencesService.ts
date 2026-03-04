import { supabase } from '@/lib/supabase';
import { Preferences, GenderType } from '@/types/types';

export const getMyPreferences = async (userId: string): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

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
    // ✅ maybeSingle au lieu de single pour cohérence
    // single() throw si 0 lignes, maybeSingle() retourne null
    .maybeSingle();

  if (error) {
    console.error('[updateGenderPreferences] Erreur upsert :', error);
    throw error;
  }

  return data;
};