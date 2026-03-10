import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar, skipAvatar } from '@/services/avatarService';
import { useCurrentUser } from './useCurrentUser';
import { Profile } from '@/types/types';

export const useUploadAvatar = () => {

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({

    mutationKey: ['upload-avatar'],

    mutationFn: async (imageUri: string): Promise<Profile> => {

      if (!user?.id) throw new Error('Utilisateur non authentifié');

      const profile = await uploadAvatar(user.id, imageUri);

      if (!profile) throw new Error('Profil non retourné');

      return profile;
    },

    onSuccess: (profile) => {

      queryClient.setQueryData(
        ['my-profile', user?.id],
        profile
      );

    },

  });
};

export const useSkipAvatar = () => {

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({

    mutationKey: ['skip-avatar'],

    mutationFn: async (): Promise<Profile> => {

      if (!user?.id) throw new Error('Utilisateur non authentifié');

      const profile = await skipAvatar(user.id);

      if (!profile) throw new Error('Profil non retourné');

      return profile;
    },

    onSuccess: (profile) => {

      queryClient.setQueryData(
        ['my-profile', user?.id],
        profile
      );

    },

  });
};