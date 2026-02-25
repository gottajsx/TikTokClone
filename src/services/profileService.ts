import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/types';

export const getMyProfile = async (
  userId: string
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return data ?? null;
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

  if (error) throw error;

  return data;
};