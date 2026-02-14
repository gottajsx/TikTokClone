import { User } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

type AuthStore = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    init: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: true,

            init: async () => {
                try {
                    const { data } = await supabase.auth.getSession();
                    const sessionUser = data.session?.user;

                    if (sessionUser) {
                        const user: User = {
                            id: sessionUser.id,
                            email: sessionUser.email!,
                            username: sessionUser.user_metadata.username,
                        };
                        set({ user, isAuthenticated: true, loading: false });
                    } else {
                        set({ user: null, isAuthenticated: false, loading: false });
                    }

                    supabase.auth.onAuthStateChange((_event, session) => {
                        if (session?.user) {
                            const user: User = {
                                id: session.user.id,
                                email: session.user.email!,
                                username: session.user.user_metadata.username,
                            };
                            set({ user, isAuthenticated: true, loading: false });
                        } else {
                            set({ user: null, isAuthenticated: false, loading: false });
                        }
                    });
                } catch (error) {
                    console.error("Failed to initialize auth:", error);
                    set({ user: null, isAuthenticated: false, loading: false });
                }
            },

            login: async (email: string, password: string) => {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) {
                    const user: User = {
                        id: data.user.id,
                        email: data.user.email!,
                        username: data.user.user_metadata.username,
                    };
                    set({ user, isAuthenticated: true });
                
                } 
            },

            register: async (email: string, password: string, username: string) => {
                const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: { data: { username } },
                    });
                if (error) throw error;
                if (data.user) {
                    const user: User = {
                        id: data.user.id,
                        email: data.user.email!,
                        username: data.user.user_metadata.username,
                    };
                    set({ user, isAuthenticated: true });
                }
            },

            logout: async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    set({ user: null, isAuthenticated: false,});
                };
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);