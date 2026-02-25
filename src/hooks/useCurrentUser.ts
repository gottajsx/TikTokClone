import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// ────────────────────────────────────────────────
// Hook partagé pour l'utilisateur courant (cache + stale)
export const useCurrentUser = () => {
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