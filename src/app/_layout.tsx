import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
    
    const myTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: 'white',
        },
    };

    const { loading, init } = useAuthStore();

    useEffect(() => {
        init(); // 🔹 Initialise la session une seule fois
    }, []);

    if (loading) {
        return (
             <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#fff" />
             </View>
        );
    }

    return (
        <ThemeProvider value={myTheme}>
            <QueryClientProvider client={queryClient}>
                <Stack screenOptions={{ headerShown: false }} />
            </QueryClientProvider>
        </ThemeProvider>      
    );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});