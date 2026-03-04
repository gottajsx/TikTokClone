import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { getMyProfile, updateGender, acceptTerms } from '@/services/profileService';
import { Profile } from '@/types/types';

export const useMyProfile = (enabled = true) => {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  return useQuery<Profile | null>({
    queryKey: ['my-profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyProfile(user.id);
    },
    // ✅ On attend que useCurrentUser ait fini de charger
    // avant de lancer la query profile
    enabled: enabled && !!user?.id && !userLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // ✅ Pas de placeholderData: null qui fausserait isPending
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
    onMutate: async (newGender) => {
      await queryClient.cancelQueries({ queryKey: ['my-profile', user?.id] });
      const previous = queryClient.getQueryData<Profile>(['my-profile', user?.id]);
      if (previous) {
        queryClient.setQueryData<Profile>(['my-profile', user?.id], {
          ...previous,
          gender: newGender,
        });
      }
      return { previous };
    },
    onError: (err, _newGender, context) => {
      console.error('[useUpdateGender] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-profile', user?.id], context.previous);
      }
    },
    onSuccess: (updatedProfile) => {
      // ✅ setQueryData suffit — pas besoin d'invalidateQueries
      // qui déclencherait un refetch réseau inutile
      queryClient.setQueryData(['my-profile', user?.id], updatedProfile);
    },
  });
};

export const useAcceptTerms = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['accept-terms'],
    mutationFn: async (currentVersion: string): Promise<Profile> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await acceptTerms(user.id, currentVersion);
      if (!updated) throw new Error('Acceptation des CGU échouée');
      return updated;
    },
    onMutate: async (version) => {
      await queryClient.cancelQueries({ queryKey: ['my-profile', user?.id] });
      const previous = queryClient.getQueryData<Profile>(['my-profile', user?.id]);
      if (previous) {
        queryClient.setQueryData<Profile>(['my-profile', user?.id], {
          ...previous,
          terms_version: version,
          terms_accepted_at: new Date().toISOString(),
        });
      }
      return { previous };
    },
    onError: (err, _version, context) => {
      console.error('[useAcceptTerms] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-profile', user?.id], context.previous);
      }
    },
    onSuccess: (updatedProfile) => {
      // ✅ setQueryData suffit — pas besoin d'invalidateQueries
      queryClient.setQueryData(['my-profile', user?.id], updatedProfile);
    },
  });
};