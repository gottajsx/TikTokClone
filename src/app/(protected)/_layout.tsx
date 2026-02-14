import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";


export default function ProtectedLayout() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthStore();

  // 🔐 Initialisation de la session
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!isAuthenticated) return null; // on attend la redirection

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
      <Stack.Screen
        name="postComments/[id]"
        options={{ title: "Comments", headerBackButtonDisplayMode: "minimal" }}
      />
    </Stack>
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