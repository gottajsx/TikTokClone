import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMatches, useDeleteMatch } from '@/hooks/useMatches';
import { Match } from '@/services/matchService';

export default function FriendsScreen() {
  const { matches, loading } = useMatches();
  const { mutate: deleteMatch } = useDeleteMatch();
  const router = useRouter();

  const handleUnmatch = (match: Match) => {
    Alert.alert(
      'Se dématcher ?',
      `Voulez-vous vraiment vous dématcher avec ${match.other_user.username} ? La conversation sera supprimée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Dématcher',
          style: 'destructive',
          onPress: () => deleteMatch(match.id),
        },
      ]
    );
  };

  const handleOpenChat = (match: Match) => {
    router.push({
      pathname: '/(protected)/conversation/[conversationId]',
      params: { conversationId: match.conversation_id },
    });
  };

  const renderItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleOpenChat(item)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {item.other_user.avatar_url ? (
          <Image source={{ uri: item.other_user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {item.other_user.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.heartBadge}>
          <Ionicons name="heart" size={12} color="#fff" />
        </View>
      </View>

      {/* Infos */}
      <View style={styles.matchInfo}>
        <Text style={styles.username}>@{item.other_user.username}</Text>
        <Text style={styles.matchDate}>
          Match le {new Date(item.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleOpenChat(item)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FF2D55" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleUnmatch(item)}>
          <Ionicons name="close-circle-outline" size={22} color="#aaa" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes matchs</Text>
        <Text style={styles.headerCount}>
          {matches.length} {matches.length > 1 ? 'matchs' : 'match'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF2D55" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={64} color="#ddd" />
          <Text style={styles.emptyTitle}>Pas encore de match</Text>
          <Text style={styles.emptySubtitle}>
            Continue d'explorer des profils pour trouver ton match ✨
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerCount: {
    fontSize: 14,
    color: '#aaa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  heartBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF2D55',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchInfo: {
    flex: 1,
    gap: 3,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  matchDate: {
    fontSize: 12,
    color: '#aaa',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageButton: {
    padding: 4,
  },
});
