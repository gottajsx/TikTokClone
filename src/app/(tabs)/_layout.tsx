import { Tabs } from "expo-router";

export default function TabsLayout() {
    return(
        <Tabs>
            <Tabs.Screen 
                name='index' 
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