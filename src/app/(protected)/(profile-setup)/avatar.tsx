import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
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

  // Récupération du profil si mode edit
  const { data: profile, isLoading: profileLoading } = useMyProfile(mode === 'edit');

  // Préremplissage si avatar existant en mode edit
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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 20 }}>
        {mode === 'edit' ? 'Modifie ton avatar' : 'Ajoute une photo'}
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
          <Image source={{ uri: image }} style={{ width: 160, height: 160, borderRadius: 80 }} />
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
            {mode === 'edit' ? 'Mettre à jour' : 'Valider la photo'}
          </Text>
        )}
      </TouchableOpacity>

      {/* bouton skip */}
      {mode === 'onboarding' && (
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
            <Text style={{ color: 'white', fontWeight: '600' }}>Passer</Text>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}