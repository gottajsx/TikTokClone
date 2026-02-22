import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { useUpdateGender } from '@/services/profile';

const genders = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
  { label: 'Non-binaire', value: 'non_binary' },
  { label: 'Autre', value: 'other' },
]

export default function GenderScreen() {
  const router = useRouter()
  const [selectedGender, setSelectedGender] = useState<string | null>(null)

  const { mutate, isPending } = useUpdateGender()

  const handleValidate = () => {
    if (!selectedGender) return

    mutate(selectedGender, {
      onSuccess: () => {
        router.replace("/(protected)");
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est ton genre ?</Text>

        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.value}
            style={[
              styles.option,
              selectedGender === gender.value && styles.selectedOption,
            ]}
            onPress={() => setSelectedGender(gender.value)}
          >
            <Text style={styles.optionText}>{gender.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            (!selectedGender || isPending) && { opacity: 0.5 },
          ]}
          disabled={!selectedGender || isPending}
          onPress={handleValidate}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continuer</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: Platform.OS === 'android' ? 40 : 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 40,
  },
  option: {
    backgroundColor: '#1c1c1e',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedOption: {
    backgroundColor: '#6C5CE7',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    marginTop: 40,
    backgroundColor: '#6C5CE7',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})