import { Redirect, Stack, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useMyProfile } from '@/hooks/useProfile';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';
import { useMemo } from 'react';

export default function ProtectedLayout() {
  const pathname = usePathname();

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

  const isLoading = authLoading || profileLoading || preferencesLoading;
  const hasError = !!profileError || !!preferencesError;

  const needs = useMemo(() => ({
    gender: !profile?.gender,
    preferences: !preferences?.gender_preference,
  }), [profile, preferences]);

  const currentPath = (pathname ?? '').toLowerCase();

  const isOnGenderPage = currentPath.includes('onboardinggender');
  const isOnPrefsPage = currentPath.includes('onboardingpreferencesgender');

  // Si on est déjà sur une page d'onboarding valide → on ne montre JAMAIS le loader global
  const isOnValidOnboarding = isOnGenderPage || isOnPrefsPage;

  // 1. Auth guard
  if (!isAuthenticated && !isLoading) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Loader uniquement si PAS sur une page onboarding valide
  if (isLoading && !isOnValidOnboarding) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.text}>Vérification en cours...</Text>
      </View>
    );
  }

  // 3. Erreur
  if (hasError) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>
          Impossible de charger les données. Veuillez réessayer.
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

  // Guards onboarding – version renforcée pour éviter double trigger
  if (needs.gender && !isOnGenderPage) {
    return <Redirect href="/(protected)/(onboarding)/OnboardingGender" />;
  }

  // IMPORTANT : on ajoute une condition supplémentaire pour éviter le double appel
  // → on ne redirige vers prefs QUE si on n'est pas déjà sur prefs ET que gender est OK
  if (
    !needs.gender &&
    needs.preferences &&
    !isOnPrefsPage &&
    !isOnGenderPage  &&
    !isLoading // ← déjà présent, mais renforce
  ) {
    console.log('[Layout] Redirection vers prefs car needs.preferences = true');
    return <Redirect href="/(protected)/(onboarding)/OnboardingPreferencesGender" />;
  }

  // Tout est validé → layout normal
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(preferences)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0050',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
});