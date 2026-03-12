import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useUpdateGender, useMyProfile } from '@/hooks/useProfile';

type GenderType = 'male' | 'female' | 'non-binary' | null;

const genders: { label: string; value: GenderType }[] = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Non-binaire', value: 'non-binary' },
];

export default function GenderScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'edit' | 'onboarding' }>();
  const [selectedGender, setSelectedGender] = useState<GenderType | null>(null);
  const { mutate, isPending } = useUpdateGender();

  // Hook pour récupérer le profil actuel (utile si mode === 'edit')
  const { data: profile, isLoading: profileLoading } = useMyProfile(mode === 'edit');

  // On initialise le genre si on est en mode edit
  useEffect(() => {
    if (mode === 'edit' && profile) {
      setSelectedGender(profile.gender ?? null);
    }
  }, [mode, profile]);

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
        if (mode === 'onboarding') {
          router.replace('/(protected)/(profile-setup)/preferences');
        } else {
          Alert.alert('Succès', 'Ton genre a été mis à jour.');
          router.back(); // ou router.replace('/profile') selon ton flow
        }
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

  if (mode === 'edit' && profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#FF0050" size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est ton genre ?</Text>
        
        <Text style={styles.explanation}>
          {mode === 'edit'
            ? 'Ton genre actuel est pré-sélectionné. Tu peux le modifier si besoin.'
            : 'Choisis une option. Tu pourras toujours modifier ce choix plus tard.'}
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
            <Text style={styles.buttonText}>
              {mode === 'edit' ? 'Mettre à jour' : 'Continuer'}
            </Text>
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