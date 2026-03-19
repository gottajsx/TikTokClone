import { supabase } from '@/lib/supabase';
import { ProfileVideo } from '@/types/types';

const BUCKET = 'videos';

export const uploadProfileVideo = async (
  userId: string,
  videoUri: string,
  videoText?: string | null,
  questionId?: number | null
): Promise<string> => {
  try {
    const filePath = `${userId}/profile-video.mp4`;
    const response = await fetch(videoUri);
    const arrayBuffer = await response.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });
    if (uploadError) {
      throw uploadError;
    }
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('Impossible de récupérer l’URL publique');
    }
    const videoUrl = `${data.publicUrl}?t=${Date.now()}`;
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        video_url: videoUrl,
        video_text: videoText ?? null,
        question_id: questionId ?? null,
      })
      .eq('id', userId);
    if (profileError) throw profileError;
    return videoUrl;
  } catch (error) {
    console.error('[uploadProfileVideo] error', error);
    throw error;
  }
};



export const getCompatibleVideos = async (userId: string) => {
  const { data, error } = await supabase
    .schema('public')
    .rpc("get_compatible_videos", { p_user_id: userId , p_limit: 10 });
    
  console.log('raw data:', JSON.stringify(data, null, 2));
  
  if (error) {
    console.error("Error fetching compatible videos:", error);
    throw error;
  }
  return data;
};