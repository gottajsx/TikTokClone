import { supabase } from '@/lib/supabase';
import { Preferences, GenderType } from '@/types/types';

export const getMyPreferences = async (userId: string): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();  // ← retourne null si pas de ligne, sans erreur

  if (error) {
    console.error('[getMyPreferences] Erreur Supabase :', error.message, error.code);
    throw error;
  }

  return data;
};

export const updateGenderPreferences = async (
  userId: string,
  genderPreferences: GenderType[] | null
): Promise<Preferences | null> => {
  try {
    // 1. Vérifier si une ligne existe déjà pour cet utilisateur
    const { data: existing, error: checkError } = await supabase
      .from('preferences')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur lors de la vérification des préférences existantes :', checkError);
      throw checkError;
    }

    // 2. Préparer les données à insérer / mettre à jour
    const payload = {
      user_id: userId,
      gender_preferences: genderPreferences, // peut être null ou tableau
      // Optionnel : si tu veux définir des valeurs par défaut pour les autres champs lors de l'insert
      // min_age: 18,
      // max_age: 99,
      // etc.
    };

    let data: Preferences | null = null;
    let error: any = null;

    if (!existing) {
      // INSERT (nouvelle ligne)
      const result = await supabase
        .from('preferences')
        .insert(payload)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // UPDATE (ligne existante)
      const result = await supabase
        .from('preferences')
        .update({
          gender_preferences: genderPreferences,
          // updated_at: new Date().toISOString(),  // si tu as ce champ
        })
        .eq('user_id', userId)
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Erreur Supabase lors de la mise à jour des gender_preferences :', error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[updateGenderPreferences] Erreur globale :', err);
    throw err; // laisse le hook TanStack Query / React gérer l'erreur
  }
};