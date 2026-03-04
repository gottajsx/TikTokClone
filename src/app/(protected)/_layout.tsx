import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useMyProfile } from '@/hooks/useProfile';
import { useActiveTermsVersion } from '@/hooks/useTerms';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';

export default function ProtectedLayout() {
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const profileQuery = useMyProfile(isAuthenticated);
  const preferencesQuery = useMyPreferences(isAuthenticated);
  const termsVersionQuery = useActiveTermsVersion(isAuthenticated);

  const isLoading =
    authLoading ||
    profileQuery.isLoading ||
    preferencesQuery.isLoading ||
    termsVersionQuery.isLoading;

  const hasCriticalError =
    profileQuery.isError ||
    preferencesQuery.isError ||
    termsVersionQuery.isError;

  // 1. Pas authentifié → login
  if (!isAuthenticated && !isLoading) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Chargement → loader
  if (isLoading) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  // 3. Erreur critique
  if (hasCriticalError) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>
          Impossible de charger les données nécessaires. Veuillez réessayer.
        </Text>
        <Button
          title="Réessayer"
          color="#FF0050"
          onPress={() => {
            profileQuery.refetch();
            preferencesQuery.refetch();
            termsVersionQuery.refetch();
          }}
        />
      </View>
    );
  }

  const profile = profileQuery.data;
  const latestVersion = termsVersionQuery.data;

  // ✅ Guard : données pas encore disponibles malgré isLoading = false
  // (cas de staleTime cache qui se revalide en arrière-plan)
  if (!profile || latestVersion === undefined) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  // 4. Vérification CGU
  // ✅ latestVersion === null signifie que la query a répondu
  // mais qu'il n'y a pas de version active configurée
  if (latestVersion === null) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>
          Configuration des conditions d'utilisation non disponible.
        </Text>
      </View>
    );
  }

  // ✅ On vérifie seulement quand les deux valeurs sont définies et non-null
  const needsToAcceptTerms =
    !profile.terms_accepted_at ||
    profile.terms_version !== latestVersion;

  if (needsToAcceptTerms) {
    return <Redirect href="/(auth)/terms" />;
  }

  // 5. Tout est OK
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