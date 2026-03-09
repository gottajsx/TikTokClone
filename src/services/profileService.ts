import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/types';

export const getMyProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getMyProfile] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};

// ✅ upsert : update si existe, insert sinon — atomique et sans race condition
export const acceptTerms = async (
  userId: string,
  currentVersion: string
): Promise<Profile | null> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        terms_version: currentVersion,
        terms_accepted_at: now,
      },
      { onConflict: 'id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[acceptTerms] Erreur Supabase :', error.message);
    throw error;
  }

  return data;
};

// ✅ upsert : update si existe, insert sinon — atomique et sans race condition
export const updateGender = async (
  userId: string,
  gender: 'male' | 'female' | 'non-binary' | null
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, gender },
      { onConflict: 'id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[updateGender] Erreur Supabase :', error);
    throw error;
  }

  return data;
};

export const updateProfileBio = async (
  userId: string,
  bio: string | null
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,   // PK de la table profiles
        bio: bio,
      },
      { onConflict: 'id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[updateProfileBio] Erreur Supabase :', error.message, error.details);
    throw error;
  }

  return data;
};

export const updateProfileLocation = async (
  userId: string,
  town: string | null,
  country: string | null
): Promise<Profile | null> => {

  const { data, error } = await supabase
    .from('profiles')
    .update({
      town,
      country,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(
      '[updateProfileLocation] Erreur Supabase :',
      error.message,
      error.details
    );
    throw error;
  }

  return data;
};

