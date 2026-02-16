import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";

export default function Terms() {
    const acceptTerms = () => {
        router.replace({
            pathname: "/register",
            params: { accepted: "true" },
        });
    };

    return(
        <>
            <Stack.Screen options={{ title: "Conditions d'utilisation" }} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>
                    Conditions Générales d’Utilisation
                </Text>

                <Text style={styles.paragraph}>
                    Ici tu mets toutes tes CGU complètes…
                </Text>

                <TouchableOpacity style={styles.button} onPress={acceptTerms}>
                    <Text style={styles.buttonText}>
                        J'accepte les conditions
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
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