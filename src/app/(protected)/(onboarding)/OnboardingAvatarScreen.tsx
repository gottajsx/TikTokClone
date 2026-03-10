import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useUploadAvatar, useSkipAvatar } from '@/hooks/useAvatar';

export default function OnboardingAvatarScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);

  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: skipAvatar, isPending: skipping } = useSkipAvatar();

  const isLoading = uploading || skipping;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
  };

  const handleValidate = () => {
    if (!imageUri) return;

    uploadAvatar(imageUri, {
      onSuccess: () => {
        router.replace('/(protected)/(tabs)');
      },
    });
  };

  const handleSkip = () => {
    skipAvatar(undefined, {
      onSuccess: () => {
        router.replace('/(protected)/(tabs)');
      },
    });
  };

  const hasImage = !!imageUri;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ajoute une photo</Text>
        <Text style={styles.subtitle}>
          Les profils avec photo reçoivent beaucoup plus de matchs.
        </Text>

        {/* AVATAR */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Choisir une photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* BOUTONS */}
        <View style={styles.buttons}>
          {/* VALIDER */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!hasImage || isLoading) && styles.disabledButton,
            ]}
            disabled={!hasImage || isLoading}
            onPress={handleValidate}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Valider</Text>
            )}
          </TouchableOpacity>

          {/* PASSER */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (hasImage || isLoading) && styles.disabledButton,
            ]}
            disabled={hasImage || isLoading}
            onPress={handleSkip}
          >
            {skipping ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.secondaryButtonText}>Passer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 40,
    textAlign: 'center',
  },

  avatarContainer: {
    marginBottom: 40,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  placeholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    color: '#777',
  },

  buttons: {
    width: '100%',
    marginTop: 'auto',
    gap: 12,
  },

  primaryButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: '#E6E6E6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },

  disabledButton: {
    opacity: 0.4,
  },
});