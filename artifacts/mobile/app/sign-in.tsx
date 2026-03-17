import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (result.needsVerification) {
      router.replace({ pathname: "/verify-email", params: { email: email.trim().toLowerCase() } });
    } else if (result.needsWalletSetup) {
      router.replace("/setup-wallet");
    } else {
      router.replace("/(tabs)");
    }
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

          <Text style={styles.title}>Sign In</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Your account email"
                placeholderTextColor={Colors.medGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Enter your secure password"
                  placeholderTextColor={Colors.medGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.medGray} />
                </Pressable>
              </View>
              <Pressable style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.btnGradient}>
              <Text style={styles.primaryBtnText}>{loading ? "Signing In..." : "Sign In"}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <SocialBtn icon={<AntDesign name="google" size={22} color="#EA4335" />} />
            <SocialBtn icon={<AntDesign name="apple1" size={22} color="#000" />} />
            <SocialBtn icon={<AntDesign name="facebook-square" size={22} color="#1877F2" />} />
          </View>

          <Pressable style={styles.switchRow} onPress={() => router.push("/sign-up")}>
            <Text style={styles.switchText}>Don't have an account?</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/sign-up")}
          >
            <Text style={styles.outlineBtnText}>Sign Up</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.7 }]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginTop: 12, marginBottom: 24, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  logoBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  brand: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text.primary, lineHeight: 22 },
  title: { fontFamily: "Inter_700Bold", fontSize: 30, color: Colors.text.primary, marginBottom: 28 },
  form: { gap: 16, marginBottom: 24 },
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
  forgotBtn: { alignSelf: "flex-end", marginTop: 6 },
  forgotText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.teal },
  primaryBtn: { borderRadius: 26, overflow: "hidden", marginBottom: 24 },
  btnGradient: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border.light },
  dividerText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.medGray },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 32 },
  socialBtn: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.background.card,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border.light,
  },
  switchRow: { alignItems: "center", marginBottom: 12 },
  switchText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text.secondary },
  outlineBtn: {
    height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.teal,
    alignItems: "center", justifyContent: "center",
  },
  outlineBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.teal },
});
