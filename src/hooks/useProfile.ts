import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Profile } from '@/types/types';
import { useCurrentUser } from './useCurrentUser';


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
        queryClient.setQueryData<Profile>(['my-profile'], updatedProfile);
      }
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },

    onError: (error) => {
      console.error('[useUpdateGender] Erreur :', error);
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

