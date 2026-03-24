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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [messages, setMessages] = useState(true);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Déconnexion', 'Vous êtes maintenant déconnecté');
    } catch (err) {
      console.log('Erreur lors de la déconnexion', err);
      Alert.alert('Erreur', 'Impossible de se déconnecter pour le moment');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Se déconnecter',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Action', 'Fonctionnalité en cours de développement');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#FF0050" />
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        {/* PRÉFÉRENCES */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.rowContent}>
              <Ionicons name="options-outline" size={24} color="#FF0050" />
              <Text style={styles.settingTextBold}>Préférences</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="heart-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Matches</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#333', true: '#FF0050' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="chatbubble-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Messages</Text>
            </View>
            <Switch
              value={messages}
              onValueChange={setMessages}
              trackColor={{ false: '#333', true: '#FF0050' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* CONFIDENTIALITÉ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="eye-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Profil visible</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="eye-off-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Mode incognito</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SÉCURITÉ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Changer mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="help-circle-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Aide & FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowContent}>
              <Ionicons name="flag-outline" size={24} color="#ddd" />
              <Text style={styles.rowText}>Signaler un problème</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* ZONE DANGER */}
        <View style={styles.dangerZone}>
          <TouchableOpacity onPress={confirmLogout} style={styles.dangerRow}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={styles.logout}>Se déconnecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={confirmDeleteAccount} style={styles.dangerRow}>
            <Ionicons name="trash-outline" size={24} color="#FF0050" />
            <Text style={styles.delete}>Supprimer le compte</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF0050',
    marginBottom: 12,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingTextBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dangerZone: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#330000',
    paddingTop: 20,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  logout: {
    color: '#ddd',
    fontSize: 17,
    fontWeight: '600',
  },
  delete: {
    color: '#FF0050',
    fontSize: 17,
    fontWeight: '600',
  },
});