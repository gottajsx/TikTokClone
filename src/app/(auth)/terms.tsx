import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveTerms } from '@/hooks/useTerms';
import { useAcceptTerms } from '@/hooks/useProfile'; // le hook qu'on a créé précédemment
import { useAuthStore } from '@/stores/useAuthStore';

export default function TermsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const {
    data: terms,
    isLoading: termsLoading,
    isError: termsError,
  } = useActiveTerms(isAuthenticated);

  const {
    mutate: acceptTerms,
    isPending: isAccepting,
  } = useAcceptTerms();

  const handleAccept = () => {
    if (!terms?.version) return;

    acceptTerms(terms.version, {
      onSuccess: () => {
        // Redirection après acceptation réussie
        router.replace('/(protected)/(tabs)'); // ou '/' ou '(tabs)/index' selon ta structure
        // Alternative : router.back() si tu veux revenir à l'écran précédent
      },
      onError: (error) => {
        Alert.alert(
          'Erreur',
          'Impossible d’accepter les conditions. Veuillez réessayer.',
          [{ text: 'OK' }]
        );
        console.error('Erreur acceptation CGU:', error);
      },
    });
  };

  const handleDecline = () => {
    Alert.alert(
      'Attention',
      'Vous devez accepter les conditions d’utilisation pour continuer.',
      [{ text: 'OK' }]
    );
  };

  if (termsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0050" />
          <Text style={styles.loadingText}>Chargement des conditions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (termsError || !terms) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Impossible de charger les conditions d'utilisation.
          </Text>
          <Text style={styles.errorSubText}>
            Veuillez vérifier votre connexion et réessayer.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conditions Générales d'Utilisation</Text>
        <Text style={styles.version}>Version {terms.version}</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.content}>{terms.content}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={handleDecline}
          disabled={isAccepting}
        >
          <Text style={styles.declineButtonText}>Refuser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isAccepting}
        >
          {isAccepting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>J'accepte</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  version: {
    fontSize: 15,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#FF0050',
    marginLeft: 12,
  },
  declineButton: {
    backgroundColor: '#f0f0f0',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF0050',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorSubText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});