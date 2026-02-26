import { Redirect, Stack, useSegments, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useMyProfile } from '@/hooks/useProfile';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';

export default function ProtectedLayout() {
  const segments = useSegments();
  const pathname = usePathname(); // ← AJOUTÉ : beaucoup plus fiable que segments pour éviter les boucles

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

  // 4. Onboarding forcé (la partie qui causait la boucle infinie)
  const needsGender = !profile?.gender;
  const needsPreferences = !preferences?.gender_preference;

  // ← CORRECTION PRINCIPALE
  // On ne redirige QUE si on n'est PAS déjà sur la bonne page d'onboarding
  if (needsGender && !pathname?.includes('OnboardingGender')) {
    return <Redirect href="/(protected)/(onboarding)/OnboardingGender" />;
  }

  if (!needsGender && needsPreferences && !pathname?.includes('OnboardingPreferencesGender')) {
    return <Redirect href="/(protected)/(onboarding)/OnboardingPreferencesGender" />;
  }

  // 5. Tout est OK → on rend le Stack (pas de redirect vers tabs ici, comme tu l'as voulu)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(preferences)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0050',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
});