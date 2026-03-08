import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Subscription } from "@supabase/supabase-js";

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

  init: () => Subscription;
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
  email: sbUser.email ?? "",
  username: (sbUser.user_metadata?.username as string) ?? "",
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

      init: () => {
        // ✅ Lit immédiatement la session persistée dans AsyncStorage
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            set({
              user: mapSupabaseUser(session.user),
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        });

        // ✅ Timeout de sécurité si getSession plante
        const timeout = setTimeout(() => {
          if (get().loading) {
            console.warn("[AuthStore] Session timeout, forcing loading false");
            set({ loading: false });
          }
        }, 5000);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          clearTimeout(timeout);

          if (session?.user) {
            set({
              user: mapSupabaseUser(session.user),
              isAuthenticated: true,
              loading: false,
            });
          } else {
            // ✅ On ignore INITIAL_SESSION null si getSession a déjà
            // trouvé une session pour éviter d'écraser un état valide
            if (event === "INITIAL_SESSION") return;

            set({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        });

        return subscription;
      },

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) throw error;
          if (!data.user)
            throw new Error("Login succeeded but no user returned");

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
        if (!birthDate) throw new Error("Date de naissance requise");

        set({ loading: true });

        try {
          const formattedBirthDate = birthDate.toISOString().split("T")[0];

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
          if (!data.user) throw new Error("Utilisateur non créé");

          if (data.session) {
            set({
              user: mapSupabaseUser(data.user),
              isAuthenticated: true,
              loading: false,
            });
            return;
          }

          // Pas de session = email de confirmation envoyé
          set({ loading: false });
          throw new Error("CONFIRMATION_EMAIL_SENT");
        } catch (error: any) {
          set({ loading: false });
          console.error("[AuthStore] Register failed:", error);
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
            acceptedTerms: false,
          });
        } catch (error) {
          console.error("[AuthStore] Logout failed:", error);
          set({ loading: false });
          throw error;
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // ✅ Supabase gère déjà la persistance de session dans AsyncStorage
      // On ne persiste que les préférences utilisateur
      partialize: (state) => ({
        acceptedTerms: state.acceptedTerms,
      }),
      version: 1,
    }
  )
);