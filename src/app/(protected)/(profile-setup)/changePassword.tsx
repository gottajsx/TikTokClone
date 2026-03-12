import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsChangePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async () => {
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError(null);

    // 🔐 Supabase (à brancher)
    /*
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }
    */

    Alert.alert("Succès", "Mot de passe mis à jour");

    // 🔁 Redirection vers /settings
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Changer le mot de passe</Text>

        {/* NOUVEAU MOT DE PASSE */}
        <Text style={styles.label}>Nouveau mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        {/* CONFIRMATION */}
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={[
            styles.input,
            confirmPassword.length > 0 &&
              password !== confirmPassword &&
              styles.inputError,
          ]}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
        />

        {/* ERREUR */}
        {confirmPassword.length > 0 && password !== confirmPassword && (
           <Text style={styles.error}>
              Les mots de passe ne correspondent pas
           </Text>
        )}

        {/* BOUTON */}
        <TouchableOpacity
          style={[
            styles.button,
            !passwordsMatch && styles.buttonDisabled,
          ]}
          disabled={!passwordsMatch}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Mettre à jour</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});