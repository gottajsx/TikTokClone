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
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  acceptedTerms: boolean;

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

const mapSupabaseUser = (sbUser: SupabaseUser): AppUser => ({
  id: sbUser.id,
  email: sbUser.email ?? '',
  username: (sbUser.user_metadata?.username as string) ?? '',
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

      setAcceptedTerms: (value) => set({ acceptedTerms: value }),

      init: async () => {
        try {
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

      register: async (
        email: string,
        password: string,
        username: string,
        birthDate: Date
      ) => {
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

          if (data.session) {
            set({
              user: mapSupabaseUser(data.user),
              isAuthenticated: true,
              loading: false,
            });
            return;
          }

          set({ loading: false });

        } catch (error: any) {
          set({ loading: false });
          console.error('[AuthStore] Register failed:', error);
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        } catch (error) {
          console.error('[AuthStore] Logout failed:', error);
          set({ loading: false });
          throw error;
        }
      },
    }),

    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        acceptedTerms: state.acceptedTerms,
      }),
      version: 1,
    }
  )
);