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
                        Bienvenue sur [NOM DU SERVICE]. En utilisant ce Service, vous 
                        acceptez les présentes Conditions Générales d’Utilisation (CGU).
                    </Text>

                    <Text style={styles.paragraph}>
                        1. Objet : Ces CGU régissent votre accès et votre utilisation de la plateforme.
                    </Text>

                    <Text style={styles.paragraph}>
                        2. Âge minimal : L’accès au Service est réservé aux personnes âgées de 18 ans ou plus. 
                        Toute personne mineure ne doit pas utiliser ce Service.
                    </Text>

                    <Text style={styles.paragraph}>
                        3. Inscription : Vous devez fournir des informations exactes et valides lors de la création de votre compte.
                    </Text>

                    <Text style={styles.paragraph}>
                        4. Données personnelles : Vos données sont traitées conformément au RGPD et à notre politique de confidentialité.
                    </Text>

                    <Text style={styles.paragraph}>
                        5. Obligations : Vous vous engagez à ne pas publier de contenu illégal, offensant ou trompeur, 
                        et à respecter les autres utilisateurs.
                    </Text>

                    <Text style={styles.paragraph}>
                        6. Contenu utilisateur : Vous êtes responsable de tout contenu que vous publiez. 
                        Le Service peut retirer tout contenu contraire aux CGU ou à la loi.
                    </Text>

                    <Text style={styles.paragraph}>
                        7. Responsabilité : Le Service est fourni "tel quel". Le Service ne garantit pas de mise en relation ni de résultats.
                    </Text>

                    <Text style={styles.paragraph}>
                        8. Sécurité : Vous êtes responsable de la confidentialité de vos identifiants.
                    </Text>

                    <Text style={styles.paragraph}>
                        9. Modification des CGU : Le Service peut modifier ces CGU à tout moment. 
                        L'utilisation continue vaut acceptation des nouvelles conditions.
                    </Text>

                    <Text style={styles.paragraph}>
                        10. Loi applicable : Ces CGU sont soumises au droit français.
                    </Text>

                    {/* Bouton Accepter */}
                    <TouchableOpacity style={styles.buttonAccept} onPress={accept}>
                        <Text style={styles.buttonText}>
                            J'accepte les conditions
                        </Text>
                    </TouchableOpacity>

                    {/* Bouton Refuser */}
                    <TouchableOpacity style={styles.buttonRefuse} onPress={refuse}>
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
        backgroundColor: "#000",
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
        color: "#fff", 
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 22,
        color: "#ccc",  
    },
    buttonAccept: {
        backgroundColor: "#FF0050", // bouton rose vif comme Register
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonRefuse: {
        backgroundColor: "#333",    // gris foncé pour Refuser
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});