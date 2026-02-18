import { useAuthStore } from "@/stores/useAuthStore";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);   
    const [isLoading, setLoading] = useState(false);

    const acceptedTerms = useAuthStore((state) => state.acceptedTerms);
    const setAcceptedTerms = useAuthStore((state) => state.setAcceptedTerms);

    const register = useAuthStore((state) => state.register);

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleRegister = async () => {
        if (!acceptedTerms) {
            Alert.alert(
                "Conditions requises",
                "Vous devez accepter les conditions d’utilisation pour continuer."
            );
            return;
        }

        if (!email || !password || !username) {
            Alert.alert('Error', 'Please fill in all the fields');
            return;
        };

        if (!birthDate) {
            Alert.alert(
                "Date de naissance requise",
                "Veuillez sélectionner votre date de naissance."
            );
            return;
        }

        const age = calculateAge(birthDate);
        if (age < 18) {
            router.replace("/underage");
            return;
        }        

        try {
            setLoading(true);
            await register(email, password, username);
            Alert.alert("Succès", "Compte créé !");
        } catch (error) {
            Alert.alert('Error', 'Register failed. Please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
         <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >   
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>


                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* DATE DE NAISSANCE */}
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={{ color: birthDate ? "#000" : "#666" }}>
                        {birthDate
                            ? birthDate.toLocaleDateString()
                            : "Select your birth date"}
                    </Text>
                </TouchableOpacity>
                
                {showPicker && (
                    <DateTimePicker
                        value={birthDate || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowPicker(Platform.OS === "ios");
                            if (selectedDate) setBirthDate(selectedDate);
                        }}
                    />
                )}


                {/* CGU */}
                <View style={styles.termsContainer}>
                    <Switch
                        value={acceptedTerms}
                        onValueChange={setAcceptedTerms}
                    />
                    <Text style={styles.termsText}>
                        J’accepte les{" "}
                        <Link href="/terms">
                            <Text style={styles.linkText}> conditions d’utilisation</Text>
                        </Link>
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[styles.button, (!acceptedTerms || isLoading) && { opacity: 0.5 }]}
                    onPress={handleRegister}
                     disabled={!acceptedTerms || isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>
                

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1,  justifyContent: 'center', },
    container: {
        justifyContent: 'center',
        paddingHorizontal: 25
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 45
    },
    input: {
        backgroundColor: "#1a1a1a",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333'
    },
    button: {
        backgroundColor: '#FF0050',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25
    },
    footerText: {
        color: '#999',
        fontSize: 15
    },
    linkText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15
    },
        termsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
    },

    termsText: {
        marginLeft: 10,
        // color: "#333",
        color: "#999",
        flex: 1,
        flexWrap: "wrap",
    },
});