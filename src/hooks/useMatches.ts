import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyMatches, deleteMatch } from '@/services/matchService';
import { useCurrentUser } from './useCurrentUser';

const matchKeys = {
  all: (userId: string) => ['matches', userId] as const,
};

/**
 * Récupère la liste des matchs de l'utilisateur connecté.
 */
export const useMatches = () => {
  const { data: user } = useCurrentUser();

  const query = useQuery({
    queryKey: matchKeys.all(user?.id ?? ''),
    queryFn: () => getMyMatches(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    matches: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
  };
};

/**
 * Supprime un match (dématch) avec rollback optimiste.
 */
export const useDeleteMatch = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: (matchId: string) => deleteMatch(matchId),

    onMutate: async (matchId) => {
      if (!user?.id) return;
      const key = matchKeys.all(user.id);

      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);

      // Retire le match du cache immédiatement
      queryClient.setQueryData(key, (old: any[]) =>
        (old ?? []).filter((m) => m.id !== matchId)
      );

      return { previous };
    },

    onError: (_err, _matchId, context) => {
      if (!user?.id || !context?.previous) return;
      queryClient.setQueryData(matchKeys.all(user.id), context.previous);
      console.error('[useDeleteMatch] Erreur lors du dématch');
    },

    onSettled: () => {
      if (!user?.id) return;
      queryClient.invalidateQueries({ queryKey: matchKeys.all(user.id) });
    },
  });
};
