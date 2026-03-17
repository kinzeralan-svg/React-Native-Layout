import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { apiGet, apiPost } from "@/lib/api";

type ActivityData = {
  steps: number; stepsGoal: number;
  minutes: number; minutesGoal: number;
  calories: number; caloriesGoal: number;
  streakDays: number;
  calendarData: Array<{ date: string; completed: boolean; amount?: number | null }>;
  period: string;
};

const CONNECTED_APPS = [
  { name: "Apple", icon: "logo-apple", color: "#000" },
  { name: "fitbit", icon: "fitness-outline", color: "#00B0B9" },
  { name: "Strava", icon: "bicycle-outline", color: "#FC4C02" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const { data: activity, refetch } = useQuery<ActivityData>({
    queryKey: ["activity-detail"],
    queryFn: async () => {
      const res = await apiGet("/activity?period=daily");
      return res.json();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const stepsProgress = activity ? Math.min(activity.steps / activity.stepsGoal, 1) : 0;

  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const calendarDays = activity?.calendarData?.slice(-28) || [];

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Activity</Text>

        <View style={styles.connectedRow}>
          {CONNECTED_APPS.map(app => (
            <View key={app.name} style={styles.connectedApp}>
              <Ionicons name={app.icon as any} size={16} color={app.color} />
              <Text style={styles.connectedAppName}>{app.name}</Text>
            </View>
          ))}
        </View>

        <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.stepsCard}>
          <View style={styles.stepsCardHeader}>
            <View style={styles.stepsIconBox}>
              <Ionicons name="footsteps" size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.stepsTitle}>Steps</Text>
              <Text style={styles.stepsSubtitle}>{(activity?.stepsGoal ?? 10000) - (activity?.steps ?? 0)} steps to go</Text>
            </View>
            <Text style={styles.stepsCount}>{(activity?.steps ?? 0).toLocaleString()}</Text>
          </View>

          <View style={styles.stepsProgressTrack}>
            <View style={[styles.stepsProgressFill, { width: `${stepsProgress * 100}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.calendarSection}>
          <Text style={styles.calendarTitle}>{monthName} {year}</Text>
          <View style={styles.calendarHeader}>
            {DAYS.map(d => (
              <Text key={d} style={styles.calendarDayHeader}>{d}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => (
              <CalendarCell key={idx} day={day} />
            ))}
          </View>
        </View>

        {(activity?.streakDays ?? 0) > 0 && (
          <View style={styles.streakBanner}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <View>
              <Text style={styles.streakTitle}>You're on a {activity?.streakDays}-day streak!</Text>
              <Text style={styles.streakSub}>Keep moving to reach 7 days and earn a reward</Text>
            </View>
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.85 }]}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await apiPost("/activity/log", { type: "steps", value: 1000 });
              refetch();
            }}
          >
            <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.logBtnGradient}>
              <Ionicons name="footsteps" size={18} color={Colors.white} />
              <Text style={styles.logBtnText}>+1000 Steps</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.85 }]}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await apiPost("/activity/log", { type: "workout", value: 30 });
              refetch();
            }}
          >
            <LinearGradient colors={["#6C63FF", "#9C94FF"]} style={styles.logBtnGradient}>
              <Ionicons name="barbell" size={18} color={Colors.white} />
              <Text style={styles.logBtnText}>+30 Min Workout</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function CalendarCell({ day }: { day: { date: string; completed: boolean; amount?: number | null } }) {
  const d = new Date(day.date);
  const dayNum = d.getDate();
  const isToday = day.date === new Date().toISOString().split("T")[0];

  return (
    <View style={[styles.calCell, isToday && styles.calCellToday]}>
      {day.completed ? (
        <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.calCellFilled}>
          {day.amount && <Text style={styles.calCellAmount}>£{day.amount}</Text>}
          <Text style={styles.calCellDayFilled}>{dayNum}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.calCellDay, isToday && styles.calCellDayToday]}>{dayNum}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 16 },
  connectedRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  connectedApp: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.background.card, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  connectedAppName: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.text.primary },
  stepsCard: { borderRadius: 20, padding: 18, marginBottom: 20 },
  stepsCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  stepsIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  stepsTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  stepsSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)" },
  stepsCount: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.white, marginLeft: "auto" },
  stepsProgressTrack: {
    height: 8, backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4, overflow: "hidden",
  },
  stepsProgressFill: { height: "100%", backgroundColor: Colors.white, borderRadius: 4 },
  calendarSection: {
    backgroundColor: Colors.background.card, borderRadius: 20,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  calendarTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text.primary, marginBottom: 12 },
  calendarHeader: { flexDirection: "row", marginBottom: 8 },
  calendarDayHeader: {
    flex: 1, textAlign: "center",
    fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.medGray,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: "14.28%", aspectRatio: 1, padding: 2, alignItems: "center", justifyContent: "center" },
  calCellToday: {},
  calCellFilled: { width: "100%", aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  calCellAmount: { fontFamily: "Inter_700Bold", fontSize: 7, color: Colors.white },
  calCellDay: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.text.secondary },
  calCellDayFilled: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.white },
  calCellDayToday: { fontFamily: "Inter_700Bold", color: Colors.teal },
  streakBanner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,107,107,0.1)", borderRadius: 16, padding: 16, marginBottom: 20,
  },
  streakTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text.primary },
  streakSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.text.secondary, lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 12 },
  logBtn: { flex: 1, borderRadius: 20, overflow: "hidden" },
  logBtnGradient: {
    height: 48, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  logBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
});
