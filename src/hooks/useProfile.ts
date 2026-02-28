import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { getMyProfile, updateGender } from '@/services/profileService';
import { Profile } from '@/types/types';

export const useMyProfile = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery<Profile | null>({
    queryKey: ['my-profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyProfile(user.id);
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: null, // ← important pour onboarding
  });
};

export const useUpdateGender = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender'],

    mutationFn: async (gender: 'male' | 'female' | 'non-binary' | null): Promise<Profile> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await updateGender(user.id, gender);
      if (!updated) throw new Error('Mise à jour échouée');
      return updated;
    },

    // Optimistic update – corrigé pour éviter l'erreur TS
    onMutate: async (newGender) => {
      await queryClient.cancelQueries({ queryKey: ['my-profile', user?.id] });

      const previous = queryClient.getQueryData<Profile>(['my-profile', user?.id]);

      // On ne met à jour que si on a déjà des données (évite de créer un profil incomplet)
      if (previous) {
        queryClient.setQueryData<Profile>(['my-profile', user?.id], {
          ...previous,
          gender: newGender,
        });
      }

      return { previous };
    },

    // Rollback en cas d'erreur
    onError: (err, newGender, context) => {
      console.error('[useUpdateGender] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-profile', user?.id], context.previous);
      }
    },

    // Succès : mise à jour avec les vraies données serveur
    onSuccess: (updatedProfile) => {
      console.log('[useUpdateGender] Succès :', updatedProfile);
      queryClient.setQueryData(['my-profile', user?.id], updatedProfile);
      queryClient.invalidateQueries({
        queryKey: ['my-profile'],
        refetchType: 'active',
      });
    },
  });
};