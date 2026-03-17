import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { apiGet, apiPost } from "@/lib/api";

type RewardsData = {
  dailyGoal: { id: string; title: string; description: string; bonusPoints: number; joined: boolean };
  weeklyChallenge: { id: string; title: string; description: string; bonusPoints: number; joined: boolean };
  badges: Array<{ id: string; title: string; daysCount: number; type: string }>;
  partnerDiscounts: Array<{ id: string; brand: string; description: string; logoIcon: string }>;
};

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const { data: rewards, refetch } = useQuery<RewardsData>({
    queryKey: ["rewards"],
    queryFn: async () => {
      const res = await apiGet("/rewards");
      return res.json();
    },
  });

  const joinChallenge = async (challengeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await apiPost("/rewards/join-challenge", { challengeId });
    queryClient.invalidateQueries({ queryKey: ["rewards"] });
    refetch();
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPadding }]}>
        <Text style={styles.title}>Rewards</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          <ChallengeCard
            title={rewards?.dailyGoal?.title || "Walk 10,000 steps"}
            points={rewards?.dailyGoal?.bonusPoints || 5}
            joined={rewards?.dailyGoal?.joined || false}
            onJoin={() => joinChallenge(rewards?.dailyGoal?.id || "daily-steps")}
            gradient={["#4ECDC4", "#45B7D1"]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenge</Text>
          <ChallengeCard
            title={rewards?.weeklyChallenge?.title || "Complete 5 workouts"}
            points={rewards?.weeklyChallenge?.bonusPoints || 15}
            joined={rewards?.weeklyChallenge?.joined || false}
            onJoin={() => joinChallenge(rewards?.weeklyChallenge?.id || "weekly-workouts")}
            gradient={["#6C63FF", "#9C94FF"]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesRow}>
            {(rewards?.badges || [
              { id: "1", title: "3-Day Streak", daysCount: 3, type: "streak" },
              { id: "2", title: "7-Day Streak", daysCount: 7, type: "streak" },
              { id: "3", title: "30 Day Challenge", daysCount: 30, type: "challenge" },
            ]).map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Discounts</Text>
          {(rewards?.partnerDiscounts || [
            { id: "nike", brand: "Nike", description: "10% off after completing 50,000 steps", logoIcon: "nike" },
            { id: "adidas", brand: "Adidas", description: "Free gym month after completing 10 workouts", logoIcon: "adidas" },
            { id: "gymshark", brand: "GymShark", description: "Cashback on purchases for active users", logoIcon: "gymshark" },
          ]).map(discount => (
            <PartnerCard key={discount.id} discount={discount} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ChallengeCard({ title, points, joined, onJoin, gradient }: {
  title: string; points: number; joined: boolean; onJoin: () => void; gradient: [string, string];
}) {
  return (
    <LinearGradient colors={gradient} style={styles.challengeCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.challengeTitle}>{title}</Text>
        <Text style={styles.challengePoints}>{points} Bonus Points</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.joinBtn, joined && styles.joinedBtn, pressed && { opacity: 0.85 }]}
        onPress={onJoin}
        disabled={joined}
      >
        <Text style={[styles.joinBtnText, joined && styles.joinedBtnText]}>
          {joined ? "Joined" : "Join Challenge"}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

function BadgeCard({ badge }: { badge: { id: string; title: string; daysCount: number; type: string } }) {
  return (
    <LinearGradient colors={["#6C63FF", "#9C94FF"]} style={styles.badgeCard}>
      <Ionicons name={badge.type === "streak" ? "flame" : "trophy"} size={24} color="rgba(255,255,255,0.9)" />
      <Text style={styles.badgeDays}>{badge.daysCount}</Text>
      <Text style={styles.badgeTitle}>{badge.title}</Text>
    </LinearGradient>
  );
}

function PartnerCard({ discount }: { discount: { id: string; brand: string; description: string } }) {
  const getBrandColor = (brand: string) => {
    if (brand === "Nike") return "#111";
    if (brand === "Adidas") return "#000";
    return "#2C3E50";
  };

  return (
    <View style={styles.partnerCard}>
      <View style={[styles.partnerLogo, { backgroundColor: getBrandColor(discount.brand) }]}>
        <Text style={styles.partnerLogoText}>{discount.brand[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.partnerBrand}>{discount.brand}</Text>
        <Text style={styles.partnerDesc}>{discount.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text.primary, marginBottom: 12 },
  challengeCard: {
    borderRadius: 18, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  challengeTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.white, marginBottom: 4 },
  challengePoints: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  joinBtn: {
    backgroundColor: Colors.white, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  joinedBtn: { backgroundColor: "rgba(255,255,255,0.25)" },
  joinBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.teal },
  joinedBtnText: { color: Colors.white },
  badgesRow: { flexDirection: "row", gap: 12 },
  badgeCard: {
    flex: 1, borderRadius: 16, padding: 16,
    alignItems: "center", gap: 6,
  },
  badgeDays: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.white },
  badgeTitle: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  partnerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  partnerLogo: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  partnerLogoText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.white },
  partnerBrand: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text.primary, marginBottom: 2 },
  partnerDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },
});
