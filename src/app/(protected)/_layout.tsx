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

  // ✅ isPending = true si disabled OU en cours de chargement
  // contrairement à isLoading qui est false si la query est désactivée
  const isLoading =
    authLoading ||
    profileQuery.isPending ||
    preferencesQuery.isPending ||
    termsVersionQuery.isPending;

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

  // ✅ Guard : données pas encore disponibles malgré isPending = false
  if (!profile || latestVersion === undefined) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  // 4. Pas de version CGU active configurée
  if (latestVersion === null) {
    return (
      <View style={styles.fullscreen}>
        <Text style={styles.errorText}>
          Configuration des conditions d'utilisation non disponible.
        </Text>
      </View>
    );
  }

  // 5. Vérification CGU
  // ✅ On vérifie seulement quand profile ET latestVersion sont définis et non-null
  const needsToAcceptTerms =
    !profile.terms_accepted_at ||
    profile.terms_version !== latestVersion;

  if (needsToAcceptTerms) {
    return <Redirect href="/(auth)/terms" />;
  }

  // 6. Tout est OK
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