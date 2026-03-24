import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Switch,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get("window");

type VideoItem = {
  id: number;
  uri: string;
  thumbnail: string;
};

export default function ProfileScreen() {
  const router = useRouter();

  const [avatar, setAvatar] = useState(
    "https://randomuser.me/api/portraits/women/44.jpg"
  );
  const [showAge, setShowAge] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const secondaryVideos: VideoItem[] = [
    {
      id: 1,
      uri: "",
      thumbnail: "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png",
    },
    {
      id: 2,
      uri: "",
      thumbnail: "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>

          <View style={styles.headerButtons}>
            {/* Bouton Modifier le profil */}
            <TouchableOpacity 
              onPress={() => router.push('/(protected)/edit-profile')}   // ← adapte le chemin si besoin
              style={styles.iconButton}
            >
              <Ionicons name="create-outline" size={26} color="#FF0050" />
            </TouchableOpacity>

            {/* Bouton Paramètres */}
            <TouchableOpacity 
              onPress={() => router.push("/(protected)/(profile-setup)/settings")}
              style={styles.iconButton}
            >
              <Ionicons name="settings-outline" size={26} color="#FF0050" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.changeAvatarText}>Changer la photo</Text>
          </TouchableOpacity>
        </View>

        {/* INFOS */}
        <View style={styles.section}>
          <Text style={styles.name}>
            Emma {showAge && ", 27"}
          </Text>
          {showLocation && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#999" />
              <Text style={styles.info}>Paris</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="heart-outline" size={18} color="#999" />
            <Text style={styles.info}>Relation sérieuse</Text>
          </View>
        </View>

        {/* VIDEOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes vidéos</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoScroll}
          >
            {secondaryVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() => {
                  setSelectedVideo(video);
                  setModalVisible(true);
                }}
                style={styles.videoContainer}
              >
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.secondaryVideo}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addVideo}>
              <Ionicons name="add" size={36} color="#666" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* CONFIDENTIALITÉ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="calendar-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Afficher mon âge</Text>
            </View>
            <Switch
              value={showAge}
              onValueChange={setShowAge}
              trackColor={{ false: '#333', true: '#FF0050' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="location-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Afficher ma ville</Text>
            </View>
            <Switch
              value={showLocation}
              onValueChange={setShowLocation}
              trackColor={{ false: '#333', true: '#FF0050' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* BIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bio}>
            Passionnée de voyage et de cinéma ✨
          </Text>
        </View>

        {/* CENTRES D'INTÉRÊT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d’intérêt</Text>
          <Text style={styles.tags}>
            Voyage • Sport • Musique • Food
          </Text>
        </View>

        {/* PREVIEW */}
        <TouchableOpacity style={styles.previewButton}>
          <Ionicons name="eye-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.previewText}>
            Voir mon profil comme les autres
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* MODAL VIDÉO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                if (!selectedVideo) return;
                setModalVisible(false);
                router.push({
                  pathname: "/video-preview",
                  params: { uri: selectedVideo.uri },
                });
              }}
            >
              <Ionicons name="play-circle-outline" size={22} color="#FF0050" />
              <Text style={styles.modalButtonText}>Voir la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="create-outline" size={22} color="#ddd" />
              <Text style={styles.modalButtonText}>Remplacer la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  iconButton: {
    padding: 4,
  },

  avatarSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FF0050',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 12,
    gap: 8,
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF0050',
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  info: {
    fontSize: 15,
    color: '#aaa',
  },
  videoScroll: {
    paddingRight: 20,
  },
  videoContainer: {
    marginRight: 12,
  },
  secondaryVideo: {
    width: 100,
    height: 140,
    borderRadius: 12,
  },
  addVideo: {
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowText: {
    fontSize: 16,
    color: '#ddd',
  },
  bio: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  tags: {
    fontSize: 15,
    color: '#aaa',
  },
  previewButton: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  previewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
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
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});