import  { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
    supabaseUrl, 
    supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // lock: processLock,
        // lockAcquireTimeout: 20000,
    },
} as any);


if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      // Petit délai avant refresh pour laisser AsyncStorage se charger
      setTimeout(() => {
        supabase.auth.startAutoRefresh();
      }, 1000); // 1s
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

