import { View, FlatList, Dimensions, ViewToken, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import PostListItem from "@/components/PostListItem";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import FeedTab from '@/components/GenericComponents/FeedTab';
import { useVideoPlayer } from 'expo-video';
import { useRef, useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import posts from "@assets/data/posts.json";
import { useMyProfile } from '@/hooks/useProfile';
import { useMyPreferences } from '@/hooks/usePreferences';

const TABS = {
  EXPLORE: 'Explore',
  FOLLOWING: 'Following',
  FOR_YOU: 'For You'
};

export default function HomeScreen() {
  const { height } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS.FOR_YOU);

  // Chargement des données profil et préférences
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: preferences, isLoading: prefsLoading } = useMyPreferences();

  const isLoadingData = profileLoading || prefsLoading;

  // Redirections onboarding si incomplet
  if (isLoadingData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF0050" />
      </View>
    );
  }

  // Si gender manquant → OnboardingGender
  if (!profile?.gender) {
    return <Redirect href="/(protected)/(onboarding)/OnboardingGender" />;
  }

  // Si gender OK mais gender_preference manquant → OnboardingPreferencesGender
  if (!preferences?.gender_preference) {
    return <Redirect href="/(protected)/(onboarding)/OnboardingPreferencesGender" />;
  }

  // Player UNIQUE partagé pour TOUTE la FlatList
  const player = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = false; // ou true par défaut
  });

  // Ref pour éviter race conditions
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Change la source du player quand currentIndex change
  useEffect(() => {
    const currentPost = posts[currentIndex];
    if (currentPost?.video_url) {
      player.replaceAsync(currentPost.video_url).catch(err => {
        console.log('replaceAsync failed:', err);
      });
    }
  }, [currentIndex, player]);

  // Gestion globale play/pause quand le screen est focus/unfocus
  useFocusEffect(
    useCallback(() => {
      if (isMountedRef.current) {
        try {
          player.play();
        } catch (err) {
          console.log('Global play failed:', err);
        }
      }

      return () => {
        if (isMountedRef.current) {
          try {
            player.pause();
          } catch (err) {
            console.log('Global pause failed:', err);
          }
        }
      };
    }, [player])
  );

  // Listener erreurs player (correction : 'statusChange' au lieu de 'error')
  useEffect(() => {
    const sub = player.addListener('statusChange', (evt) => {
      if (evt?.error) {
        console.error('Player error:', evt.error);
      }
    });

    return () => sub.remove();
  }, [player]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0]?.index ?? 0;
      setCurrentIndex(newIndex);
    }
  });

  console.log("currentIndex:", currentIndex);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Barre supérieure */}
      <View style={styles.topBar}>
        <MaterialIcons name="live-tv" size={24} color="white" />
        <View style={styles.navigationBar}>
          <FeedTab title={TABS.EXPLORE} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOLLOWING} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOR_YOU} setActiveTab={setActiveTab} activeTab={activeTab} />
        </View>
        <Ionicons name="search" size={24} color="white" />
      </View>

      {/* FlatList optimisée */}
      <FlatList
        data={posts}
        renderItem={({ item, index }) => (
          <PostListItem postItem={item} isActive={index === currentIndex} />
        )}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 80}
        decelerationRate="fast"
        disableIntervalMomentum
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationBar: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 30,
  },
});