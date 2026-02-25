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
import { useUpdateGenderPreference } from '@/services/profile';

// Typage strict aligné sur ton ENUM
type GenderPref = 'male' | 'female' | 'non-binary' | null;

const genders: { label: string; value: GenderPref }[] = [
  { label: 'Hommes', value: 'male' },
  { label: 'Femmes', value: 'female' },
  { label: 'Non-binaires', value: 'non-binary' },
  { label: 'Peu importe', value: null }, // ← équivalent à "ne pas préciser"
];

export default function OnboardingPreferencesGenderScreen() {
  const [selected, setSelected] = useState<GenderPref | null>(null);
  const { mutate, isPending } = useUpdateGenderPreference();

  const handleSelect = (value: GenderPref) => {
    setSelected(value);
  };

  const handleValidate = () => {
    mutate(selected, {
      onSuccess: () => {
        router.replace('/(protected)/(tabs)'); // route concrète
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de sauvegarder ta préférence. Réessaie.'
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qui souhaites-tu rencontrer ?</Text>

        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value ?? 'none'}
            style={[
              styles.option,
              selected === gender.value && styles.selectedOption,
            ]}
            onPress={() => handleSelect(gender.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selected === gender.value && { color: '#fff' },
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            (selected === null && selected !== null) || isPending
              ? styles.buttonDisabled
              : null,
          ]}
          disabled={isPending}
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
    marginBottom: 48,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  optionText: {
    color: '#ddd',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
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