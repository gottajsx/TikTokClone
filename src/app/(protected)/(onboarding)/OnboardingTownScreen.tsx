import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUpdateProfileLocation } from '@/hooks/useProfile';

type CitySuggestion = {
  name: string;
  postcode: string;
};

export default function OnboardingTownScreen() {
  const router = useRouter();
  const { mutate, isPending } = useUpdateProfileLocation();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [selectedTown, setSelectedTown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // 🔹 Recherche villes
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${debouncedQuery}&type=municipality&limit=5`
        );
        const json = await res.json();
        // ✅ Vérification sécurisée
        const features = Array.isArray(json.features) ? json.features : [];
        const cities = json.features.map((f: any) => ({
          name: f.properties.city,
          postcode: f.properties.postcode,
        }));
        setSuggestions(cities);
      } catch (err) {
        console.error('Erreur recherche ville', err);
        setSuggestions([]);
      }
      setLoading(false);
    };

    fetchCities();
  }, [debouncedQuery]);

  const selectTown = (city: CitySuggestion) => {
    setSelectedTown(city.name);
    setQuery(`${city.name} (${city.postcode})`);
    setSuggestions([]);
  };

  const handleValidate = () => {
    if (!selectedTown) return;
    mutate(
      { town: selectedTown, country: 'France' },
      { onSuccess: () => router.replace('/(protected)/(onboarding)/OnboardingAvatarScreen') }
    );
  };

  const handleSkip = () => {
    mutate(
      { town: null, country: null },
      { onSuccess: () => router.replace('/(protected)/(onboarding)/OnboardingAvatarScreen') }
    );
  };

  const hasTown = !!selectedTown;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Où habites-tu ?</Text>
        <Text style={styles.subtitle}>
          Indique ta ville. Tu pourras modifier ça plus tard.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Tape le nom de ta ville"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedTown(null);
          }}
        />

        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        <FlatList
          style={styles.list}
          data={suggestions}
          keyExtractor={(item) => item.name + item.postcode}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                selectedTown === item.name && styles.selectedCard,
              ]}
              onPress={() => selectTown(item)}
            >
              <Text style={styles.cardText}>
                {item.name} ({item.postcode})
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!hasTown || isPending) && styles.disabledButton,
            ]}
            disabled={!hasTown || isPending}
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
              (hasTown || isPending) && styles.disabledButton,
            ]}
            disabled={hasTown || isPending}
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
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  list: {
    maxHeight: 220,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedCard: {
    backgroundColor: '#000',
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCardText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#e6e6e6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: { fontWeight: '600' },
  disabledButton: { opacity: 0.4 },
});