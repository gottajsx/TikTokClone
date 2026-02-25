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
    ): Promise<Preferences | null> => {
      if (!user) throw new Error('Utilisateur non authentifié');

      return updateGenderPreference(user.id, preference);
    },

    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData<Preferences>(['my-preferences'], updated);
      }

      queryClient.invalidateQueries({
        queryKey: ['my-preferences'],
      });
    },

    onError: (error) => {
      console.error('[useUpdateGenderPreference] Erreur :', error);
    },
  });
};



/**
 * Query : préférences connectées
 */
export const useMyPreferences = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['my-preferences', user?.id],
    queryFn: async (): Promise<Preferences | null> => {
      if (!user?.id) throw new Error('Non authentifié');

      return getMyPreferences(user.id);
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};