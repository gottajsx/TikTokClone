import { supabase } from '@/lib/supabase';

const BUCKET = 'videos';

export const uploadProfileVideo = async (
  userId: string,
  videoUri: string
): Promise<string> => {
  try {
    const filePath = `${userId}/profile-video.mp4`;

    // convertir en ArrayBuffer (React Native compatible)
    const response = await fetch(videoUri);
    const arrayBuffer = await response.arrayBuffer();

    // supprimer ancienne vidéo si elle existe
    await supabase.storage
      .from(BUCKET)
      .remove([filePath])
      .catch(() => {});

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      console.error('[uploadProfileVideo] Upload error:', uploadError.message);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const videoUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        video_url: videoUrl,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('[uploadProfileVideo] Profile update error:', profileError.message);
      throw profileError;
    }

    return videoUrl;
  } catch (error) {
    console.error('[uploadProfileVideo] error', error);
    throw error;
  }
};