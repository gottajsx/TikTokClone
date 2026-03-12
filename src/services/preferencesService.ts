import { supabase } from '@/lib/supabase';
import { 
  Preferences, 
  GenderType, 
  RelationshipType 
} from '@/types/types';

/**
 * Récupère les préférences de l'utilisateur.
 * @param userId - L'identifiant de l'utilisateur
 * @returns Un objet Preferences ou null si aucune préférence n'existe
 * @throws Erreur si la requête Supabase échoue
 */
export const getMyPreferences = async (userId: string): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[getMyPreferences] Erreur Supabase :', error.message, error.code);
    throw error;
  }
  return data;
};

/**
 * Met à jour ou insère les préférences de genres de l'utilisateur.
 * @param userId - L'identifiant de l'utilisateur
 * @param genderPreferences - Tableau de GenderType ou null pour réinitialiser
 * @returns L'objet Preferences mis à jour ou null si aucune ligne
 * @throws Erreur si la requête Supabase échoue
 */
export const updateGenderPreferences = async (
  userId: string,
  genderPreferences: GenderType[] | null
): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .upsert(
      {
        user_id: userId,
        gender_preferences: genderPreferences,
      },
      { onConflict: 'user_id' }
    )
    .select()
    // maybeSingle au lieu de single pour cohérence
    // single() throw si 0 lignes, maybeSingle() retourne null
    .maybeSingle();
  if (error) {
    console.error('[updateGenderPreferences] Erreur upsert :', error);
    throw error;
  }
  return data;
};

/**
 * Met à jour ou insère les préférences de types de relation de l'utilisateur.
 * @param userId - L'identifiant de l'utilisateur
 * @param preferences - Tableau de RelationshipType ou null pour réinitialiser
 * @returns L'objet Preferences mis à jour ou null si aucune ligne
 * @throws Erreur si la requête Supabase échoue
 */
export const updateRelationshipPreferences = async (
  userId: string,
  preferences: RelationshipType[] | null
): Promise<Preferences | null> => {
  const { data, error } = await supabase
    .from('preferences')
    .upsert(
      { 
        user_id: userId, 
        relation_types: preferences  // tableau direct, Supabase gère text[]
      },
      { onConflict: 'user_id' }
    )
    .select()
    .maybeSingle();
  if (error) {
    console.error('[updateRelationshipPreferences] Erreur Supabase :', error.message, error.details);
    throw error;
  }
  return data;
};