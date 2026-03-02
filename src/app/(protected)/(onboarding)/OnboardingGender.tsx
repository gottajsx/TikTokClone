import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUpdateGender } from '@/hooks/useProfile';

type GenderType = 'male' | 'female' | 'non-binary' | null;

const genders: { label: string; value: GenderType }[] = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Non-binaire', value: 'non-binary' },
  { label: 'Ne pas préciser', value: null },
];

export default function OnboardingGenderScreen() {
  const [selectedGender, setSelectedGender] = useState<GenderType | null>(null);
  const { mutate, isPending } = useUpdateGender();

  const handleSelect = (value: GenderType) => {
    // Toggle : si déjà sélectionné → on décoche
    if (selectedGender === value) {
      setSelectedGender(null);
    } else {
      setSelectedGender(value);
    }
  };

  const handleValidate = () => {
    if (selectedGender === null) {
      Alert.alert('Sélection requise', 'Choisis ton genre pour continuer.');
      return;
    }

    mutate(selectedGender, {
      onSuccess: () => {
        console.log('Genre mis à jour → redirection vers prefs');
        router.replace('/(protected)/(onboarding)/OnboardingPreferencesGender');
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de mettre à jour le genre. Réessayez.'
        );
      },
    });
  };

  const isSelected = (value: GenderType) => selectedGender === value;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est ton genre ?</Text>

        {/* Ajout d'un petit texte explicatif comme dans l'écran 2 */}
        <Text style={styles.explanation}>
          Choisis une option. Tu pourras toujours modifier ce choix plus tard.
        </Text>

        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value ?? 'none'}
            style={[
              styles.option,
              isSelected(gender.value) && styles.selectedOption,
            ]}
            onPress={() => handleSelect(gender.value)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                isSelected(gender.value) && styles.checkboxSelected,
              ]}
            >
              {isSelected(gender.value) && <Text style={styles.check}>✓</Text>}
            </View>

            <Text
              style={[
                styles.optionText,
                isSelected(gender.value) && styles.selectedText,
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            (selectedGender === null || isPending) && styles.buttonDisabled,
          ]}
          disabled={isPending || selectedGender === null}
          onPress={handleValidate}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Continuer</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,          // ← aligné sur fichier 2
    textAlign: 'center',
  },
  explanation: {
    color: '#aaa',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 18,       // ← valeur du fichier 2
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,          // ← plus proche du fichier 2
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#2a2a2e',   // ← exactement comme fichier 2
    borderColor: '#FF0050',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  check: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    color: '#ddd',             // ← couleur de base identique au fichier 2
    fontSize: 18,
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',         // ← valeur du fichier 2
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#FF0050',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});