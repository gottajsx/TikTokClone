import React, { useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal, 
  Pressable,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoItem } from "@/types/types";
import { useRouter } from "expo-router";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    const secondaryVideos = [
        { 
            id: 1, 
            uri: "",
            thumbnail: "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png" 
        },
        { 
            id: 2, 
            uri: "",
            thumbnail: "https://help.apple.com/assets/68FABD5B6EF504342600E3E5/68FABD675A41CCC23909151C/fr_FR/0558178651a7ca59d510aa456088da59.png" 
        },
    ];

    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mon Profil</Text>
                    <TouchableOpacity onPress={() => router.push("/settings")}>
                            <Text style={styles.settings}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* VIDEO PRINCIPALE */}
                <View style={styles.videoContainer}>
                    <Video
                        source={{
                            uri: "https://www.w3schools.com/html/mov_bbb.mp4",  
                        }}
                        style={styles.video}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        isLooping
                    />
                </View>

                {/* INFOS */}
                <View style={styles.section}>
                    <Text style={styles.name}>Emma, 27</Text>
                    <Text style={styles.info}>📍 Paris</Text>
                    <Text style={styles.info}>❤️ Relation sérieuse</Text>
                </View>

                {/* BIO */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bio</Text>
                    <Text style={styles.bio}>
                        Passionnée de voyage et de cinéma ✨
                    </Text>
                </View>

                {/* VIDEOS SECONDAIRES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes vidéos</Text>
                        
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

                        {/* Bouton ajouter */}
                        <TouchableOpacity style={styles.addVideo}>
                            <Text style={{ fontSize: 28 }}>＋</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* CENTRE D'INTERET */}
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

            {/* MODAL ACTIONS VIDEO SECONDAIRE */}
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
                            // ouvrir caméra / galerie
                        }}
                    >
                        <Text>✏️ Remplacer la vidéo</Text>
                    </Pressable>

                    <Pressable
                        style={styles.modalButton}
                        onPress={() => {
                            setModalVisible(false);
                            // supprimer la video (DB)
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
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
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
    videoContainer: {
        width: width,
        height: height * 0.4,
        backgroundColor: "black",
    },
    video: {
        width: "100%",
        height: "100%",
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
    },
    info: {
        fontSize: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
    },
    bio: {
        fontSize: 14,
        color: "#444",
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