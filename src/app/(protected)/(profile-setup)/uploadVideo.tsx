import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Circle, Svg } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useUploadProfileVideo } from '@/hooks/useUploadProfileVideo';
import { useLocalSearchParams } from 'expo-router';

const MAX_DURATION = 30;
const STROKE_CIRCUMFERENCE = 2 * Math.PI * 45;

export default function OnboardingVideoExpoScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [facing, setFacing] = useState<'front' | 'back'>('front');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const { videoText, videoTextId } = useLocalSearchParams<{
    videoText?: string;
    videoTextId?: string; // expo-router passe tout en string
  }>();

  // Convertir videoTextId en number
  const parsedVideoTextId = 
    videoTextId && !isNaN(Number(videoTextId))
      ? Number(videoTextId)
      : null;

  const router = useRouter();

  const { mutate: uploadVideo, isPending } = useUploadProfileVideo();

  const player = useVideoPlayer(videoUri ?? '', (p) => {
    p.loop = true;
    if (videoUri) p.play();
  });

  useEffect(() => {
    if (recording) {
      setProgress(0);
      progressAnim.setValue(0);

      animRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: MAX_DURATION * 1000,
        useNativeDriver: false,
      });
      animRef.current.start();

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= MAX_DURATION) {
            clearInterval(intervalRef.current!);
            return MAX_DURATION;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      animRef.current?.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      animRef.current?.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recording, progressAnim]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;
    setRecording(true);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
      });

      if (video?.uri) {
        setVideoUri(video.uri);
        const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, { time: 1000 });
        setThumbnailUri(uri);
      }
    } catch (e) {
      console.error('Erreur enregistrement :', e);
    } finally {
      setRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  const restartRecording = useCallback(() => {
    setVideoUri(null);
    setThumbnailUri(null);
    setProgress(0);
    progressAnim.setValue(0);
  }, [progressAnim]);

  const handleUpload = useCallback(() => {
    if (!videoUri || isPending) return;

    uploadVideo(
      {
        videoUri,
        videoText:  videoText ?? null,
        videoTextId: parsedVideoTextId,
      },
      {
        onSuccess: () => {
          console.log('Vidéo uploadée: redirection');
          router.replace('/(protected)/(tabs)');
        },
        onError: (error) => {
          console.error('Erreur upload vidéo :', error);
        },
      }
    );
  }, [videoUri, videoText, parsedVideoTextId, uploadVideo, router, isPending]);

  const switchCamera = useCallback(() => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const strokeDashoffset = STROKE_CIRCUMFERENCE - (STROKE_CIRCUMFERENCE * progress) / MAX_DURATION;

  // --- Permissions ---
  if (!cameraPermission || !micPermission) return null;

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 16, color: '#fff' }}>Autoriser l'accès à la caméra</Text>
        <TouchableOpacity
          onPress={async () => {
            if (!cameraPermission.granted) await requestCameraPermission();
            if (!micPermission.granted) await requestMicPermission();
          }}
          style={{ backgroundColor: '#FF4458', padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Autoriser</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Prévisualisation de la vidéo enregistrée ---
  if (videoUri) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={{ flex: 1 }}>
          <VideoView
            player={player}
            style={{ flex: 1 }}
            contentFit="cover"
            nativeControls
          />

          {thumbnailUri && !isPending && (
            <Image
              source={{ uri: thumbnailUri }}
              style={{
                width: 80,
                height: 80,
                position: 'absolute',
                top: 40,
                right: 20,
                borderRadius: 8,
              }}
            />
          )}

          <View style={{ padding: 20 }}>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isPending}
              style={{
                backgroundColor: '#FF4458',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Valider la vidéo</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={restartRecording}
              style={{ backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- Vue caméra ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          mode="video"
        />

        <TouchableOpacity
          onPress={switchCamera}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            padding: 10,
            backgroundColor: '#333',
            borderRadius: 20,
          }}
        >
          <Text style={{ color: '#fff' }}>🔄</Text>
        </TouchableOpacity>

        <View
          style={{
            position: 'absolute',
            bottom: 60,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg height={100} width={100} style={{ position: 'absolute' }}>
            <Circle
              cx="50"
              cy="50"
              r="45"
              stroke="#FF4458"
              strokeWidth={5}
              fill="transparent"
              strokeDasharray={STROKE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90, 50, 50)"
            />
          </Svg>

          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: recording ? '#FF4458' : 'white',
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}