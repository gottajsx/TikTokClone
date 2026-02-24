import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import { 
    Text, 
    View, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    KeyboardAvoidingView, 
    Platform,
    Switch,
    Pressable,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);   
    const [isLoading, setLoading] = useState(false);

    const { acceptedTerms, setAcceptedTerms, register } = useAuthStore();

    const formatDate = useCallback((date: Date) => {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(date);
    }, []);

    const calculateAge = useCallback((birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },  []);

    const isFormValid = email && password.length >= 6 && username.length >= 3 && birthDate && acceptedTerms;

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async () => {
        if (!acceptedTerms) {
            Alert.alert(
                "Conditions requises",
                "Vous devez accepter les conditions d’utilisation pour continuer."
            );
            return;
        }

        if (!email || !password || !username || !birthDate) {
            Alert.alert("Champs incomplets", "Veuillez remplir tous les champs.");
            return;
        };

        if (!validateEmail(email)) {
            Alert.alert("Email invalide", "Veuillez entrer un email valide.");
            return;
        };

        if (password.length < 6) {
            Alert.alert("Mot de passe trop court", "Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }   
        
        if (username.length < 3) {
            Alert.alert("Pseudo trop court", "Le pseudo doit contenir au moins 3 caractères.");
            return;
        }


        const age = calculateAge(birthDate);
        if (age < 18) {
            router.replace("/underage");
            return;
        }        

        try {
            setLoading(true);
            await register(email.trim(), password, username, birthDate);
            router.replace("/(protected)");
        } catch (error: any) {
            Alert.alert("Erreur d'inscription", error.message || "L'inscription a échoué. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === "ios"); // iOS garde le picker ouvert, Android le ferme
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>Inscrivez-vous pour commencer</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Pseudo (minimum 3 caractères)"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe (minimum 6 caractères)"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        {/* Sélecteur de date */}
                        <TouchableOpacity
                            style={[
                                styles.input,
                                birthDate && { borderColor: "#FF0050", borderWidth: 1.5 },
                            ]}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text style={{ color: birthDate ? "#fff" : "#666", fontSize: 16 }}>
                                {birthDate ? formatDate(birthDate) : "Date de naissance"}
                            </Text>
                        </TouchableOpacity>

                        {showPicker && (
                        <DateTimePicker
                            value={birthDate || new Date(2000, 0, 1)}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            maximumDate={new Date()}
                            onChange={onDateChange}
                        />
                        )}

                        {/* Conditions d'utilisation */}
                        <View style={styles.termsContainer}>
                            <Switch
                                value={acceptedTerms}
                                onValueChange={setAcceptedTerms}
                                trackColor={{ false: "#333", true: "#FF0050" }}
                                thumbColor={acceptedTerms ? "#fff" : "#888"}
                            />
                            <View style={styles.termsTextContainer}>
                                <Text style={styles.termsText}>J’accepte les </Text>
                                <Pressable onPress={() => router.push("/terms")}>
                                <Text style={styles.linkText}>conditions d’utilisation</Text>
                                </Pressable>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!isFormValid || isLoading) && styles.buttonDisabled,
                            ]}
                            onPress={handleRegister}
                            disabled={!isFormValid || isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Création en cours..." : "Créer mon compte"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Déjà un compte ? </Text>
                        <Pressable onPress={() => router.push("/login")}>
                            {({ pressed }) => (
                                <Text style={[styles.linkText, pressed && { opacity: 0.7 }]}>
                                    Se connecter
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#FF0050",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#444",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    color: "#999",
    fontSize: 15,
  },
  linkText: {
    color: "#FF0050",
    fontWeight: "700",
    fontSize: 15,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  termsTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginLeft: 12,
  },
  termsText: {
    color: "#aaa",
    fontSize: 15,
  },
});

