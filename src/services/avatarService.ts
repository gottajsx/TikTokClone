import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import { Profile } from '@/types/types';

const DEFAULT_AVATAR_URL = 'DEFAULT_AVATAR_PLACEHOLDER';

export const uploadAvatar = async (
  userId: string,
  imageUri: string
): Promise<Profile | null> => {

  // 1️⃣ compression + resize
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 512 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  const filePath = `${userId}/avatar.jpg`;

  // 2️⃣ supprimer ancien avatar (si existe)
  await supabase.storage
    .from('videos')
    .remove([filePath])
    .catch(() => {});

  // 3️⃣ upload rapide
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(filePath, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('[uploadAvatar] Upload error:', uploadError.message);
    throw uploadError;
  }

  // 4️⃣ récupérer url publique
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  // 5️⃣ cache busting
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  // 6️⃣ update profil
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[uploadAvatar] Profile update error:', error.message);
    throw error;
  }

  return profile;
};

export const skipAvatar = async (userId: string): Promise<Profile | null> => {

  const { data, error } = await supabase
    .from('profiles')
    .update({
      avatar_url: DEFAULT_AVATAR_URL,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[skipAvatar] error:', error.message);
    throw error;
  }

  return data;
};