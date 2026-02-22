import { User } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

type AuthStore = {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;

    init: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string, birthDate: Date) => Promise<void>;
    logout: () => Promise<void>;

    // CGU
    acceptedTerms: boolean;
    setAcceptedTerms: (value: boolean) => void;    
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: true,

            // CGU
            acceptedTerms: false,
            setAcceptedTerms: (value: boolean) => set({ acceptedTerms: value }),

            // Auth
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

            register: async (email: string, password: string, username: string, birthDate: Date) => {
                if (!birthDate) {
                    console.error("birthDate is null");
                    throw new Error("birthDate is required");
                }
                console.log("Trying to register:", { email, username, birthDate });
                const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: { 
                            data: { 
                                username,
                                birth_date: birthDate.toISOString().split("T")[0], 
                            },
                        },
                    });
                if (error) {
                    console.error("Error during signUp:", error);
                    throw error; // tu peux garder throw pour la UI
                }
                if (!data.user) {throw new Error("User not created");}
                const userId = data.user.id;
                console.log({userId, username, birthDate: birthDate?.toISOString().split("T")[0],});
                const { error: profileError } = await supabase.from("profiles").insert([
                    {
                        id: userId,       // même id que auth.users
                        username,
                        birth_date: birthDate.toISOString().split("T")[0],
                        profile_completion: 0,
                        is_visible: true,
                        is_incognito: false,
                    },
                ]);
                if (profileError) throw profileError;
                const { data: loginData, error: loginError } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                if (loginError) throw loginError;
                if (!loginData.user) {
                    throw new Error("Login failed");
                }
                 const user: User = {
                    id: loginData.user.id,
                    email: loginData.user.email!,
                    username: loginData.user.user_metadata.username,
                };
                set({ user, isAuthenticated: true });
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

