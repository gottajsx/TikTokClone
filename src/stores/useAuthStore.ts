// stores/useAuthStore.ts (version finale propre)
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  acceptedTerms: false,

  setAcceptedTerms: (value) => set({ acceptedTerms: value }),

  init: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      console.log('[Auth] Session au démarrage :', session ? 'présente' : 'null');
    
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
        
        console.log('[Auth] onAuthStateChange:', _event, newSession ? 'session' : 'null');
  

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

  // login, register, logout restent identiques à ta version
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Login réussi mais aucun user');
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
      if (data.session?.user) {
        set({
          user: mapSupabaseUser(data.session.user),
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
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
}));