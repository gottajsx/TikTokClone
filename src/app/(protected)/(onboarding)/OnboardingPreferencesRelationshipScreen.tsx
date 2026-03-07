import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// À adapter selon ton hook backend (quand tu le feras)
import { useUpdateRelationshipPreferences } from '@/hooks/usePreferences'; // ← À créer
import { RelationshipType } from '@/types/types'; // À définir

// Liste des options – 2026 vibe (inspiré Tinder/Hinge/Bumble/Feeld trends)
const relationshipOptions: { label: string; value: RelationshipType }[] = [
  { label: 'Relation sérieuse', value: 'serious' },
  { label: 'Relation longue durée mais chill', value: 'long_term_chill' },
  { label: 'Relation ouverte / ENM', value: 'open_enm' },
  { label: 'Polyamour', value: 'polyamory' },
  { label: 'Casual / léger', value: 'casual' },
  { label: 'Sex friends / régulier', value: 'fwb' },
  { label: 'Hookups / sans suite', value: 'hookups' },
  // Option bonus très utilisée en 2025-2026 :
  { label: 'Ouvert à explorer / je verrai', value: 'open_to_see' },
];

type RelationshipPref = typeof relationshipOptions[number]['value'] | null;

export default function OnboardingPreferencesRelationshipScreen() {
  const [selected, setSelected] = useState<Set<RelationshipType>>(new Set());
  const { mutate, isPending } = useUpdateRelationshipPreferences(); // ← Ton futur hook

  const toggleOption = (value: RelationshipType) => {
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
      Alert.alert('Sélection requise', 'Choisis au moins une option.');
      return;
    }

    mutate(selectedArray, {
      onSuccess: () => {
        console.log('Préférences relationnelles sauvegardées → redirection');
        router.replace('/(protected)/(tabs)'); // Ou ta route de fin d’onboarding
      },
      onError: (error: any) => {
        Alert.alert(
          'Erreur',
          error?.message || 'Impossible de sauvegarder. Réessaie.'
        );
      },
    });
  };

  const isSelected = (value: RelationshipType) => selected.has(value);

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel type de relation recherches-tu ?</Text>

        <Text style={styles.explanation}>
          Sélectionne une ou plusieurs options. Tu pourras changer ça quand tu veux plus tard.
        </Text>

        {relationshipOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected(option.value) && styles.selectedOption,
            ]}
            onPress={() => toggleOption(option.value)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                isSelected(option.value) && styles.checkboxSelected,
              ]}
            >
              {isSelected(option.value) && <Text style={styles.check}>✓</Text>}
            </View>
            <Text
              style={[
                styles.optionText,
                isSelected(option.value) && styles.selectedText,
              ]}
            >
              {option.label}
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
            <Text style={styles.buttonText}>Continuer</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
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