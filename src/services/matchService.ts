import { supabase } from '@/lib/supabase';

export type Match = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  conversation_id: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

/**
 * Récupère tous les matchs de l'utilisateur connecté.
 * Les FK de matches pointent vers auth.users (pas profiles), donc
 * on ne peut pas faire de jointure directe vers profiles via Supabase PostgREST.
 * On récupère d'abord les matchs, puis les profils en une seule requête IN.
 */
export const getMyMatches = async (userId: string): Promise<Match[]> => {
  // 1. Récupère les matchs + conversation_id associé
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(`
      id,
      user_a_id,
      user_b_id,
      created_at,
      conversations(id)
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (matchesError) {
    console.error('[getMyMatches] Erreur Supabase :', matchesError.message);
    throw matchesError;
  }

  if (!matchesData || matchesData.length === 0) return [];

  // 2. Collecte les IDs des autres users
  const otherUserIds = matchesData.map((m: any) =>
    m.user_a_id === userId ? m.user_b_id : m.user_a_id
  );

  // 3. Récupère tous leurs profils en une seule requête
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', otherUserIds);

  if (profilesError) {
    console.error('[getMyMatches] Erreur profils :', profilesError.message);
    throw profilesError;
  }

  // 4. Indexe les profils par id pour un accès O(1)
  const profilesMap = new Map(
    (profilesData ?? []).map((p: any) => [p.id, p])
  );

  // 5. Assemble le résultat final
  return matchesData.map((match: any) => {
    const otherUserId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
    const conversation = Array.isArray(match.conversations)
      ? match.conversations[0]
      : match.conversations;

    return {
      id: match.id,
      user_a_id: match.user_a_id,
      user_b_id: match.user_b_id,
      created_at: match.created_at,
      conversation_id: conversation?.id ?? null,
      other_user: profilesMap.get(otherUserId) ?? {
        id: otherUserId,
        username: 'Utilisateur inconnu',
        avatar_url: null,
      },
    };
  });
};

/**
 * Supprime un match (dématch).
 * Les cascades suppriment aussi la conversation et les messages associés.
 */
export const deleteMatch = async (matchId: string): Promise<void> => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('[deleteMatch] Erreur Supabase :', error.message);
    throw error;
  }
};
