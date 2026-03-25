import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { useConversationInfo, useMessages, useSendMessage } from '@/hooks/useChat';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Message } from '@/services/chatService';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { conversationInfo, loading: infoLoading } = useConversationInfo(conversationId);
  const { messages, loading: messagesLoading } = useMessages(conversationId);
  const { mutate: send, isPending: sending } = useSendMessage(conversationId);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;
    setInputText('');
    send(trimmed);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender_id === user?.id;
    const isTemp = item.id.startsWith('temp-');
    const prevMessage = messages[index - 1];
    const showAvatar = !isMe && (!prevMessage || prevMessage.sender_id !== item.sender_id);

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {/* Avatar de l'autre user — affiché seulement sur le 1er message d'un groupe */}
        {!isMe && (
          <View style={styles.avatarSlot}>
            {showAvatar && (
              conversationInfo?.other_user.avatar_url ? (
                <Image
                  source={{ uri: conversationInfo.other_user.avatar_url }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={styles.messageAvatarFallback}>
                  <Text style={styles.messageAvatarText}>
                    {conversationInfo?.other_user.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.content}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
              {new Date(item.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isMe && (
              <Ionicons
                name={isTemp ? 'time-outline' : item.is_read ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={item.is_read ? '#fff' : 'rgba(255,255,255,0.6)'}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const isLoading = infoLoading || messagesLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>

        {conversationInfo ? (
          <View style={styles.headerUser}>
            {conversationInfo.other_user.avatar_url ? (
              <Image
                source={{ uri: conversationInfo.other_user.avatar_url }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarText}>
                  {conversationInfo.other_user.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.headerUsername}>
              @{conversationInfo.other_user.username}
            </Text>
          </View>
        ) : (
          <View style={styles.headerUser} />
        )}

        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF2D55" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="heart" size={40} color="#FF2D55" />
              <Text style={styles.emptyChatText}>
                C'est un match ! Dis bonjour à{' '}
                <Text style={{ fontWeight: '700' }}>
                  @{conversationInfo?.other_user.username}
                </Text>{' '}
                👋
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écris un message..."
            placeholderTextColor="#aaa"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 6,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyChatText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  avatarSlot: {
    width: 28,
    height: 28,
    marginRight: 6,
    marginBottom: 2,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: '#FF2D55',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#fff',
  },
  bubbleTextThem: {
    color: '#111',
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  bubbleTimeThem: {
    color: '#aaa',
  },
  readIcon: {
    marginLeft: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    color: '#111',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ffb3c1',
  },
});
