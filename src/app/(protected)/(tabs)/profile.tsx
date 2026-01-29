import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ProfileScreen() {
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

    
    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f2f2f2',
    },
    button: {
        width: '100%',            // prend toute la largeur
        paddingVertical: 15,
        backgroundColor: '#ff3b30', // rouge "déconnexion"
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});