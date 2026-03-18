import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadProfileVideo, getCompatibleVideos } from '@/services/videoService';
import { useCurrentUser } from './useCurrentUser';

type UploadProfileVideoParams = {
  videoUri: string;
  videoText?: string | null;
  videoTextId?: number | null;
};

export const useUploadProfileVideo = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['upload-profile-video'],

    mutationFn: async ({ videoUri, videoText, videoTextId }: UploadProfileVideoParams) => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      return uploadProfileVideo(user.id, videoUri, videoText, videoTextId);
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

  return useQuery({
    queryKey: ['videos', 'compatible', user?.id],

    queryFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      return getCompatibleVideos(user.id);
    },

    enabled: !!user?.id, 
  });
};