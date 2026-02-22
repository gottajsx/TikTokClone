import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useMyProfile, useMyPreferences } from "@/services/profile";


export default function ProtectedLayout() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthStore();

  const {data: profile, isLoading: profileLoading } = useMyProfile(isAuthenticated);

  const { data: preferences, isLoading: preferencesLoading } = useMyPreferences(isAuthenticated);

  const loading = authLoading || profileLoading || preferencesLoading;

  // 🔐 Initialisation de la session
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    const genderMissing = !profile || !profile.gender;
    if (genderMissing) {
      router.replace("/(protected)/(settings)/Gender");
      return;
    }

    const preferencesMissing =
      !preferences ||
      !preferences.gender_preferences ||
      preferences.gender_preferences.length === 0;
    if (preferencesMissing) {
      router.replace("/(protected)/(settings)/PreferencesGender");
      return;
    }
  }, [loading, isAuthenticated, profile, preferences, router]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!isAuthenticated) return null; // on attend la redirection

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
      <Stack.Screen
        name="postComments/[id]"
        options={{ title: "Comments", headerBackButtonDisplayMode: "minimal" }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});