import { supabase } from '@/lib/supabase';
import { Preferences } from '@/types/types';

export const updateGenderPreference = async (
  userId: string,
  preference: 'male' | 'female' | 'non-binary' | null
): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .update({ gender_preference: preference })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getMyPreferences = async (
  userId: string
): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data ?? null;
};