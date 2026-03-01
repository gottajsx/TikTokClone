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
  Linking,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useRouter } from 'expo-router';
import { useActiveTerms } from '@/hooks/useTerms';
import { useAcceptTerms } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/useAuthStore';

// Styles personnalisés pour le Markdown (très important pour un beau rendu)
const markdownStyles = {
  heading1: {
    fontSize: 28,
    fontWeight: '700' as const,      // ← ou 'bold' as const
    color: '#111',
    marginTop: 24,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: '#222',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  strong: {
    fontWeight: '700' as const,      // ← clé du problème
  },
  em: {
    fontStyle: 'italic' as const,
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet_list_icon: {
    fontSize: 16,
    marginRight: 8,
    color: '#FF0050',
  },
  link: {
    color: '#FF0050',
    textDecorationLine: 'underline' as const,
  },
} as const;

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
        router.replace('/(protected)/(tabs)'); // ou '/' ou le chemin de ta tab principale
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
      'Vous devez accepter les conditions d’utilisation pour utiliser l’application.',
      [{ text: 'OK' }]
    );
  };

  // Gestion des liens cliquables dans le Markdown
  const onLinkPress = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d’ouvrir le lien');
      }
    });
  };

  if (termsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF0050" />
          <Text style={styles.loadingText}>Chargement des conditions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (termsError || !terms) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Impossible de charger les conditions d'utilisation.
          </Text>
          <Text style={styles.errorSubText}>
            Vérifiez votre connexion et réessayez.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Conditions Générales d'Utilisation</Text>
        <Text style={styles.version}>Version {terms.version}</Text>
        <Text style={styles.date}>Mise à jour le 1er mars 2026</Text>
      </View>

      {/* Contenu Markdown */}
      <ScrollView style={styles.scrollContainer}>
        <Markdown
          style={markdownStyles}
          rules={{
            link: (node, children, parent, styles) => (
              <TouchableOpacity
                key={node.key}
                onPress={() => onLinkPress(node.attributes.href)}
              >
                <Text style={styles.link}>{children}</Text>
              </TouchableOpacity>
            ),
          }}
        >
          {terms.content}
        </Markdown>

        {/* Espace en bas pour ne pas que le bouton colle au texte */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Boutons d'action en bas */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={handleDecline}
          disabled={isAccepting}
        >
          <Text style={styles.declineText}>Refuser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isAccepting}
        >
          {isAccepting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.acceptText}>J'accepte</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },
  version: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#FF0050',
    marginLeft: 12,
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
  },
  acceptText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  declineText: {
    color: '#333',
    fontSize: 17,
    fontWeight: '600',
  },
});