import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function PostListItem() {
  const { height } = Dimensions.get('window');
  const player = useVideoPlayer(videoSource, player => {
  player.loop = true;
  player.play();
});
    
  return (
    <View style={{ height: height - 80 }}>
      <VideoView 
        style={{ flex: 1 }} 
        player={player} 
        contentFit="cover" 
        nativeControls={false} 
      />

      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.interactionButton} onPress={() => console.log('Like Pressed')}>
          <Ionicons name="heart" size={33} color="#fff" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>
      </View>

        
    </View>

    
  );
};

const styles = StyleSheet.create({
  interactionBar: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    gap: 25
  },
  interactionButton: {
    alignItems: 'center',
    gap: 5
  },
  interactionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  avatar: {
    width: 35,
    height: 35,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 25,
    fontWeight: 'bold'
  },
  videoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 100,
    gap: 5
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#fff'
  }
});