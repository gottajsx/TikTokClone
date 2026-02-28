import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useMyProfile } from '@/hooks/useProfile';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';

export default function ProtectedLayout() {
  const { isAuthenticated, loading: authLoading } = useAuthStore();

  const profileQuery = useMyProfile(isAuthenticated);
  const preferencesQuery = useMyPreferences(isAuthenticated);

  const isLoading = authLoading || profileQuery.isLoading || preferencesQuery.isLoading;
  const hasCriticalError = profileQuery.isError || preferencesQuery.isError;

  // 1. Pas authentifié → login
  if (!isAuthenticated && !isLoading) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Chargement initial → loader plein écran
  if (isLoading) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.text}>Chargement de ton profil...</Text>
      </View>
    );
  }

  // 3. Erreur critique → écran d'erreur
  if (hasCriticalError) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>
          Impossible de charger tes données. Veuillez réessayer.
        </Text>
        <Button
          title="Réessayer"
          color="#FF0050"
          onPress={() => {
            profileQuery.refetch();
            preferencesQuery.refetch();
          }}
        />
      </View>
    );
  }

  // 4. Tout est OK → on rend le layout complet
  // Les écrans d'onboarding gèrent leur propre logique de complétion
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