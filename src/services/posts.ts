import * as FileSystem from 'expo-file-system';
import { supabase } from "@/lib/supabase"
import { PostInput } from "@/types/types";

type StorageInput = {
    fileName: string;
    fileExtension: string;
    videoUri: string;
};

type Paginationinput = {
    cursor?: string;
    limit?: number;
}

export const fetchPosts = async (pageParams: Paginationinput) => {
    let query = supabase
        .from('posts')
        .select('*, user:profiles(*), nrOfComments:comments(count)')
        .order('id', { ascending: false })
    
    if (pageParams.limit) {
        query = query.limit(pageParams.limit);
    }

    if (pageParams.cursor) {
        query = query.lt('id', pageParams.cursor);
    }

    const { data } = await query.throwOnError();
    return data;
}

export const uploadVideoToStorage = async (storageProps: StorageInput) => {
    const { fileName, fileExtension, videoUri } = storageProps;
    const fullFileName = `${fileName}.${fileExtension}`;
    console.log('📍 Video URI:', videoUri);

    try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userSession = sessionData?.session;

        if (!userSession) {
             console.error('⚠️ User session missing. Upload blocked.');
            throw new Error('User is not authenticated. Please log in.');
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
                console.error('⚠️ Failed to get authenticated user:', userError);
                throw new Error('Authenticated user not found. Upload blocked.');
        }   

       if (!videoUri) {
            throw new Error('Video URI is missing');
       }

       if (!fileExtension) {
            throw new Error('File extension is missing');
       }

       const fileToUpload = {
            uri: videoUri,
            name: fullFileName,
            type: `video/${fileExtension}`,
       } as any;

        console.log('✅ File object created:', fileToUpload);

        console.log('🚀 Uploading to Supabase bucket: videos');

       const { data: uploadData, error: uploadError } =
        await supabase.storage
            .from('videos')
            .upload(fullFileName, fileToUpload, {
                contentType: `video/${fileExtension}`,
                upsert: false,
            });

        if (uploadError) {
            console.error('❌ Supabase upload error:', {
                message: uploadError.message,
                name: uploadError.name,
                stack: uploadError.stack,
            });
            throw uploadError;
        }

        console.log('✅ Upload successful:', uploadData);

        console.log('🔗 Generating public URL...');

        const { data: publicUrlData } = supabase.storage
            .from('videos')
            .getPublicUrl(fullFileName);

        if (!publicUrlData?.publicUrl) {
            throw new Error('Failed to generate public URL');
        }

        console.log('✅ Public URL generated:', publicUrlData.publicUrl);

        return publicUrlData.publicUrl;

    } catch (error: any) {
        console.error('🔥 Upload process failed at some stage:', {
            message: error?.message,
            stack: error?.stack,
            raw: error,
        });

        throw error;
    }
}

export const createPost = async (newPosts: PostInput) => {
    const { data, error } = await supabase
        .from('posts')
        .insert(newPosts)
        .throwOnError()
    
        return data;
}