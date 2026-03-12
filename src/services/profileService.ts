import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/types';

/**
 * Récupère le profil complet d'un utilisateur à partir de son ID.
 * @param userId - L'identifiant unique de l'utilisateur.
 * @returns Le profil de l'utilisateur ou `null` si aucun profil n'est trouvé.
 * @throws Une erreur si la requête Supabase échoue.
 */
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

/**
 * Marque que l'utilisateur a accepté les conditions générales.
 * Si le profil existe déjà, il est mis à jour ; sinon, un nouveau profil est créé.
 * @param userId - L'identifiant unique de l'utilisateur.
 * @param currentVersion - La version des conditions acceptées.
 * @returns Le profil mis à jour ou créé.
 * @throws Une erreur si la requête Supabase échoue.
 */
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

/**
 * Met à jour le genre de l'utilisateur.
 * Si le profil n'existe pas, il sera créé.
 * @param userId - L'identifiant unique de l'utilisateur.
 * @param gender - Le genre de l'utilisateur : 'male', 'female', 'non-binary' ou `null`.
 * @returns Le profil mis à jour ou créé.
 * @throws Une erreur si la requête Supabase échoue.
 */
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

/**
 * Met à jour la biographie (bio) de l'utilisateur.
 * Si le profil n'existe pas, il sera créé.
 * @param userId - L'identifiant unique de l'utilisateur.
 * @param bio - La nouvelle bio de l'utilisateur ou `null` pour la supprimer.
 * @returns Le profil mis à jour ou créé.
 * @throws Une erreur si la requête Supabase échoue.
 */
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

/**
 * Met à jour la localisation (ville et pays) de l'utilisateur.
 * @param userId - L'identifiant unique de l'utilisateur.
 * @param town - La ville de l'utilisateur ou `null`.
 * @param country - Le pays de l'utilisateur ou `null`.
 * @returns Le profil mis à jour ou `null` si aucun profil n'est trouvé.
 * @throws Une erreur si la requête Supabase échoue.
 */
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

