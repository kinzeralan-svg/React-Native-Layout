import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !email || !password || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (!agreed) {
      Alert.alert("Error", "Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);
    const result = await register(firstName.trim(), email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/verify-email", params: { email: email.trim().toLowerCase() } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>

          <View style={styles.logoRow}>
            <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.logoBox}>
              <Ionicons name="wallet" size={28} color={Colors.white} />
            </LinearGradient>
            <View>
              <Text style={styles.brand}>the wellness{"\n"}wallet</Text>
            </View>
          </View>

          <Text style={styles.title}>Create Your Account</Text>

          <View style={styles.form}>
            <Field label="First Name" value={firstName} onChangeText={setFirstName} placeholder="First Name" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={Colors.medGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.medGray} />
                </Pressable>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.medGray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                  <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={Colors.medGray} />
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable style={styles.termsRow} onPress={() => setAgreed(v => !v)}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={14} color={Colors.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.btnGradient}>
              <Text style={styles.primaryBtnText}>{loading ? "Creating..." : "Sign Up"}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.switchRow} onPress={() => router.push("/sign-in")}>
            <Text style={styles.switchText}>Already have an account?</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.outlineBtnText}>Sign In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType = "default",
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.medGray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginTop: 12, marginBottom: 24, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  logoBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  brand: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text.primary, lineHeight: 22 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 24 },
  form: { gap: 14, marginBottom: 20 },
  fieldGroup: { gap: 6 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text.secondary },
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 12 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: Colors.teal, alignItems: "center", justifyContent: "center",
  },
  checkboxActive: { backgroundColor: Colors.teal },
  termsText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text.secondary, flex: 1 },
  termsLink: { color: Colors.teal, fontFamily: "Inter_600SemiBold" },
  primaryBtn: { borderRadius: 26, overflow: "hidden", marginBottom: 20 },
  btnGradient: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  switchRow: { alignItems: "center", marginBottom: 12 },
  switchText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text.secondary },
  outlineBtn: {
    height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.teal,
    alignItems: "center", justifyContent: "center",
  },
  outlineBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.teal },
});
