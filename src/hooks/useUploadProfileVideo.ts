import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadProfileVideo } from '@/services/videoService';
import { useCurrentUser } from './useCurrentUser';
import { videoType } from '@/types/types'; // adapte le chemin selon ton projet

type UploadProfileVideoParams = {
  videoUri: string;
  videoText?: string | null;
  videoTextId?: number | null;
};

/**
 * Hook permettant d'uploader la vidéo de profil de l'utilisateur connecté.
 *
 * Ce hook encapsule une mutation React Query qui :
 * - vérifie que l'utilisateur est authentifié
 * - upload la vidéo de profil dans le storage
 * - met à jour les informations du profil
 * - invalide le cache du profil pour forcer son rafraîchissement
 *
 * Fonctionnalités :
 * - Gestion automatique de l'état de mutation (loading, error, success)
 * - Invalidation du cache `my-profile` après upload réussi
 * - Gestion des erreurs avec logs
 *
 * @returns Mutation React Query permettant d'uploader une vidéo de profil
 *
 * @example
 * const uploadVideo = useUploadProfileVideo();
 *
 * uploadVideo.mutate({
 *   videoUri: videoUri,
 *   videoText: "Bonjour je me présente...",
 *   videoTextId: 2
 * });
 *
 * États disponibles :
 * - uploadVideo.isPending
 * - uploadVideo.isSuccess
 * - uploadVideo.isError
 */
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