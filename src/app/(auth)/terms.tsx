import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Terms() {
    const setAcceptedTerms = useAuthStore((state) => state.setAcceptedTerms);

    const accept = () => {
        setAcceptedTerms(true);
        router.back();
    };

    const refuse = () => {
        setAcceptedTerms(false);
        router.back();
    }

    return(
        <>
            <Stack.Screen options={{ title: "Conditions d'utilisation" }} />

            <SafeAreaView style={styles.safe}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>
                        Conditions Générales d’Utilisation
                    </Text>

                    <Text style={styles.paragraph}>
                        Ici tu mets toutes tes CGU complètes…
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={accept}>
                        <Text style={styles.buttonText}>
                            J'accepte les conditions
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: "#888", marginTop: 10 }]}
                        onPress={refuse}
                    >
                        <Text style={styles.buttonText}>
                            Je refuse
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flexGrow: 1,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});