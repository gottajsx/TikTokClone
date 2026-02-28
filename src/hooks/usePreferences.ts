import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { updateGenderPreference, getMyPreferences } from '@/services/preferencesService';
import { Preferences } from '@/types/types';

export const useUpdateGenderPreference = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender-preference'],

    mutationFn: async (
      preference: 'male' | 'female' | 'non-binary' | null
    ): Promise<Preferences> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await updateGenderPreference(user.id, preference);
      if (!updated) throw new Error('Aucune préférence retournée');
      return updated;
    },

    // Optimistic update + rollback
    onMutate: async (newPreference) => {
      await queryClient.cancelQueries({ queryKey: ['my-preferences', user?.id] });

      const previous = queryClient.getQueryData<Preferences>(['my-preferences', user?.id]);

      if (previous) {
        queryClient.setQueryData<Preferences>(['my-preferences', user?.id], {
          ...previous,
          gender_preference: newPreference,
        });
      }

      return { previous };
    },

    onError: (err, newPreference, context) => {
      console.error('[useUpdateGenderPreference] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-preferences', user?.id], context.previous);
      }
    },

    onSuccess: (updated) => {
      console.log('[useUpdateGenderPreference] Succès :', updated);
      queryClient.setQueryData(['my-preferences', user?.id], updated);
      queryClient.invalidateQueries({
        queryKey: ['my-preferences'],
        refetchType: 'active',
      });
    },
  });
};

export const useMyPreferences = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery<Preferences | null>({
    queryKey: ['my-preferences', user?.id],

    queryFn: async (): Promise<Preferences | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyPreferences(user.id);
    },

    enabled: enabled && !!user?.id,

    staleTime: 2 * 60 * 1000, // 2 min – raisonnable pour onboarding
    gcTime: 10 * 60 * 1000,

    placeholderData: null, // ← important : pas de loading infini si pas de ligne
  });
};