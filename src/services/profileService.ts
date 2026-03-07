import { supabase } from '@/lib/supabase';
import { Profile, RelationshipType } from '@/types/types';

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

export const updateRelationshipPreferences = async (
  userId: string,
  preferences: RelationshipType[] | null
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { 
        id: userId, 
        relation_type: preferences  // ← tableau direct, Supabase gère text[]
      },
      { onConflict: 'id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[updateRelationshipPreferences] Erreur Supabase :', error.message, error.details);
    throw error;
  }

  return data;
};