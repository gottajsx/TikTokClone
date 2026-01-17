import { View, FlatList, Dimensions, ViewToken, StyleSheet, ActivityIndicator, Text } from 'react-native';
import PostListItem from "@/components/PostListItem";
import { useMemo, useRef, useState } from 'react';
import posts from "@assets/data/posts.json";

export default function HomeScreen() {
    const { height } = Dimensions.get('window');
    const [currentIndex, setCurrentIndex] = useState(0);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0]?.index || 0)
        }
    })

    console.log("currentIndex:", currentIndex);
    return(
        <View>
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