import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useUploadAvatar, useSkipAvatar } from '@/hooks/useAvatar';
import { useMyProfile } from '@/hooks/useProfile';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AvatarScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'edit' | 'onboarding' }>();

  const [image, setImage] = useState<string | null>(null);

  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: skipAvatar, isPending: skipping } = useSkipAvatar();

  // Récupération du profil en mode édition
  const { data: profile, isLoading: profileLoading } = useMyProfile(mode === 'edit');

  // Pré-remplissage de l'avatar existant en mode edit
  useEffect(() => {
    if (mode === 'edit' && profile?.avatar_url) {
      setImage(profile.avatar_url);
    }
  }, [mode, profile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImage(uri);
  };

  const handleValidate = () => {
    if (!image) return;

    uploadAvatar(image, {
      onSuccess: () => {
        if (mode === 'onboarding') {
          router.replace('/(protected)/(profile-setup)/questionPicker');
        } else {
          Alert.alert('Succès', 'Ton avatar a été mis à jour.');
          router.back();
        }
      },
      onError: (err: any) => {
        Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour ton avatar.');
      },
    });
  };

  const handleSkip = () => {
    skipAvatar(undefined, {
      onSuccess: () => {
        router.replace('/(protected)/(profile-setup)/questionPicker');
      },
      onError: (err: any) => {
        Alert.alert('Erreur', err?.message || 'Impossible de passer.');
      },
    });
  };

  const loading = uploading || skipping;

  if (mode === 'edit' && profileLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {mode === 'edit' ? 'Modifie ton avatar' : 'Ajoute une photo'}
      </Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Choisir une photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bouton Valider */}
      <TouchableOpacity
        disabled={!image || loading}
        onPress={handleValidate}
        style={[styles.button, styles.validateButton, (!image || loading) && styles.buttonDisabled]}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'edit' ? 'Mettre à jour' : 'Valider la photo'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Bouton Passer (uniquement en onboarding) */}
      {mode === 'onboarding' && (
        <TouchableOpacity
          disabled={!!image || loading}
          onPress={handleSkip}
          style={[styles.button, styles.skipButton, (!!image || loading) && styles.buttonDisabled]}
        >
          {skipping ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.skipText}>Passer</Text>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#333',
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  validateButton: {
    backgroundColor: '#FF0050',
  },
  skipButton: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipText: {
    color: '#ccc',
    fontSize: 17,
    fontWeight: '600',
  },
});