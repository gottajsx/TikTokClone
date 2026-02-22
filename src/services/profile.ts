import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

/**
 * Mutation pour mettre à jour le gender du profil
 */
export const useUpdateGender = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (gender: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('profiles')
            .update({ gender })
            .eq('id', user.id)

        if (error) throw error
        },

        onSuccess: () => {
        // On invalide le cache du profil connecté
        queryClient.invalidateQueries({ queryKey: ['my-profile'] })
        },
    })
}

/**
 * Mutation pour mettre à jour les gender_preferences
 */
export const useUpdateGenderPreferences = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (genderPreferences: string[]) => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('preferences')
            .update({ gender_preferences: genderPreferences })
            .eq('user_id', user.id)

        if (error) throw error
        },

        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['my-preferences'] })
        },
    })
}

/**
 * Récupère le profil connecté
 */
export const useMyProfile = (enabled: boolean) => {
    return useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        return data
        },
        enabled,
    })
}

/**
 * Récupère les préférences connectées
 */
export const useMyPreferences = (enabled: boolean) => {
    return useQuery({
        queryKey: ['my-preferences'],
        queryFn: async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) throw error

        return data
        },
        enabled,
    })
}