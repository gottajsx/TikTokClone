import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur connecté a déjà liké un profil.
 * @param likerId  - UUID de l'utilisateur connecté.
 * @param likedId  - UUID du profil cible.
 * @returns `true` si le like existe, `false` sinon.
 */
export const isProfileLiked = async (
  likerId: string,
  likedId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('liker_id', likerId)
    .eq('liked_id', likedId)
    .maybeSingle();

  if (error) {
    console.error('[isProfileLiked] Erreur Supabase :', error.message);
    throw error;
  }

  return data !== null;
};

/**
 * Récupère en une seule requête tous les liked_id déjà likés par l'utilisateur
 * parmi une liste de profils donnée (les profils du feed).
 * Utilisé pour précharger le statut de like de toutes les vidéos du feed d'un coup.
 * @param likerId    - UUID de l'utilisateur connecté.
 * @param profileIds - Liste des UUIDs des profils présents dans le feed.
 * @returns Un tableau des UUIDs likés (sérialisable par React Query).
 */
export const getLikedProfileIds = async (
  likerId: string,
  profileIds: string[]
): Promise<string[]> => {
  if (profileIds.length === 0) return [];

  const { data, error } = await supabase
    .from('likes')
    .select('liked_id')
    .eq('liker_id', likerId)
    .in('liked_id', profileIds);

  if (error) {
    console.error('[getLikedProfileIds] Erreur Supabase :', error.message);
    throw error;
  }

  return data.map((row) => row.liked_id);
};

/**
 * Récupère le nombre total de likes reçus par un profil.
 * @param likedId - UUID du profil cible.
 * @returns Le nombre de likes.
 */
export const getLikesCount = async (likedId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('liked_id', likedId);

  if (error) {
    console.error('[getLikesCount] Erreur Supabase :', error.message);
    throw error;
  }

  return count ?? 0;
};

/**
 * Like un profil.
 * Insère une ligne (liker_id, liked_id) dans la table likes.
 * La contrainte unique côté base empêche les doublons.
 * @param likerId - UUID de l'utilisateur connecté.
 * @param likedId - UUID du profil à liker.
 */
export const likeProfile = async (
  likerId: string,
  likedId: string
): Promise<void> => {
  const { error } = await supabase
    .from('likes')
    .insert({ liker_id: likerId, liked_id: likedId });

  if (error) {
    console.error('[likeProfile] Erreur Supabase :', error.message);
    throw error;
  }
};

/**
 * Unlike un profil.
 * Supprime la ligne correspondante dans la table likes.
 * @param likerId - UUID de l'utilisateur connecté.
 * @param likedId - UUID du profil à unliker.
 */
export const unlikeProfile = async (
  likerId: string,
  likedId: string
): Promise<void> => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('liker_id', likerId)
    .eq('liked_id', likedId);

  if (error) {
    console.error('[unlikeProfile] Erreur Supabase :', error.message);
    throw error;
  }
};
