import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyEmail, resendCode } = useAuth();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = [
    useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null),
    useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null),
  ];

  const handleChange = (val: string, idx: number) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[idx] = cleaned;
    setCode(newCode);
    if (cleaned && idx < 5) {
      refs[idx + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    const result = await verifyEmail(email || "", fullCode);
    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error);
      setCode(["", "", "", "", "", ""]);
      refs[0].current?.focus();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (result.needsWalletSetup) {
      router.replace("/setup-wallet");
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleResend = async () => {
    await resendCode(email || "");
    Alert.alert("Code Sent", "A new verification code has been sent to your email");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.push("/sign-in")}>
        <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
      </Pressable>

      <View style={styles.logoRow}>
        <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.logoBox}>
          <Ionicons name="wallet" size={28} color={Colors.white} />
        </LinearGradient>
        <Text style={styles.brand}>the wellness{"\n"}wallet</Text>
      </View>

      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>A verification code has been sent to your email</Text>

      <View style={styles.codeRow}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={refs[idx]}
            style={[styles.codeInput, digit && styles.codeInputFilled]}
            value={digit}
            onChangeText={(v) => handleChange(v, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.btnGradient}>
          <Text style={styles.primaryBtnText}>{loading ? "Verifying..." : "Verify"}</Text>
        </LinearGradient>
      </Pressable>

      <Pressable style={styles.resendBtn} onPress={handleResend}>
        <Text style={styles.resendText}>Resend Code</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.outlineBtn, { marginTop: 24 }, pressed && { opacity: 0.8 }]}
        onPress={() => router.push("/sign-in")}
      >
        <Text style={styles.outlineBtnText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen, paddingHorizontal: 24 },
  backBtn: { marginTop: 12, marginBottom: 24, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  logoBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  brand: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text.primary, lineHeight: 22 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 10 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text.secondary, marginBottom: 40, lineHeight: 22 },
  codeRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 40 },
  codeInput: {
    width: 46, height: 56, borderRadius: 12,
    backgroundColor: Colors.background.input,
    borderWidth: 1.5, borderColor: Colors.border.medium,
    textAlign: "center",
    fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text.primary,
  },
  codeInputFilled: { borderColor: Colors.teal, backgroundColor: "rgba(78,205,196,0.08)" },
  primaryBtn: { borderRadius: 26, overflow: "hidden", marginBottom: 16 },
  btnGradient: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  resendBtn: { alignItems: "center", paddingVertical: 10 },
  resendText: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text.secondary },
  outlineBtn: {
    height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.border.medium,
    alignItems: "center", justifyContent: "center",
  },
  outlineBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text.secondary },
});
