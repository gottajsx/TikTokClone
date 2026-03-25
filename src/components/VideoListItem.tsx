import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { ProfileVideo } from "@/types/types";
import { useEffect, useRef } from "react";
import { useLike } from "@/hooks/useLike";

type VideoItemProps = {
  videoItem: ProfileVideo;
  isActive: boolean;
  height: number; // ✅ number (minuscule), pas Number
}

export default function VideoListItem({ videoItem, isActive, height }: VideoItemProps) {
  const { profile_id, username, video_url, video_text, gender } = videoItem;
  const { isLiked, likesCount, toggle, isLoading } = useLike(profile_id);

  const player = useVideoPlayer(video_url, player => {
    player.loop = true;
    player.muted = false;
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Un seul useEffect pour play/pause + replay, évite les conflits
  useEffect(() => {
    if (!player || !isMountedRef.current) return;

    try {
      if (isActive) {
        player.replay();
      } else {
        player.pause();
      }
    } catch (err) {
      console.log('Player action failed:', err);
    }
  }, [isActive, player]);

  return (
    // ✅ width: '100%' entre guillemets (string), pas width:100%
    <View style={{ height, width: '100%', backgroundColor: '#000' }}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        allowsPictureInPicture
      />

      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={toggle}
          disabled={isLoading}
        >
          <Ionicons
            name="heart"
            size={33}
            color={isLiked ? '#FF2D55' : '#fff'}
          />
          <Text style={styles.interactionText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton} onPress={() => console.log('Comment Pressed')}>
          <Ionicons name="chatbubble" size={30} color="#fff" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton} onPress={() => console.log('Share Pressed')}>
          <Ionicons name="arrow-redo" size={33} color="#fff" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatar} onPress={() => console.log('Profile Pressed')}>
          <Text style={styles.avatarText}>{username?.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.videoText}>{video_text}</Text>
        <Text style={styles.gender}>{gender}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionBar: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    gap: 25,
  },
  interactionButton: {
    alignItems: 'center',
    gap: 5,
  },
  interactionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 35,
    height: 35,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 100,
    gap: 5,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoText: {
    color: '#fff',
    fontSize: 14,
  },
  gender: {
    color: '#aaa',
    fontSize: 12,
  },
});