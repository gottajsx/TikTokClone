import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useUploadAvatar, useSkipAvatar } from '@/hooks/useAvatar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingAvatarScreen() {
  const [image, setImage] = useState<string | null>(null);

  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: skipAvatar, isPending: skipping } = useSkipAvatar();

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

  const loading = uploading || skipping;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>

      <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 20 }}>
        Ajoute une photo
      </Text>

      <TouchableOpacity
        onPress={pickImage}
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: '#eee',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 160, height: 160, borderRadius: 80 }}
          />
        ) : (
          <Text>Choisir</Text>
        )}
      </TouchableOpacity>

      {/* bouton valider */}
      <TouchableOpacity
        disabled={!image || loading}
        onPress={handleValidate}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          backgroundColor: image ? '#FF4458' : '#ccc',
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Valider la photo
          </Text>
        )}
      </TouchableOpacity>

      {/* bouton skip */}
      <TouchableOpacity
        disabled={!!image || loading}
        onPress={handleSkip}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          backgroundColor: !image ? '#000' : '#ccc',
          alignItems: 'center',
        }}
      >
        {skipping ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Passer
          </Text>
        )}
      </TouchableOpacity>

    </SafeAreaView>
  );
}