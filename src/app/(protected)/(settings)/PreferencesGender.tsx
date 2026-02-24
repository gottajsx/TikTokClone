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
import { useUpdateGenderPreferences } from '@/services/profile';

// Typage strict aligné sur ton ENUM
type GenderPref = 'male' | 'female' | 'non-binary';

const genders: { label: string; value: GenderPref }[] = [
  { label: 'Hommes', value: 'male' },
  { label: 'Femmes', value: 'female' },
  { label: 'Non-binaires', value: 'non-binary' },
  // Si tu veux garder "Autres" → ajoute-le ici et dans l'ENUM
  // { label: 'Autres', value: 'other' },
];

export default function PreferencesGenderScreen() {
  const [selected, setSelected] = useState<GenderPref[]>([]);
  const { mutate, isPending } = useUpdateGenderPreferences();

  const toggleGender = (value: GenderPref) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  const handleValidate = () => {
    if (selected.length === 0) {
      Alert.alert('Sélection requise', 'Choisis au moins une préférence.');
      return;
    }

    mutate(selected, {
      onSuccess: () => {
        router.replace('/(protected)/(tabs)'); // ← route concrète
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de sauvegarder tes préférences. Réessaie.'
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
            key={gender.value}
            style={[
              styles.option,
              selected.includes(gender.value) && styles.selectedOption,
            ]}
            onPress={() => toggleGender(gender.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selected.includes(gender.value) && { color: '#fff' },
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            (selected.length === 0 || isPending) && styles.buttonDisabled,
          ]}
          disabled={selected.length === 0 || isPending}
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