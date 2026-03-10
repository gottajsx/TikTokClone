import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar, skipAvatar } from '@/services/avatarService';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['upload-avatar'],
    mutationFn: async (uri: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      return uploadAvatar(user.id, uri);
    },
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-profile', user?.id],
      });
    },
  });
};

export const useSkipAvatar = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationKey: ['skip-avatar'],
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      return skipAvatar(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-profile', user?.id],
      });
    },
  });
};