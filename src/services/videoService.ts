import { supabase } from '@/lib/supabase';

const BUCKET = 'videos';

/**
 * Upload la vidéo de profil d’un utilisateur dans le storage Supabase
 * puis met à jour les informations associées dans la table `profiles`.
 *
 * Étapes réalisées :
 * 1. Convertit la vidéo locale (URI React Native) en ArrayBuffer
 * 2. Supprime l’ancienne vidéo de profil si elle existe
 * 3. Upload la nouvelle vidéo dans le bucket Supabase Storage
 * 4. Génère l’URL publique de la vidéo
 * 5. Met à jour la table `profiles` avec :
 *    - l’URL de la vidéo
 *    - le texte associé à la vidéo
 *    - l’ID du texte
 *
 * @param userId - ID unique de l'utilisateur
 * @param videoUri - URI locale de la vidéo (ex: file://... dans React Native)
 * @param videoText - Texte associé à la vidéo de profil (optionnel)
 * @param videoTextId - ID du texte sélectionné (optionnel)
 *
 * @returns Promise<string> - URL publique de la vidéo uploadée
 *
 * @throws {Error} Si l'upload de la vidéo échoue ou si la mise à jour du profil échoue
 *
 * @example
 * const url = await uploadProfileVideo(
 *   user.id,
 *   videoUri,
 *   "Bonjour je m'appelle Alex",
 *   3
 * );
 */
export const uploadProfileVideo = async (
  userId: string,
  videoUri: string,
  videoText?: string | null,
  videoTextId?: number | null
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
        video_textId: videoTextId ?? null,
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return videoUrl;

  } catch (error) {
    console.error('[uploadProfileVideo] error', error);
    throw error;
  }
};