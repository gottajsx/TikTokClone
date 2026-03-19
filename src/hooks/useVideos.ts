import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadProfileVideo, getCompatibleVideos } from '@/services/videoService';
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

      // ✅ invalide proprement toutes les données liées
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
  
  console.log('=== DEBUG useCompatibleVideos ===');
  console.log('user?.id:', user?.id);

  const query = useQuery({
    queryKey: ['videos', 'compatible', user?.id],
    queryFn: async () => {
      console.log('queryFn called with userId:', user?.id);
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      const result = await getCompatibleVideos(user.id);
      console.log('getCompatibleVideos result:', JSON.stringify(result, null, 2));
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