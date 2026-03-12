import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
} from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { 
  getMyProfile, 
  updateGender, 
  acceptTerms, 
  updateProfileBio, 
  updateProfileLocation,
} from '@/services/profileService';
import { Profile } from '@/types/types';

/**
 * Hook pour récupérer le profil de l'utilisateur courant.
 * Dépend de `useCurrentUser()` et ne s'exécute que si l'utilisateur est authentifié.
 * 
 * @param enabled - Active ou désactive la query (par défaut `true`).
 * @returns Un objet React Query `UseQueryResult<Profile | null>`.
 * @throws Une erreur si l'utilisateur n'est pas authentifié.
 */
export const useMyProfile = (enabled = true) => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  return useQuery<Profile | null>({
    queryKey: ['my-profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyProfile(user.id);
    },
    // On attend que useCurrentUser ait fini de charger
    // avant de lancer la query profile
    enabled: enabled && !!user?.id && !userLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Pas de placeholderData: null qui fausserait isPending
  });
};


/**
 * Hook pour mettre à jour le genre de l'utilisateur courant.
 * Utilise une mutation optimiste pour mettre à jour le cache local immédiatement.
 * 
 * @returns Un objet React Query `UseMutationResult<Profile, Error, 'male' | 'female' | 'non-binary' | null>`.
 * @throws Une erreur si l'utilisateur n'est pas authentifié ou si la mise à jour échoue.
 */
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
      // setQueryData suffit — pas besoin d'invalidateQueries
      // qui déclencherait un refetch réseau inutile
      queryClient.setQueryData(['my-profile', user?.id], updatedProfile);
    },
  });
};

/**
 * Hook pour accepter les termes et conditions pour l'utilisateur courant.
 * Met à jour la version et la date d'acceptation dans le profil.
 * Utilise une mutation optimiste pour mettre à jour le cache local.
 * 
 * @returns Un objet React Query `UseMutationResult<Profile, Error, string>` où le string est la version des CGU.
 * @throws Une erreur si l'utilisateur n'est pas authentifié ou si la mutation échoue.
 */
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
      // setQueryData suffit — pas besoin d'invalidateQueries
      queryClient.setQueryData(['my-profile', user?.id], updatedProfile);
    },
  });
};

export const useUpdateProfileBio = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'profile-bio'],
    mutationFn: async (bio: string | null): Promise<Profile> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await updateProfileBio(user.id, bio);
      if (!updated) throw new Error('Aucun profil retourné');
      return updated;
    },
    onMutate: async (newBio: string | null) => {
      await queryClient.cancelQueries({ queryKey: ['my-profile', user?.id] });

      const previous = queryClient.getQueryData<Profile>(['my-profile', user?.id]);
      if (previous) {
        queryClient.setQueryData<Profile>(['my-profile', user?.id], {
          ...previous,
          bio: newBio,
        });
      }

      return { previous };
    },
    onError: (err, _newBio, context) => {
      console.error('[useUpdateProfileBio] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-profile', user?.id], context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-profile', user?.id], updated);
    },
  });
};

/**
 * Hook pour mettre à jour la biographie (bio) de l'utilisateur courant.
 * Applique la mutation de manière optimiste dans le cache local.
 * 
 * @returns Un objet React Query `UseMutationResult<Profile, Error, string | null>` où la valeur passée est la nouvelle bio.
 * @throws Une erreur si l'utilisateur n'est pas authentifié ou si la mise à jour échoue.
 */
export const useUpdateProfileLocation = () => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update', 'profile-location'],
    mutationFn: async (payload: {
      town: string | null;
      country: string | null;
    }): Promise<Profile> => {
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      const updated = await updateProfileLocation(
        user.id,
        payload.town,
        payload.country
      );
      if (!updated) {
        throw new Error('Profil non retourné');
      }
      return updated;
    },
    onMutate: async (newLocation) => {
      await queryClient.cancelQueries({
        queryKey: ['my-profile', user?.id],
      });
      const previous = queryClient.getQueryData<Profile>([
        'my-profile',
        user?.id,
      ]);
      if (previous) {
        queryClient.setQueryData<Profile>(['my-profile', user?.id], {
          ...previous,
          town: newLocation.town,
          country: newLocation.country,
        });
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      console.error('[useUpdateProfileLocation] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(
          ['my-profile', user?.id],
          context.previous
        );
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ['my-profile', user?.id],
        updated
      );
    },
  });
};