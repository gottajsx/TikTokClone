import { supabase } from '@/lib/supabase';

export interface ActiveTerms {
  version: string;
  content: string;
  created_at: string | null;
}

export const getActiveTerms = async (): Promise<ActiveTerms | null> => {
  const { data, error } = await supabase
    .from('terms')
    .select('version, content, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getActiveTerms] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};

export const getActiveTermsVersion = async (): Promise<string | null> => {
  const terms = await getActiveTerms();
  return terms?.version ?? null;
};