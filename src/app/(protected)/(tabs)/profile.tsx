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
      thumbnail:
        "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png",
    },
    {
      id: 2,
      uri: "",
      thumbnail:
        "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <TouchableOpacity onPress={() => router.push("/(protected)/(profile-setup)/settings")}>
            <Text style={styles.settings}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <Image source={{ uri: avatar }} style={styles.avatar} />

          <TouchableOpacity
            onPress={() => {
              // ouvrir galerie
            }}
          >
            <Text style={styles.changeAvatar}>✏️ Changer la photo</Text>
          </TouchableOpacity>
        </View>

        {/* INFOS */}
        <View style={styles.section}>
          <Text style={styles.name}>
            Emma {showAge && ", 27"}
          </Text>

          {showLocation && (
            <Text style={styles.info}>📍 Paris</Text>
          )}

          <Text style={styles.info}>❤️ Relation sérieuse</Text>
        </View>

        {/* VIDEOS SECONDAIRES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes vidéos</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {secondaryVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() => {
                  setSelectedVideo(video);
                  setModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.secondaryVideo}
                />
              </TouchableOpacity>
            ))}

            {/* bouton ajouter */}
            <TouchableOpacity style={styles.addVideo}>
              <Text style={{ fontSize: 30 }}>＋</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* CONFIDENTIALITE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>

          <View style={styles.row}>
            <Text>Afficher mon âge</Text>
            <Switch value={showAge} onValueChange={setShowAge} />
          </View>

          <View style={styles.row}>
            <Text>Afficher ma ville</Text>
            <Switch value={showLocation} onValueChange={setShowLocation} />
          </View>
        </View>

        {/* BIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bio}>
            Passionnée de voyage et de cinéma ✨
          </Text>
        </View>

        {/* INTERETS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d’intérêt</Text>
          <Text style={styles.tags}>
            Voyage • Sport • Musique • Food
          </Text>
        </View>

        {/* PREVIEW */}
        <TouchableOpacity style={styles.previewButton}>
          <Text style={styles.previewText}>
            👁 Voir mon profil comme les autres
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

      </ScrollView>

      {/* MODAL VIDEO */}
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
              <Text>▶️ Voir la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text>✏️ Remplacer la vidéo</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={{ color: "red" }}>🗑 Supprimer</Text>
            </Pressable>

            <Pressable
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text>Annuler</Text>
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
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  settings: {
    fontSize: 22,
  },

  avatarSection: {
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#000",
  },

  changeAvatar: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  secondaryVideo: {
    width: 100,
    height: 140,
    borderRadius: 10,
    marginRight: 10,
  },

  addVideo: {
    width: 100,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  bio: {
    fontSize: 14,
    color: "#444",
  },

  tags: {
    fontSize: 14,
    color: "#666",
  },

  previewButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    margin: 16,
  },

  previewText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalButton: {
    paddingVertical: 14,
  },

  modalCancel: {
    paddingVertical: 14,
    alignItems: "center",
  },

});