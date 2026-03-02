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
        console.log('Genre mis à jour → redirection');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est ton genre ?</Text>

        {genders.map((gender) => {
          const isSelected = selectedGender === gender.value;

          return (
            <TouchableOpacity
              key={gender.value ?? 'none'}
              style={styles.optionRow}
              onPress={() => handleSelect(gender.value)}
              activeOpacity={0.8}
            >
              {/* Checkbox */}
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <View style={styles.checkboxInner} />}
              </View>

              {/* Texte */}
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                ]}
              >
                {gender.label}
              </Text>
            </TouchableOpacity>
          );
        })}

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
    marginBottom: 48,
    textAlign: 'center',
  },

  // Nouvelle structure : row avec checkbox + texte
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'transparent',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1, // pour prendre tout l'espace restant
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
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