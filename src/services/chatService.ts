import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type ConversationInfo = {
  id: string;
  match_id: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

/**
 * Récupère les infos d'une conversation à partir de son ID.
 * On ne peut pas joindre matches → profiles directement (FK vers auth.users).
 * De plus, PostgREST retourne toujours un tableau pour les relations "has-many",
 * même quand on joint via une FK depuis la table enfant — on prend [0].
 */
export const getConversationInfo = async (
  conversationId: string,
  currentUserId: string
): Promise<ConversationInfo> => {
  // 1. Récupère la conversation + le match associé
  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      match_id,
      matches(user_a_id, user_b_id)
    `)
    .eq('id', conversationId)
    .single();

  if (convError) {
    console.error('[getConversationInfo] Erreur Supabase :', convError.message);
    throw convError;
  }

  // PostgREST retourne matches comme un tableau — on prend le premier élément
  const matchesRaw = convData.matches as any;
  const match = Array.isArray(matchesRaw) ? matchesRaw[0] : matchesRaw;

  if (!match) {
    throw new Error('[getConversationInfo] Match introuvable pour cette conversation');
  }

  // 2. Détermine l'ID de l'autre user
  const otherUserId =
    match.user_a_id === currentUserId ? match.user_b_id : match.user_a_id;

  // 3. Récupère le profil de l'autre user
  // On utilise maybeSingle() plutôt que single() pour éviter l'erreur
  // "Cannot coerce to single JSON object" si le profil n'existe pas encore
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', otherUserId)
    .maybeSingle();

  if (profileError) {
    console.error('[getConversationInfo] Erreur profil :', profileError.message);
    throw profileError;
  }

  return {
    id: convData.id,
    match_id: convData.match_id,
    other_user: profile ?? {
      id: otherUserId,
      username: 'Utilisateur inconnu',
      avatar_url: null,
    },
  };
};

/**
 * Récupère les messages d'une conversation, du plus ancien au plus récent.
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getMessages] Erreur Supabase :', error.message);
    throw error;
  }

  return data ?? [];
};

/**
 * Envoie un message dans une conversation.
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('[sendMessage] Erreur Supabase :', error.message);
    throw error;
  }

  return data;
};

/**
 * Marque tous les messages non lus d'une conversation comme lus,
 * sauf ceux envoyés par l'utilisateur courant.
 */
export const markMessagesAsRead = async (
  conversationId: string,
  currentUserId: string
): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('is_read', false)
    .neq('sender_id', currentUserId);

  if (error) {
    console.error('[markMessagesAsRead] Erreur Supabase :', error.message);
    throw error;
  }
};
