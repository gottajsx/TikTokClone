import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { updateGenderPreferences, getMyPreferences } from '@/services/preferencesService';
import { Preferences, GenderType } from '@/types/types';

export const useUpdateGenderPreferences = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender-preferences'], // ← pluriel pour cohérence

    mutationFn: async (
      preferences: GenderType[] | null          // ← on attend maintenant un tableau ou null
    ): Promise<Preferences> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      const updated = await updateGenderPreferences(user.id, preferences);

      if (!updated) throw new Error('Aucune préférence retournée');

      return updated;
    },

    // Optimistic update
    onMutate: async (newPreferences: GenderType[] | null) => {
      await queryClient.cancelQueries({ queryKey: ['my-preferences', user?.id] });

      const previous = queryClient.getQueryData<Preferences>(['my-preferences', user?.id]);

      if (previous) {
        queryClient.setQueryData<Preferences>(['my-preferences', user?.id], {
          ...previous,
          gender_preferences: newPreferences,   // ← mise à jour du champ tableau
        });
      }

      return { previous };
    },

    onError: (err, newPreferences, context) => {
      console.error('[useUpdateGenderPreferences] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-preferences', user?.id], context.previous);
      }
    },

    onSuccess: (updated) => {
      console.log('[useUpdateGenderPreferences] Succès :', updated);
      queryClient.setQueryData(['my-preferences', user?.id], updated);

      // Invalider pour recharger si besoin (mais souvent pas nécessaire grâce à l'optimistic)
      queryClient.invalidateQueries({
        queryKey: ['my-preferences'],
        refetchType: 'active',
      });
    },

    // Optionnel : meta pour debug / devtools
    meta: {
      action: 'update gender preferences',
    },
  });
};

// ────────────────────────────────────────────────
// Le hook useMyPreferences reste presque identique
// (seul le typage Preferences a changé → gender_preferences est maintenant un tableau)
// ────────────────────────────────────────────────

export const useMyPreferences = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery<Preferences | null>({
    queryKey: ['my-preferences', user?.id],
    queryFn: async (): Promise<Preferences | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyPreferences(user.id);
    },
    enabled: enabled && !!user?.id,
    staleTime: 2 * 60 * 1000,       // 2 minutes
    gcTime: 10 * 60 * 1000,
    placeholderData: null,           // évite le loading infini si pas de ligne
  });
};