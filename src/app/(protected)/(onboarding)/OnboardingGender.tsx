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
import type { Profile } from '@/types/types';

type GenderType = NonNullable<Profile['gender']>; // 'male' | 'female' | 'non-binary'

const genders: { label: string; value: GenderType | null }[] = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Non-binaire', value: 'non-binary' },
  { label: 'Ne pas préciser', value: null },
];

export default function OnboardingGenderScreen() {
  const [selectedGender, setSelectedGender] = useState<GenderType | null>(null);
  const { mutate, isPending } = useUpdateGender();

  const handleValidate = () => {
    mutate(selectedGender, {
      onSuccess: () => {
        router.replace('/(protected)/(tabs)'); // ← route concrète pour éviter unmatched
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de mettre à jour le genre. Réessayez.',
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est ton genre ?</Text>

        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value ?? 'none'}
            style={[
              styles.option,
              selectedGender === gender.value && styles.selectedOption,
            ]}
            onPress={() => setSelectedGender(gender.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === gender.value && { color: '#fff' },
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            (!selectedGender && selectedGender !== null) || isPending
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
    color: '#fff',
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