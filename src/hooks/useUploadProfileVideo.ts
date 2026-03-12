import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadProfileVideo } from '@/services/videoService';
import { useCurrentUser } from './useCurrentUser';

export const useUploadProfileVideo = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['upload-profile-video'],
    mutationFn: async (videoUri: string) => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      return uploadProfileVideo(user.id, videoUri);
    },
    onSuccess: (videoUrl) => {
      queryClient.invalidateQueries({
        queryKey: ['my-profile', user?.id],
      });

      console.log('Vidéo uploadée:', videoUrl);
    },
    onError: (error) => {
      console.error('[useUploadProfileVideo] error:', error);
    },
  });
};
