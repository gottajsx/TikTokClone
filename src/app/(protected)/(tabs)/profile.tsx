import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { useMyProfile } from '@/hooks/useProfile';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useCompatibleVideos } from '@/hooks/useVideos';
import { RelationshipType } from '@/types/types';

const { width } = Dimensions.get('window');

// ─── Labels ─────────────────────────────────────────

const RELATION_LABELS: Record<RelationshipType, string> = {
  serious: '💍 Relation sérieuse',
  long_term_chill: '😌 Long terme détendu',
  open_enm: '🔓 ENM / ouvert',
  polyamory: '💞 Polyamour',
  casual: '🌊 Casual',
  fwb: '🤝 FWB',
  hookups: '🔥 Rencontres',
  open_to_see: '🤷 Ouvert à voir',
};

// ─── Helpers ────────────────────────────────────────

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ─── Component ──────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: preferences, isLoading: prefsLoading } = useMyPreferences();
  const { videos, loading: videosLoading } = useCompatibleVideos();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const isLoading = profileLoading || prefsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
      </SafeAreaView>
    );
  }

  const age = profile.birth_date ? calculateAge(profile.birth_date) : null;

  const myVideos = (videos ?? []).filter(
    (v: any) => v.profile_id === profile.id
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() =>
                router.push('/(protected)/(profile-setup)/edit-profile')
              }
            >
              <Ionicons name="create-outline" size={26} color="#FF0050" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push('/(protected)/(profile-setup)/settings')
              }
            >
              <Ionicons name="settings-outline" size={26} color="#FF0050" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFIL CENTRÉ */}
        <View style={styles.profileCenter}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {profile.username?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}

          <Text style={styles.centerName}>
            {profile.username}
            {age ? `, ${age}` : ''}
          </Text>

          {(profile.town || profile.country) && (
            <Text style={styles.centerLocation}>
              {[profile.town, profile.country].filter(Boolean).join(', ')}
            </Text>
          )}

          {profile.bio && (
            <Text style={styles.centerBio}>
              {profile.bio}
            </Text>
          )}
        </View>

        {/* VIDEOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes vidéos</Text>

          {videosLoading ? (
            <ActivityIndicator color="#FF0050" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {myVideos.map((v: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedVideo(v);
                    setModalVisible(true);
                  }}
                  style={styles.videoContainer}
                >
                  <View style={styles.secondaryVideo}>
                    <Text style={styles.videoIcon}>▶</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addVideo}
                onPress={() =>
                  router.push(
                    '/(protected)/(profile-setup)/uploadVideo?mode=edit'
                  )
                }
              >
                <Ionicons name="add" size={36} color="#666" />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* MODAL VIDEO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: '/video-preview',
                  params: { uri: selectedVideo?.video_url },
                });
              }}
            >
              <Ionicons name="play-circle-outline" size={22} color="#FF0050" />
              <Text style={styles.modalButtonText}>Voir la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push(
                  '/(protected)/(profile-setup)/uploadVideo?mode=edit'
                );
              }}
            >
              <Ionicons name="create-outline" size={22} color="#ddd" />
              <Text style={styles.modalButtonText}>Remplacer la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                console.log('delete video', selectedVideo);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF0050" />
              <Text style={styles.modalDeleteText}>Supprimer</Text>
            </Pressable>

            <Pressable
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },

  errorText: { color: '#888' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },

  headerButtons: {
    flexDirection: 'row',
    gap: 20,
  },

  profileCenter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FF0050',
  },

  avatarPlaceholder: {
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarInitial: {
    fontSize: 32,
    color: '#FF0050',
    fontWeight: '700',
  },

  centerName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 14,
  },

  centerLocation: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 6,
  },

  centerBio: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },

  sectionTitle: {
    color: '#FF0050',
    marginBottom: 12,
    fontWeight: '700',
  },

  videoContainer: {
    marginRight: 12,
  },

  secondaryVideo: {
    width: 100,
    height: 140,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoIcon: {
    color: '#FF0050',
    fontSize: 28,
  },

  addVideo: {
    width: 100,
    height: 140,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalButton: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 16,
  },

  modalButtonText: {
    color: '#ddd',
    fontSize: 17,
  },

  modalDeleteText: {
    color: '#FF0050',
    fontSize: 17,
  },

  modalCancel: {
    alignItems: 'center',
    marginTop: 10,
  },

  cancelText: {
    color: '#999',
  },
});