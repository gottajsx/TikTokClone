import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Profile, Preferences } from '@/types/types';

// ────────────────────────────────────────────────
// Hook partagé pour l'utilisateur courant (cache + stale)
const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('Utilisateur non authentifié');
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 min
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
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('profiles')
        .update({ gender })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (updatedProfile) => {
      if (updatedProfile) {
        // Mise à jour optimiste du cache
        queryClient.setQueryData<Profile>(['my-profile'], updatedProfile);
      }
      // Invalidation pour refetch background si stale
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },

    onError: (error) => {
      console.error('[useUpdateGender] Erreur :', error);
      // Tu peux ajouter ici un toast ou Alert si tu veux
    },
  });
};

/**
 * Mutation : mettre à jour les gender_preferences (tableau)
 */
export const useUpdateGenderPreferences = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender-preferences'],

    mutationFn: async (
      genderPreferences: Array<'male' | 'female' | 'non-binary'>
    ): Promise<Preferences | null> => {
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('preferences')
        .update({ gender_preferences: genderPreferences })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (updatedPreferences) => {
      if (updatedPreferences) {
        queryClient.setQueryData<Preferences>(['my-preferences'], updatedPreferences);
      }
      queryClient.invalidateQueries({ queryKey: ['my-preferences'] });
    },

    onError: (error) => {
      console.error('[useUpdateGenderPreferences] Erreur :', error);
    },
  });
};

/**
 * Query : profil connecté
 */
export const useMyProfile = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['my-profile'],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data ?? null;
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Query : préférences connectées
 */
export const useMyPreferences = (enabled = true) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ['my-preferences'],
    queryFn: async (): Promise<Preferences | null> => {
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data ?? null;
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};