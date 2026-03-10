import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

const BUCKET = 'videos';
const DEFAULT_AVATAR = 'https://your-default-avatar-url.com/avatar.png';

export const uploadAvatar = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    // compression image
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 512 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const response = await fetch(manipulated.uri);
    const arrayBuffer = await response.arrayBuffer();

    const filePath = `${userId}/avatar.jpg`;

    // supprimer ancien avatar
    await supabase.storage
      .from(BUCKET)
      .remove([filePath])
      .catch(() => {});

    // upload
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`;

    // update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        avatar_url: cacheBustedUrl,
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return cacheBustedUrl;
  } catch (err) {
    console.error('[uploadAvatar] error', err);
    throw err;
  }
};

export const skipAvatar = async (userId: string): Promise<string> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: DEFAULT_AVATAR,
    })
    .eq('id', userId);

  if (error) throw error;

  return DEFAULT_AVATAR;
};