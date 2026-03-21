import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isProfileLiked, getLikesCount, likeProfile, unlikeProfile } from '@/services/likeService';
import { useCurrentUser } from './useCurrentUser';

// ─── Clés de cache ────────────────────────────────────────────────────────────

const likeKeys = {
  isLiked: (likerId: string, likedId: string) =>
    ['likes', 'is-liked', likerId, likedId] as const,
  count: (likedId: string) =>
    ['likes', 'count', likedId] as const,
};

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * Gère le like/unlike d'un profil vidéo avec :
 * - `isLiked`   : booléen indiquant si le profil est liké (→ cœur rouge ou blanc)
 * - `likesCount`: nombre total de likes reçus par ce profil
 * - `toggle`    : fonction appelée au press du bouton cœur
 * - `isLoading` : état de chargement de la mutation en cours
 */
export const useLike = (likedProfileId: string) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const likerId = user?.id;

  // ── 1. Est-ce que je like déjà ce profil ? ────────────────────────────────
  // Si useCompatibleVideos a déjà préchargé le cache via setQueryData,
  // cette query ne fera aucun appel réseau (données déjà présentes).
  // Elle ne part en requête individuelle que si le profil est affiché
  // sans passer par le feed (ex: navigation directe vers un profil).
  const { data: isLiked = false } = useQuery({
    queryKey: likeKeys.isLiked(likerId ?? '', likedProfileId),
    queryFn: () => isProfileLiked(likerId!, likedProfileId),
    enabled: !!likerId && !!likedProfileId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // ── 2. Nombre de likes reçus par ce profil ────────────────────────────────
  const { data: likesCount = 0 } = useQuery({
    queryKey: likeKeys.count(likedProfileId),
    queryFn: () => getLikesCount(likedProfileId),
    enabled: !!likedProfileId,
    staleTime: 2 * 60 * 1000,
  });

  // ── 3. Mutation like ───────────────────────────────────────────────────────
  const likeMutation = useMutation({
    mutationFn: () => likeProfile(likerId!, likedProfileId),

    // Optimistic update : on bascule immédiatement le cœur sans attendre Supabase
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeKeys.isLiked(likerId!, likedProfileId) });
      await queryClient.cancelQueries({ queryKey: likeKeys.count(likedProfileId) });

      const previousIsLiked = queryClient.getQueryData<boolean>(likeKeys.isLiked(likerId!, likedProfileId));
      const previousCount = queryClient.getQueryData<number>(likeKeys.count(likedProfileId));

      queryClient.setQueryData(likeKeys.isLiked(likerId!, likedProfileId), true);
      queryClient.setQueryData(likeKeys.count(likedProfileId), (old: number) => (old ?? 0) + 1);

      return { previousIsLiked, previousCount };
    },

    onError: (_err, _vars, context) => {
      // Rollback si la requête échoue
      if (context) {
        queryClient.setQueryData(likeKeys.isLiked(likerId!, likedProfileId), context.previousIsLiked);
        queryClient.setQueryData(likeKeys.count(likedProfileId), context.previousCount);
      }
      console.error('[useLike] Erreur lors du like');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.isLiked(likerId!, likedProfileId) });
      queryClient.invalidateQueries({ queryKey: likeKeys.count(likedProfileId) });
    },
  });

  // ── 4. Mutation unlike ─────────────────────────────────────────────────────
  const unlikeMutation = useMutation({
    mutationFn: () => unlikeProfile(likerId!, likedProfileId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeKeys.isLiked(likerId!, likedProfileId) });
      await queryClient.cancelQueries({ queryKey: likeKeys.count(likedProfileId) });

      const previousIsLiked = queryClient.getQueryData<boolean>(likeKeys.isLiked(likerId!, likedProfileId));
      const previousCount = queryClient.getQueryData<number>(likeKeys.count(likedProfileId));

      queryClient.setQueryData(likeKeys.isLiked(likerId!, likedProfileId), false);
      queryClient.setQueryData(likeKeys.count(likedProfileId), (old: number) => Math.max(0, (old ?? 1) - 1));

      return { previousIsLiked, previousCount };
    },

    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(likeKeys.isLiked(likerId!, likedProfileId), context.previousIsLiked);
        queryClient.setQueryData(likeKeys.count(likedProfileId), context.previousCount);
      }
      console.error('[useLike] Erreur lors du unlike');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.isLiked(likerId!, likedProfileId) });
      queryClient.invalidateQueries({ queryKey: likeKeys.count(likedProfileId) });
    },
  });

  // ── 5. Toggle exposé au composant ─────────────────────────────────────────
  const toggle = () => {
    if (!likerId) return;
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  return {
    isLiked,
    likesCount,
    toggle,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  };
};
