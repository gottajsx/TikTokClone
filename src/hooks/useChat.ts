import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  getConversationInfo,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  Message,
} from '@/services/chatService';
import { useCurrentUser } from './useCurrentUser';

const chatKeys = {
  info: (conversationId: string) => ['chat', 'info', conversationId] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};

/**
 * Charge les infos de la conversation (nom + avatar de l'autre user).
 */
export const useConversationInfo = (conversationId: string) => {
  const { data: user } = useCurrentUser();

  const query = useQuery({
    queryKey: chatKeys.info(conversationId),
    queryFn: () => getConversationInfo(conversationId, user!.id),
    enabled: !!user?.id && !!conversationId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    conversationInfo: query.data,
    loading: query.isLoading,
  };
};

/**
 * Charge les messages et s'abonne au canal Realtime Supabase.
 * Le Realtime est la seule source de vérité pour les nouveaux messages —
 * on n'invalide JAMAIS le cache depuis le Realtime pour éviter les boucles.
 */
export const useMessages = (conversationId: string) => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  // Garde une ref des IDs déjà dans le cache pour éviter les doublons
  const knownIdsRef = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async () => {
      const messages = await getMessages(conversationId);
      // Initialise les IDs connus avec le chargement initial
      knownIdsRef.current = new Set(messages.map((m) => m.id));
      if (user?.id) {
        await markMessagesAsRead(conversationId, user.id);
      }
      return messages;
    },
    enabled: !!user?.id && !!conversationId,
    // staleTime élevé : le Realtime gère les mises à jour, pas React Query
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Abonnement Realtime
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Évite de créer un double canal si le composant re-render
    if (channelRef.current) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Ignore si déjà connu (évite doublon avec l'optimistic update)
          if (knownIdsRef.current.has(newMessage.id)) return;
          knownIdsRef.current.add(newMessage.id);

          // Remplace le message optimiste (temp-*) par le vrai si c'est le nôtre
          // Sinon ajoute simplement le message de l'autre user
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (old: Message[] | undefined) => {
              const current = old ?? [];
              // Supprime l'éventuel message optimiste correspondant
              const withoutOptimistic = current.filter(
                (m) => !m.id.startsWith('temp-') || m.sender_id !== newMessage.sender_id
              );
              return [...withoutOptimistic, newMessage];
            }
          );

          // Marque comme lu si c'est un message reçu
          if (newMessage.sender_id !== user.id) {
            markMessagesAsRead(conversationId, user.id);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user?.id]);

  return {
    messages: query.data ?? [],
    loading: query.isLoading,
  };
};

/**
 * Envoie un message avec optimistic update.
 * On ne fait PAS d'invalidateQueries — le Realtime s'occupe d'ajouter
 * le vrai message en remplaçant l'optimiste.
 */
export const useSendMessage = (conversationId: string) => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, user!.id, content),

    onMutate: async (content) => {
      if (!user?.id) return;
      const key = chatKeys.messages(conversationId);

      // Annule les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Message[]>(key);

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(key, (old: Message[] | undefined) => [
        ...(old ?? []),
        optimisticMessage,
      ]);

      return { previous };
    },

    onError: (_err, _content, context) => {
      // Rollback : restaure l'état avant l'optimistic update
      if (context?.previous) {
        queryClient.setQueryData(chatKeys.messages(conversationId), context.previous);
      }
      console.error('[useSendMessage] Erreur lors de l\'envoi');
    },

    // PAS d'invalidateQueries ici — le Realtime gère la mise à jour
    // invalidateQueries créerait une boucle : refetch → Realtime → refetch...
  });
};
