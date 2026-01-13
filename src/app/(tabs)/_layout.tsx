import { Tabs } from "expo-router";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
    return(
        <Tabs>
            <Tabs.Screen 
                name='index' 
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Entypo name="home" size={24} color={color} />
                    )
                }}
            />
             <Tabs.Screen 
                name='friends' 
            />
            <Tabs.Screen 
                name='newPost' 
            />
            <Tabs.Screen 
                name='inbox' 
            />
            <Tabs.Screen 
                name='profile' 
            />
        </Tabs>
    )
};