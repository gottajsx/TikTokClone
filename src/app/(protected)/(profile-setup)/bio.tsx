import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateProfileBio, useMyProfile } from '@/hooks/useProfile';

const MAX_LENGTH = 80;

const suggestions = [
  "Toujours partant pour un café ☕",
  "Amateur de randonnées et de bons restos",
  "Curieux de rencontrer de nouvelles personnes",
  "Passionné de voyages et de cuisine",
  "Fan de cinéma et de discussions tardives",
];

export default function BioScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'edit' | 'onboarding' }>();

  const [bio, setBio] = useState('');
  const [inputHeight, setInputHeight] = useState(120);

  const router = useRouter();
  const { mutate, isPending } = useUpdateProfileBio();

  // Récupération de la bio actuelle en mode edit
  const { data: profile, isLoading: profileLoading } = useMyProfile(mode === 'edit');

  // Pré-remplir la bio existante
  useEffect(() => {
    if (mode === 'edit' && profile?.bio) {
      setBio(profile.bio);
    }
  }, [mode, profile]);

  const remaining = MAX_LENGTH - bio.length;
  const hasText = bio.trim().length > 0;

  const handleValidate = () => {
    mutate(bio, {
      onSuccess: () => {
        if (mode === 'onboarding') {
          router.replace('/(protected)/(profile-setup)/town?mode=onboarding');
        } else {
          Alert.alert('Succès', 'Ta bio a été mise à jour.');
          router.back();
        }
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de sauvegarder ta bio.'
        );
      },
    });
  };

  const handleSkip = () => {
    router.replace('/(protected)/(profile-setup)/town?mode=onboarding');
  };

  const applySuggestion = (text: string) => {
    if (text.length <= MAX_LENGTH) {
      setBio(text);
    }
  };

  if (mode === 'edit' && profileLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === 'edit' ? 'Modifie ta bio' : 'Ajoute une bio'}
        </Text>

        <Text style={styles.subtitle}>
          {mode === 'edit'
            ? 'Modifie ta bio actuelle ci-dessous.'
            : 'Une petite phrase peut aider à briser la glace.'}
        </Text>

        {/* Input auto-resize */}
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          placeholder="Écris une courte bio..."
          placeholderTextColor="#888"
          value={bio}
          multiline
          maxLength={MAX_LENGTH}
          onChangeText={setBio}
          onContentSizeChange={(e) =>
            setInputHeight(Math.max(120, e.nativeEvent.contentSize.height))
          }
          textAlignVertical="top"
        />

        <Text style={styles.counter}>
          {remaining} caractères restants
        </Text>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestion}
              onPress={() => applySuggestion(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!hasText || isPending) && styles.disabledButton,
            ]}
            disabled={!hasText || isPending}
            onPress={handleValidate}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'edit' ? 'Mettre à jour' : 'Valider'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'onboarding' && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                hasText && styles.disabledButton,
              ]}
              disabled={hasText}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryButtonText}>Passer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: 8,
    textAlign: 'right',
    color: '#777',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 24,
    gap: 10,
  },
  suggestion: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionText: {
    fontSize: 14,
    color: '#ddd',
  },
  buttons: {
    marginTop: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#ccc',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.4,
  },
});