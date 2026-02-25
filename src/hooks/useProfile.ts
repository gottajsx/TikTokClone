import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { getMyProfile, updateGender } from '@/services/profileService';
import { Profile } from '@/types/types';

/**
 * Query : profil connecté
 */
export const useMyProfile = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyProfile(user.id);
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Mutation : mettre à jour le gender du profil
 */
export const useUpdateGender = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender'],

    mutationFn: async (
      gender: 'male' | 'female' | 'non-binary' | null
    ): Promise<Profile | null> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      return updateGender(user.id, gender);
    },

    onSuccess: (updatedProfile) => {
      if (updatedProfile && user?.id) {
        queryClient.setQueryData<Profile>(
          ['my-profile', user.id],
          updatedProfile
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['my-profile', user?.id],
      });
    },

    onError: (error) => {
      console.error('[useUpdateGender] Erreur :', error);
    },
  });
};