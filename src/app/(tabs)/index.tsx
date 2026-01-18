import { View, FlatList, Dimensions, ViewToken, StyleSheet, ActivityIndicator, Text } from 'react-native';
import PostListItem from "@/components/PostListItem";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import FeedTab from '@/components/GenericComponents/FeedTab';
import { useMemo, useRef, useState } from 'react';
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

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0]?.index || 0)
        }
    })

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