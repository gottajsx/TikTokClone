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

// Fonction dédiée pour accepter les CGU
export const acceptTerms = async (
  userId: string,
  currentVersion: string
): Promise<Profile | null> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      terms_version: currentVersion,
      terms_accepted_at: now,
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[acceptTerms] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  // Si le profil n'existe pas encore → on le crée
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        terms_version: currentVersion,
        terms_accepted_at: now,
        // gender: null, etc. si tu veux des valeurs par défaut
      })
      .select()
      .single();

    if (insertError) {
      console.error('[acceptTerms] Erreur insert :', insertError);
      throw insertError;
    }

    return newProfile;
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