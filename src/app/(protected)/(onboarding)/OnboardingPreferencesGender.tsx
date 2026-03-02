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
import { useUpdateGenderPreferences } from '@/hooks/usePreferences';
import { GenderType } from '@/types/types';

// Typage strict
type GenderPref = 'male' | 'female' | 'non-binary' | null;

const genders: { label: string; value: GenderPref }[] = [
  { label: 'Hommes', value: 'male' },
  { label: 'Femmes', value: 'female' },
  { label: 'Non-binaires', value: 'non-binary' },
];

export default function OnboardingPreferencesGenderScreen() {
  const [selected, setSelected] = useState<Set<GenderType>>(new Set());
  const { mutate, isPending } = useUpdateGenderPreferences();

  const toggleGender = (value: GenderType) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const handleValidate = () => {
    const selectedArray = Array.from(selected);

    if (selectedArray.length === 0) {
      Alert.alert('Sélection requise', 'Choisis au moins une préférence.');
      return;
    }

    mutate(selectedArray, {
      onSuccess: () => {
        console.log('Préférences sauvegardées → redirection');
        router.replace('/(protected)/(tabs)');
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de sauvegarder tes préférences. Réessaie.'
        );
      },
    });
  };

  const isSelected = (value: GenderType) => selected.has(value);

  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qui souhaites-tu rencontrer ?</Text>
        
        {/* ← TEXTE EXPLICATIF AJOUTÉ ICI */}
        <Text style={styles.explanation}>
          Sélectionne une ou plusieurs options. Tu pourras toujours modifier tes préférences plus tard.
        </Text>

        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value}
            style={[
              styles.option,
              isSelected(gender.value) && styles.selectedOption,
            ]}
            onPress={() => toggleGender(gender.value)}
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
            (selected.size === 0 || isPending) && styles.buttonDisabled,
          ]}
          disabled={isPending || selected.size === 0}
          onPress={handleValidate}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Terminer</Text>
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
    marginBottom: 12,
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#2a2a2e',
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
    color: '#ddd',
    fontSize: 18,
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
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