import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateProfileLocation, useMyProfile } from '@/hooks/useProfile';

type CitySuggestion = {
  name: string;
  postcode: string;
};

export default function TownScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'edit' | 'onboarding' }>();

  const router = useRouter();
  const { mutate, isPending } = useUpdateProfileLocation();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [selectedTown, setSelectedTown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupération du profil en mode edit
  const { data: profile, isLoading: profileLoading } = useMyProfile(mode === 'edit');

  // Pré-remplissage en mode edit
  useEffect(() => {
    if (mode === 'edit' && profile) {
      if (profile.town) {
        setSelectedTown(profile.town);
        setQuery(`${profile.town}${profile.country ? ` (${profile.country})` : ''}`);
      }
    }
  }, [mode, profile]);

  // Debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Recherche villes via API data.gouv.fr
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

        const cities = Array.isArray(json.features)
          ? json.features.map((f: any) => ({
              name: f.properties.city,
              postcode: f.properties.postcode,
            }))
          : [];

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
      {
        onSuccess: () => {
          if (mode === 'onboarding') {
            router.replace('/(protected)/(profile-setup)/avatar?mode=onboarding');
          } else {
            Alert.alert('Succès', 'Ta localisation a été mise à jour.');
            router.back();
          }
        },
      }
    );
  };

  const handleSkip = () => {
    mutate(
      { town: null, country: null },
      { onSuccess: () => router.replace('/(protected)/(profile-setup)/avatar?mode=onboarding') }
    );
  };

  const hasTown = !!selectedTown;

  if (mode === 'edit' && profileLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Où habites-tu ?</Text>

        <Text style={styles.subtitle}>
          {mode === 'edit'
            ? 'Modifie ta ville actuelle si besoin.'
            : 'Indique ta ville. Tu pourras modifier ça plus tard.'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Tape le nom de ta ville"
          placeholderTextColor="#888"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedTown(null); // Réinitialise la sélection si on retape
          }}
        />

        {loading && <ActivityIndicator style={{ marginTop: 12 }} color="#FF0050" />}

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
              <Text
                style={[
                  styles.cardText,
                  selectedTown === item.name && styles.selectedCardText,
                ]}
              >
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
              <Text style={styles.primaryButtonText}>
                {mode === 'edit' ? 'Mettre à jour' : 'Valider'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'onboarding' && (
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
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  list: {
    maxHeight: 260,
    marginTop: 8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1f1f1f',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedCard: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  cardText: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
  },
  selectedCardText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FF0050',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#ccc',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.4,
  },
});