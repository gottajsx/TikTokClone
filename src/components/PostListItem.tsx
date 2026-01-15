import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function PostListItem() {
    const { height } = Dimensions.get('window');
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });
    
    return (
        <View style={{ height }}>
            <VideoView 
                style={{ flex: 1 }} 
                player={player} 
                contentFit="cover" 
                nativeControls={false} />
        </View>
    )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});