import { 
  useMutation, 
  useQuery, 
  useQueryClient 
} from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { 
  updateGenderPreferences, 
  getMyPreferences, 
  updateRelationshipPreferences 
} from '@/services/preferencesService';
import { 
  Preferences, 
  GenderType, 
  RelationshipType 
} from '@/types/types';

/**
 * Hook pour récupérer les préférences de l'utilisateur courant.
 * @param enabled - Si false, la query ne sera pas automatiquement exécutée
 * @returns Un objet de type React Query useQuery<Preferences | null>
 *          contenant data, isLoading, isError, etc.
 * @throws Erreur si l'utilisateur n'est pas authentifié
 */
export const useMyPreferences = (enabled = true) => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  return useQuery<Preferences | null>({
    queryKey: ['my-preferences', user?.id],
    queryFn: async (): Promise<Preferences | null> => {
      if (!user?.id) throw new Error('Non authentifié');
      return getMyPreferences(user.id);
    },
    // On attend que useCurrentUser ait fini de charger
    enabled: enabled && !!user?.id && !userLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Suppression de placeholderData: null
    // qui faussait isPending dans le layout
  });
};


/**
 * Hook pour mettre à jour les préférences de genres de l'utilisateur.
 * Utilise un optimistic update pour mettre à jour instantanément le cache.
 * @returns Un objet de type React Query useMutation<Preferences, Error, GenderType[] | null>
 *          contenant mutate, isPending, onError, onSuccess, etc.
 * @throws Erreur si l'utilisateur n'est pas authentifié ou si aucune préférence n'est retournée
 */
export const useUpdateGenderPreferences = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationKey: ['update', 'gender-preferences'],
    mutationFn: async (preferences: GenderType[] | null): Promise<Preferences> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await updateGenderPreferences(user.id, preferences);
      if (!updated) throw new Error('Aucune préférence retournée');
      return updated;
    },
    onMutate: async (newPreferences: GenderType[] | null) => {
      await queryClient.cancelQueries({ queryKey: ['my-preferences', user?.id] });
      const previous = queryClient.getQueryData<Preferences>(['my-preferences', user?.id]);
      if (previous) {
        queryClient.setQueryData<Preferences>(['my-preferences', user?.id], {
          ...previous,
          gender_preferences: newPreferences,
        });
      }
      return { previous };
    },
    onError: (err, _newPreferences, context) => {
      console.error('[useUpdateGenderPreferences] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-preferences', user?.id], context.previous);
      }
    },
    onSuccess: (updated) => {
      // setQueryData suffit — invalidateQueries déclencherait
      // un refetch réseau inutile après un optimistic update
      queryClient.setQueryData(['my-preferences', user?.id], updated);
    },
  });
};

/**
 * Hook pour mettre à jour les préférences de types de relation de l'utilisateur.
 * Utilise un optimistic update pour mettre à jour instantanément le cache.
 * @returns Un objet de type React Query useMutation<Preferences, Error, RelationshipType[] | null>
 *          contenant mutate, isPending, onError, onSuccess, etc.
 * @throws Erreur si l'utilisateur n'est pas authentifié ou si aucune préférence n'est retournée
 */
export const useUpdateRelationshipPreferences = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationKey: ['update', 'relationship-preferences'],
    mutationFn: async (preferences: RelationshipType[] | null): Promise<Preferences> => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const updated = await updateRelationshipPreferences(user.id, preferences);
      if (!updated) throw new Error('Aucune préférence retournée');
      return updated;
    },
    onMutate: async (newPreferences: RelationshipType[] | null) => {
      await queryClient.cancelQueries({ queryKey: ['my-preferences', user?.id] });
      const previous = queryClient.getQueryData<Preferences>(['my-preferences', user?.id]);
      if (previous) {
        queryClient.setQueryData<Preferences>(['my-preferences', user?.id], {
          ...previous,
          relation_type: newPreferences,
        });
      }
      return { previous };
    },
    onError: (err, _newPreferences, context) => {
      console.error('[useUpdateRelationshipPreferences] Erreur :', err);
      if (context?.previous) {
        queryClient.setQueryData(['my-preferences', user?.id], context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-preferences', user?.id], updated);
    },
  });
};