import { View, FlatList, Dimensions, ViewToken, StyleSheet } from 'react-native';
import PostListItem from "@/components/PostListItem";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import FeedTab from '@/components/GenericComponents/FeedTab';
import { useVideoPlayer, VideoPlayer } from 'expo-video';
import { useRef, useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import posts from "@assets/data/posts.json";

const TABS = {
  EXPLORE: 'Explore',
  FOLLOWING: 'Following',
  FOR_YOU: 'For You'
};

export default function HomeScreen() {
    const { height } = Dimensions.get('window');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(TABS.FOR_YOU);

    // Player UNIQUE partagé pour TOUTE la FlatList
    const player = useVideoPlayer(null, (p) => {
        p.loop = true;
        p.muted = false; // ou true par défaut
    });

    // Ref pour éviter race conditions
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Change la source du player quand currentIndex change
    useEffect(() => {
        const currentPost = posts[currentIndex];
        if (currentPost?.video_url) {
        player.replace(currentPost.video_url);
        // Optionnel : preload la suivante si tu veux
        // if (currentIndex + 1 < posts.length) player.replace(posts[currentIndex + 1].video_url, { preload: true });
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

    // Listener erreurs player (très utile pour debug)
    useEffect(() => {
        const sub = player.addListener('statusChange', (status) => {
            if (status.error) {
                console.log("Video error:", status.error);
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
    return(
        <View>
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
                data={posts}
                renderItem={({ item, index }) => (
                    <PostListItem postItem={item} isActive={index === currentIndex} />
                )}
                showsVerticalScrollIndicator={false}
                snapToInterval={height - 80}
                decelerationRate={"fast"}
                disableIntervalMomentum
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 30
  },
  topBar: {
    flexDirection: 'row',
    position: 'absolute',
    top: 70,
    zIndex: 1,
    paddingHorizontal: 15
  }
});