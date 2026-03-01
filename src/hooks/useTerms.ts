import { useQuery } from '@tanstack/react-query';
import { getActiveTerms, getActiveTermsVersion } from '@/services/termsService';
import { useAuthStore } from '@/stores/useAuthStore';

// Récupère la version active + le contenu
export const useActiveTerms = (enabled = true) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['active-terms'],
    queryFn: async () => {
      const terms = await getActiveTerms();
      if (!terms) {
        throw new Error('Aucune version active des CGU trouvée');
      }
      return terms;
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 60 * 1000, // 1 heure
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
};

// Version légère (juste la version) – utilisée dans le layout
export const useActiveTermsVersion = (enabled = true) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<string | null>({
    queryKey: ['active-terms-version'],
    queryFn: getActiveTermsVersion,
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
};