import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadProfileVideo, getCompatibleVideos } from '@/services/videoService';
import { getLikedProfileIds } from '@/services/likeService';
import { useCurrentUser } from './useCurrentUser';

type UploadProfileVideoParams = {
  videoUri: string;
  videoText?: string | null;
  questionId?: number | null;
};

export const useUploadProfileVideo = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['upload-profile-video'],

    mutationFn: async ({ videoUri, videoText, questionId }: UploadProfileVideoParams) => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      return uploadProfileVideo(user.id, videoUri, videoText, questionId);
    },

    onSuccess: (videoUrl) => {
      if (!user?.id) return;

      queryClient.invalidateQueries({ queryKey: ['my-profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['videos', 'compatible', user.id] });

      console.log('Vidéo uploadée:', videoUrl);
    },

    onError: (error) => {
      console.error('[useUploadProfileVideo] error:', error);
    },
  });
};

export const useCompatibleVideos = () => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['videos', 'compatible', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      const result = await getCompatibleVideos(user.id);

      // Précharge en une seule requête tous les statuts de like du feed.
      // On construit un Set localement pour la perf (O(1)), mais on injecte
      // un simple booléen dans le cache React Query (sérialisable).
      if (result && result.length > 0) {
        const profileIds = result.map((v: { profile_id: string }) => v.profile_id);
        const likedIds = await getLikedProfileIds(user.id, profileIds);
        const likedSet = new Set(likedIds); // Set local, jamais mis en cache

        profileIds.forEach((profileId: string) => {
          queryClient.setQueryData(
            ['likes', 'is-liked', user.id, profileId],
            likedSet.has(profileId)
          );
        });
      }

      return result;
    },
    enabled: !!user?.id,
  });

  return {
    videos: query.data,
    loading: query.isLoading,
    error: query.error,
  };
};
