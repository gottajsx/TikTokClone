import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
export interface AppUser {
  id: string;
  email: string;
  username: string;
  // Ajoute birth_date si tu l'utilises souvent : birth_date?: string;
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  acceptedTerms: boolean;

  // Actions
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    birthDate: Date
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAcceptedTerms: (value: boolean) => void;
}

// Helper pour mapper Supabase User → AppUser
const mapSupabaseUser = (sbUser: SupabaseUser): AppUser => ({
  id: sbUser.id,
  email: sbUser.email!,
  username: sbUser.user_metadata?.username as string || '',
});

// ────────────────────────────────────────────────
// Store
// ────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      acceptedTerms: false,

      setAcceptedTerms: (value: boolean) => set({ acceptedTerms: value }),

      init: async () => {
        try {
          // 1. Récupère la session actuelle
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: mapSupabaseUser(session.user),
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({ loading: false });
          }

          // 2. Écoute les changements d'auth (login, logout, refresh, etc.)
          supabase.auth.onAuthStateChange((_event, newSession) => {
            if (newSession?.user) {
              set({
                user: mapSupabaseUser(newSession.user),
                isAuthenticated: true,
                loading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                loading: false,
              });
            }
          });
          // Pas de return → type Promise<void>
        } catch (error) {
          console.error('[AuthStore] Init failed:', error);
          set({ loading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) throw error;
          if (!data.user) throw new Error('Login succeeded but no user returned');

          set({
            user: mapSupabaseUser(data.user),
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, username: string, birthDate: Date) => {
        if (!birthDate) throw new Error('Date de naissance requise');

        set({ loading: true });
        try {
          const formattedBirthDate = birthDate.toISOString().split('T')[0];

          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                username: username.trim(),
                birth_date: formattedBirthDate,
              },
            },
          });

          if (error) throw error;
          if (!data.user) throw new Error('Utilisateur non créé');

          // Cas 1 : Auto-confirm activé → session déjà là
          if (data.session) {
            set({
              user: mapSupabaseUser(data.user),
              isAuthenticated: true,
              loading: false,
            });
            return;
          }

          // Cas 2 : Confirm email requis → pas de session immédiate
          // (l'utilisateur doit confirmer → le listener onAuthStateChange prendra le relais après confirmation)
          set({ loading: false });
          // Option : Alert("Vérifiez votre email pour confirmer !")
        } catch (error: any) {
          set({ loading: false });
          console.error('[AuthStore] Register failed:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('[AuthStore] Logout failed:', error);
          throw error;
        }
      },
    }),

    {
      name: 'auth-storage', // clé dans AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persiste seulement ce qui est nécessaire et sérialisable
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        acceptedTerms: state.acceptedTerms,
      }),
      // Version 2026 : onVersionMismatch ou onRehydrateStorage si besoin de migration
    }
  )
);