import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPut } from "@/lib/api";

type NotificationSettings = {
  activityReminders: boolean;
  fundsUnlocked: boolean;
  streakUpdates: boolean;
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const { data: notifSettings, refetch } = useQuery<NotificationSettings>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiGet("/user/notifications");
      return res.json();
    },
  });

  const toggleNotification = async (key: keyof NotificationSettings) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const updated = { ...notifSettings!, [key]: !notifSettings![key] };
    await apiPut("/user/notifications", updated);
    queryClient.setQueryData(["notifications"], updated);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive",
        onPress: async () => {
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPadding }]}>
        <Text style={styles.title}>Settings</Text>

        <Pressable style={styles.profileCard} onPress={() => router.push("/edit-profile")}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.firstName?.[0]?.toUpperCase() || "U"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.firstName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.medGray} />
        </Pressable>

        <View style={styles.section}>
          <SettingRow
            icon="bell-outline"
            label="Notifications"
            onPress={() => {}}
            showChevron={false}
          />
          <View style={styles.notifToggles}>
            <NotifToggle
              label="Activity Reminders"
              value={notifSettings?.activityReminders || false}
              onToggle={() => toggleNotification("activityReminders")}
            />
            <NotifToggle
              label="Funds Unlocked"
              value={notifSettings?.fundsUnlocked || false}
              onToggle={() => toggleNotification("fundsUnlocked")}
            />
            <NotifToggle
              label="Streak Updates"
              value={notifSettings?.streakUpdates || false}
              onToggle={() => toggleNotification("streakUpdates")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SettingRow icon="phone-portrait-outline" label="Tracking Apps" badge="Connected" onPress={() => {}} />
          <SettingRow icon="card-outline" label={user?.plan === "premium" ? "Premium Plan" : "Free Plan"} badge={user?.plan === "free" ? "Upgrade Now" : undefined} badgeColor={Colors.teal} onPress={() => {}} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>The Wellness Wallet 1.1.0</Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, badge, badgeColor, onPress, showChevron = true }: {
  icon: string; label: string; badge?: string; badgeColor?: string; onPress: () => void; showChevron?: boolean;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color={Colors.text.secondary} />
      <Text style={styles.settingLabel}>{label}</Text>
      {badge && (
        <View style={[styles.badge, badgeColor ? { backgroundColor: badgeColor } : styles.badgeConnected]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {showChevron && <Ionicons name="chevron-forward" size={16} color={Colors.medGray} />}
    </Pressable>
  );
}

function NotifToggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.notifToggle}>
      <Text style={styles.notifLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border.medium, true: Colors.teal }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 20 },
  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.background.card, borderRadius: 18,
    padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center",
  },
  profileAvatarText: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.white },
  profileName: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text.primary },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  section: {
    backgroundColor: Colors.background.card, borderRadius: 18, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border.light, overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border.light,
  },
  settingLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text.primary, flex: 1 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.teal,
  },
  badgeConnected: { backgroundColor: "rgba(78,205,196,0.15)" },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.white },
  notifToggles: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  notifToggle: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border.light,
  },
  notifLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text.primary, flex: 1 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(239,83,80,0.08)", borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(239,83,80,0.2)",
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.status.error },
  version: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.medGray, textAlign: "center", marginTop: 8 },
});
