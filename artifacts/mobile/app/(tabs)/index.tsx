import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import CircularProgress from "@/components/CircularProgress";

type ActivityData = {
  steps: number; stepsGoal: number;
  minutes: number; minutesGoal: number;
  calories: number; caloriesGoal: number;
  streakDays: number;
  progressAmount: number; progressGoal: number;
  period: string;
};

const PERIODS = ["Daily", "Weekly", "Monthly"];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState("daily");
  const [refreshing, setRefreshing] = useState(false);

  const { data: activity, refetch, isLoading } = useQuery<ActivityData>({
    queryKey: ["activity", period],
    queryFn: async () => {
      const res = await apiGet(`/activity?period=${period}`);
      return res.json();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const progress = activity ? activity.progressAmount / activity.progressGoal : 0;
  const stepsProgress = activity ? Math.min(activity.steps / activity.stepsGoal, 1) : 0;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient colors={["#4ECDC4", "#2A9D95", "#1A3A3A"]} style={[styles.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding + 20, paddingBottom: 120 + bottomPadding }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day, {user?.firstName}</Text>
            <Text style={styles.subGreeting}>April Progress</Text>
          </View>
          <Pressable style={styles.avatarBtn} onPress={() => router.push("/edit-profile")}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <Pressable
              key={p}
              style={[styles.periodChip, period === p.toLowerCase() && styles.periodChipActive]}
              onPress={() => { setPeriod(p.toLowerCase()); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.periodChipText, period === p.toLowerCase() && styles.periodChipTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.progressCard}>
          <CircularProgress size={160} strokeWidth={12} progress={progress} color={Colors.teal} trackColor="rgba(255,255,255,0.2)">
            <View style={{ alignItems: "center" }}>
              <Text style={styles.progressAmount}>£ {activity?.progressAmount?.toFixed(0) || "0"}</Text>
              <Text style={styles.progressGoal}>/ £ {activity?.progressGoal || "0"}</Text>
            </View>
          </CircularProgress>

          <View style={styles.progressBarSection}>
            <View style={styles.progressBarRow}>
              <Text style={styles.progressBarLabel}>£ {activity?.progressAmount?.toFixed(0) || "0"}</Text>
              <Text style={styles.progressBarLabel}>£ {activity?.progressGoal || "500"}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </View>
            <Text style={styles.unlockedLabel}>Unlocked</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="footsteps" iconLib="Ionicons" label="Steps" value={activity?.steps || 0} unit="" color="#4ECDC4" />
          <StatCard icon="time-outline" iconLib="Ionicons" label="Minutes" value={activity?.minutes || 0} unit="" color="#45B7D1" />
          <StatCard icon="flame" iconLib="Ionicons" label="Calories" value={activity?.calories || 0} unit="" color="#FF6B6B" />
        </View>

        {(activity?.streakDays || 0) > 0 && (
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={28} color="#FF6B6B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>You're on a {activity?.streakDays}-day streak!</Text>
              <Text style={styles.streakSub}>Keep moving to reach 7 days and earn a reward</Text>
            </View>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.workoutBtn, pressed && { opacity: 0.85 }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await apiPost("/activity/log", { type: "workout", value: 30 });
            refetch();
          }}
        >
          <Text style={styles.actionBtnText}>Do Workout</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.stepsBtn, pressed && { opacity: 0.85 }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await apiPost("/activity/log", { type: "steps", value: 2000 });
            refetch();
          }}
        >
          <Text style={[styles.actionBtnText, { color: Colors.teal }]}>Track Steps</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

type StatCardProps = {
  icon: string; iconLib: string; label: string; value: number; unit: string; color: string;
};
function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.white, marginBottom: 2 },
  subGreeting: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  avatarBtn: {},
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.white },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  periodChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  periodChipActive: { backgroundColor: Colors.white },
  periodChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  periodChipTextActive: { color: Colors.teal },
  progressCard: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 24,
    padding: 24, alignItems: "center", marginBottom: 20, gap: 20,
  },
  progressAmount: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.white },
  progressGoal: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)" },
  progressBarSection: { width: "100%", gap: 6 },
  progressBarRow: { flexDirection: "row", justifyContent: "space-between" },
  progressBarLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  progressBarTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: Colors.white, borderRadius: 4 },
  unlockedLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16,
    padding: 14, alignItems: "center", gap: 4,
    borderTopWidth: 3,
  },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.white },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)" },
  streakCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16,
    padding: 16, marginBottom: 20,
  },
  streakTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white },
  streakSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 18 },
  actionBtn: {
    height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  workoutBtn: { backgroundColor: Colors.white },
  stepsBtn: { backgroundColor: "transparent", borderWidth: 2, borderColor: Colors.white },
  actionBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.teal },
});
