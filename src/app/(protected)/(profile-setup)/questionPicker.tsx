import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function QuestionPicker() {
  const router = useRouter();

  const handlePress = () => {
    router.replace({
      pathname: '/(protected)/(profile-setup)/uploadVideo',
      params: {
        videoText: 'tototot',
        videoTextId: 0,
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{
          backgroundColor: '#FF4458',
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
          Aller à l'écran suivant
        </Text>
      </TouchableOpacity>
    </View>
  );
}