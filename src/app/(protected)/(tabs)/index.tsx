import { 
  View, 
  FlatList, 
  useWindowDimensions,
  ViewToken, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Redirect } from 'expo-router';
import VideoListItem from "@/components/VideoListItem";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import FeedTab from '@/components/GenericComponents/FeedTab';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyProfile } from '@/hooks/useProfile';
import { useMyPreferences } from '@/hooks/usePreferences';
import { useCompatibleVideos } from '@/hooks/useVideos';


const TABS = {
  EXPLORE: 'Explore',
  FOLLOWING: 'Following',
  FOR_YOU: 'For You'
};

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS.FOR_YOU);

  // ✅ TOUS les hooks appelés ici, avant tout return conditionnel
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: preferences, isLoading: prefsLoading } = useMyPreferences();
  const { videos, loading: videosLoading, error } = useCompatibleVideos();

  const itemHeight = height - insets.top - insets.bottom;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0]?.index ?? 0;
      setCurrentIndex(newIndex);
    }
  });


  // ✅ Debug
  console.log('=== DEBUG VIDEOS ===');
  console.log('loading:', videosLoading);
  console.log('error:', error);
  console.log('videos count:', videos?.length);
  console.log('videos data:', JSON.stringify(videos, null, 2));

  // ✅ Returns conditionnels APRÈS tous les hooks
  const isLoadingData = profileLoading || prefsLoading;

  if (isLoadingData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF0050" />
      </View>
    );
  }

  if (!profile?.gender) {
    return <Redirect href="/(protected)/(profile-setup)/gender?mode=onboarding" />;
  }

  if (!preferences || preferences.gender_preferences == null || preferences.gender_preferences.length === 0) {
    return <Redirect href="/(protected)/(profile-setup)/preferences?mode=onboarding" />;
  }

  if (videosLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF0050" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={styles.topBar}>
        <MaterialIcons name="live-tv" size={24} color="white" />
        <View style={styles.navigationBar}>
          <FeedTab title={TABS.EXPLORE} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOLLOWING} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOR_YOU} setActiveTab={setActiveTab} activeTab={activeTab} />
        </View>
        <Ionicons name="search" size={24} color="white" />
      </View>

      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <VideoListItem 
            videoItem={item} 
            isActive={index === currentIndex} 
            height={itemHeight}
          />
        )}
        keyExtractor={(item, index) => item.profile_id ?? index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 80}
        decelerationRate="fast"
        disableIntervalMomentum
        pagingEnabled
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
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