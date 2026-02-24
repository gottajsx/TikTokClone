import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyProfile, useMyPreferences } from '@/services/profile';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';

export default function ProtectedLayout() {
  const segments = useSegments();
  const { isAuthenticated, loading: authLoading } = useAuthStore();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useMyProfile(isAuthenticated);

  const {
    data: preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
    refetch: refetchPreferences,
  } = useMyPreferences(isAuthenticated);

  const loading = authLoading || profileLoading || preferencesLoading;
  const hasError = profileError || preferencesError;

  const inSettings = segments.includes('(settings)');
  const currentScreen = segments[segments.length - 1]?.toLowerCase() || '';

  // 1. Non authentifié → login
  if (!isAuthenticated && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Chargement
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // 3. Erreur
  if (hasError) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>
          Impossible de charger votre profil ou préférences.
        </Text>
        <Button
          title="Réessayer"
          color="#FF0050"
          onPress={() => {
            refetchProfile();
            refetchPreferences();
          }}
        />
      </View>
    );
  }

  // 4. Profil ou prefs manquants → onboarding (vérifie si déjà sur la bonne page)
  const needsGender = !profile?.gender;
  const needsPreferences = !preferences?.gender_preference;

  if (needsGender && !(inSettings && currentScreen === 'gender')) {
    return <Redirect href="/(protected)/(settings)/Gender" />;
  }

  if (!needsGender && needsPreferences && !(inSettings && currentScreen === 'preferencesgender')) {
    return <Redirect href="/(protected)/(settings)/PreferencesGender" />;
  }

  // 5. Tout est OK → rends les onglets (ou settings si on y est déjà)
  // Pas de redirect ici pour éviter boucle
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
});