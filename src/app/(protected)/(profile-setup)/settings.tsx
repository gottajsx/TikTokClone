import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Switch,
    Alert, 
    ScrollView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from '@/stores/useAuthStore';
import { router} from "expo-router";

export default function SettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [messages, setMessages] = useState(true);

    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Deconnexion', 'Vous êtes maintenant déconnecté');
        } catch(err) {
            console.log("Erreur lors de la deconnexion", err);
            Alert.alert("Erreur", "Impossible de se déconnecter pour le moment");
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            "Se deconnecter",
            "Es-tu sûr de vouloir te deconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Se déconnecter", style: "destructive", onPress: handleLogout },
            ]
        )
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            "Supprimer le compte",
            "Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                        // supprimer compte database
                    },
                },
            ]
        );
    };

    
    return(
       <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                         <Text style={styles.back}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>  Paramètres</Text>

                </View>

                <View style={styles.section}>
                <TouchableOpacity
                    style={styles.settingRow}
                >
                    <Text style={styles.settingTextBold}>Préférences</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                </View>

                

                {/* NOTIFICATIONS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    
                    <View style={styles.row}>
                        <Text>Matches</Text>
                        <Switch value={notifications} onValueChange={setNotifications} />
                    </View>

                    <View style={styles.row}>
                        <Text>Messages</Text>
                        <Switch value={messages} onValueChange={setMessages} />
                    </View>
                </View> 

                {/* CONFIDENTIALITE */} 
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Confidentialité</Text>
                    <TouchableOpacity style={styles.row}>
                        <Text>Profil visible</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text>Mode incognito</Text>
                    </TouchableOpacity>
                </View>     

                {/* SÉCURITÉ */}  
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sécurité</Text>
                    <TouchableOpacity style={styles.row}>
                        <Text>Changer mot de passe</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.row}>
                        <Text>Compte vérifié</Text>
                    </TouchableOpacity> */}
                </View>  

                {/* AIDE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity style={styles.row}>
                        <Text>Aide & FAQ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text>Signaler un problème</Text>
                    </TouchableOpacity>
                </View>

                {/* ACTIONS COMPTE */}
                 <View style={styles.dangerZone}>
                    <TouchableOpacity onPress={confirmLogout}>
                        <Text style={styles.logout}>🚪 Se déconnecter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmDeleteAccount}>
                        <Text style={styles.delete}>🗑 Supprimer le compte</Text>
                    </TouchableOpacity>
                 </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    back: {
        fontSize: 20,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
    },
    dangerZone: {
        marginTop: 40,
        borderTopWidth: 1,
        borderColor: "#eee",
        paddingTop: 20,
    },
    logout: {
        color: "#000",
        fontWeight: "bold",
        marginBottom: 16,
    },
    delete: {
        color: "red",
        fontWeight: "bold",
    },
    settingRow: {
    fontSize: 16,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    //paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  settingText: {
    fontSize: 16,
  },
  settingTextBold: {
    fontSize: 16,
    fontWeight: "600", // ou "bold"
  },
  chevron: {
    fontSize: 20,
    color: "#999",
  },
    });