import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useUpdateProfileBio } from '@/hooks/useProfile';

const MAX_LENGTH = 80;

const suggestions = [
  "Toujours partant pour un café ☕",
  "Amateur de randonnées et de bons restos",
  "Curieux de rencontrer de nouvelles personnes",
  "Passionné de voyages et de cuisine",
  "Fan de cinéma et de discussions tardives",
];

export default function OnboardingBioScreen() {
  const [bio, setBio] = useState('');
  const [inputHeight, setInputHeight] = useState(120);

  const router = useRouter();
  const { mutate, isPending } = useUpdateProfileBio();

  const remaining = MAX_LENGTH - bio.length;
  const hasText = bio.trim().length > 0;

  const handleValidate = () => {
    mutate(bio, {
      onSuccess: () => {
        router.replace('/(protected)/(onboarding)/OnboardingTownScreen');
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
    router.replace('/(protected)/(onboarding)/OnboardingTownScreen');
  };

  const applySuggestion = (text: string) => {
    if (text.length <= MAX_LENGTH) {
      setBio(text);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ajoute une bio</Text>
        <Text style={styles.subtitle}>
          Une petite phrase peut aider à briser la glace.
        </Text>

        {/* INPUT AUTO RESIZE */}
        <TextInput
          style={[styles.input, { height: inputHeight }]}
          placeholder="Écris une courte bio..."
          value={bio}
          multiline
          maxLength={MAX_LENGTH}
          onChangeText={(text) => setBio(text)}
          onContentSizeChange={(e) =>
            setInputHeight(Math.max(120, e.nativeEvent.contentSize.height))
          }
          textAlignVertical="top"
        />

        <Text style={styles.counter}>
          {remaining} caractères restants
        </Text>

        {/* SUGGESTIONS */}
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

        {/* BOUTONS */}
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
              <Text style={styles.primaryButtonText}>Valider</Text>
            )}
          </TouchableOpacity>

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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  content: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },

  counter: {
    marginTop: 8,
    textAlign: 'right',
    color: '#777',
  },

  suggestionsContainer: {
    marginTop: 20,
    gap: 10,
  },

  suggestion: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  suggestionText: {
    fontSize: 14,
    color: '#444',
  },

  buttons: {
    marginTop: 40,
    gap: 12,
  },

  primaryButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#DDD',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  disabledButton: {
    opacity: 0.4,
  },
});