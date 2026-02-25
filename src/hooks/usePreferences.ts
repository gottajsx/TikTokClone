import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Preferences } from '@/types/types';
import { useCurrentUser } from './useCurrentUser';


/**
 * Mutation : mettre à jour gender_preference (valeur unique)
 */
export const useUpdateGenderPreference = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['update', 'gender-preference'],

    mutationFn: async (
      preference: 'male' | 'female' | 'non-binary' | null
    ): Promise<Preferences | null> => {
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('preferences')
        .update({ gender_preference: preference })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData<Preferences>(['my-preferences'], updated);
      }
      queryClient.invalidateQueries({ queryKey: ['my-preferences'] });
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