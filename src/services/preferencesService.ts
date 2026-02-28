import { supabase } from '@/lib/supabase';
import { Preferences } from '@/types/types';

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

export const updateGenderPreference = async (
  userId: string,
  preference: 'male' | 'female' | 'non-binary' | null
): Promise<Preferences | null> => {
  // Si pas de ligne → on fait un insert au lieu d'update
  const { data: existing } = await supabase
    .from('preferences')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    // Insert nouvelle ligne
    const { data, error } = await supabase
      .from('preferences')
      .insert({ user_id: userId, gender_preference: preference })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update existante
  const { data, error } = await supabase
    .from('preferences')
    .update({ gender_preference: preference })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};