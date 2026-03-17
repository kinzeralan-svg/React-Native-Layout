import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { apiDelete } from "@/lib/api";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const updates: any = {};
    if (firstName !== user?.firstName) updates.firstName = firstName;
    if (email !== user?.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      Alert.alert("No changes", "Nothing to update");
      return;
    }

    setLoading(true);
    const result = await updateUser(updates);
    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            await apiDelete("/user/delete");
            await logout();
            router.replace("/welcome");
          },
        },
      ]
    );
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() || "U"}</Text>
            </View>
            <Pressable style={styles.avatarEditBtn}>
              <Ionicons name="add" size={16} color={Colors.teal} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <Field label="Name" value={firstName} onChangeText={setFirstName} placeholder="First Name" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save Changes"}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteBtnText}>Delete Account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", secureTextEntry = false }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.medGray}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, marginBottom: 16 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text.primary },
  avatarSection: { alignItems: "center", marginBottom: 32, position: "relative" },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 36, color: Colors.white },
  avatarEditBtn: {
    position: "absolute", bottom: 0, right: "35%",
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.background.card,
    borderWidth: 2, borderColor: Colors.teal,
    alignItems: "center", justifyContent: "center",
  },
  form: { gap: 16, marginBottom: 28 },
  fieldGroup: { gap: 6 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text.secondary },
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text.primary,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  saveBtn: { borderRadius: 26, overflow: "hidden", marginBottom: 16 },
  saveBtnGradient: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  deleteBtn: { alignItems: "center", paddingVertical: 14 },
  deleteBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.status.error },
});
