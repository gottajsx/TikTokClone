import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Post } from "@/types/types";
import { Link, useFocusEffect } from "expo-router";
import { useEffect, useRef } from "react";

type VideoItemProps = {
  postItem: Post;
  isActive: boolean;
}

export default function PostListItem({ postItem, isActive }: VideoItemProps) {
  const { height } = Dimensions.get('window');
  const { nrOfComments, description, user, video_url } = postItem;
  
  const player = useVideoPlayer(video_url, player => {
    player.loop = true;
    player.muted = false;
  });

  // Ref pour éviter les appels après unmount (race condition Android)
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {   
    if (!player) return;

    if (isActive) {
      if (isMountedRef.current) {
        try {
           player.play();
        } catch (err) {
          console.log('Play failed (unexpected):', err);
        }  
      }
    } else {
        if (isMountedRef.current) {
          try {
            player.pause();
          } catch (err) {
            console.log('Pause failed (unexpected):', err);
          }  
        }
      }
  }, [isActive, player]);

  // Reset à 0s + play quand active
  useEffect(() => {
    if (isActive && player) {
      try {
        player.replay();
      } catch(err) {
        console.log('Replay failed (unexpected):', err);
      }
    }
  }, [isActive, player]);

    
  return (
    <View style={{ height: height - 80, backgroundColor: '#000' }}>
      <VideoView 
        style={StyleSheet.absoluteFill}
        player={player} 
        contentFit="cover" 
        allowsPictureInPicture
      />

      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.interactionButton} onPress={() => console.log('Like Pressed')}>
          <Ionicons name="heart" size={33} color="#fff" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <Link href="/">
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="chatbubble" size={30} color="#fff" />
            <Text style={styles.interactionText}>{nrOfComments[0]?.count || 0}</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.interactionButton} onPress={() => console.log('Share Pressed')}>
           <Ionicons name="arrow-redo" size={33} color="#fff" />
           <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatar} onPress={() => console.log('Profile Pressed')}>
           <Text style={styles.avatarText}>{user?.username.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.description}>{description}</Text>
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