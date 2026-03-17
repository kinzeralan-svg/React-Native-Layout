import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const GOALS = ["Steps", "Workouts", "Calories"];

export default function SetupWalletScreen() {
  const insets = useSafeAreaInsets();
  const { setupWallet } = useAuth();
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("daily");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Steps"]);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goal: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleContinue = async () => {
    const lockAmount = parseFloat(amount);
    if (!amount || isNaN(lockAmount) || lockAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount to lock");
      return;
    }
    if (selectedGoals.length === 0) {
      Alert.alert("Error", "Please select at least one goal");
      return;
    }
    setLoading(true);
    const result = await setupWallet(lockAmount, period, selectedGoals.map(g => g.toLowerCase()));
    setLoading(false);
    if (result.error) {
      Alert.alert("Error", result.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Set Up Your Wallet</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Enter Amount to Lock (£)</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={Colors.medGray}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.periodRow}>
            {PERIODS.map(p => (
              <Pressable
                key={p.key}
                style={({ pressed }) => [
                  styles.periodBtn,
                  period === p.key && styles.periodBtnActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => { setPeriod(p.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                {period === p.key ? (
                  <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.periodBtnGradient}>
                    <Text style={styles.periodBtnTextActive}>{p.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.periodBtnText}>{p.label}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goals</Text>
          <View style={styles.goalsList}>
            {GOALS.map(goal => (
              <Pressable
                key={goal}
                style={({ pressed }) => [styles.goalItem, pressed && { opacity: 0.8 }]}
                onPress={() => toggleGoal(goal)}
              >
                <View style={[styles.goalCheckbox, selectedGoals.includes(goal) && styles.goalCheckboxActive]}>
                  {selectedGoals.includes(goal) && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
                <Text style={styles.goalLabel}>{goal}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.teal} />
          <Text style={styles.infoText}>
            Locked funds are released when you complete your fitness goals. The more you achieve, the more you unlock!
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={handleContinue}
          disabled={loading}
        >
          <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.btnGradient}>
            <Text style={styles.continueBtnText}>{loading ? "Setting up..." : "Continue"}</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 32 },
  section: { marginBottom: 28 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text.secondary, marginBottom: 12 },
  amountInput: {
    backgroundColor: Colors.background.input,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.border.light,
  },
  periodRow: { flexDirection: "row", gap: 10 },
  periodBtn: {
    flex: 1, height: 44, borderRadius: 22,
    backgroundColor: Colors.background.input,
    borderWidth: 1.5, borderColor: Colors.border.medium,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  periodBtnActive: { borderColor: Colors.teal },
  periodBtnGradient: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  periodBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text.secondary },
  periodBtnTextActive: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.white },
  goalsList: { gap: 14 },
  goalItem: { flexDirection: "row", alignItems: "center", gap: 14 },
  goalCheckbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: Colors.border.medium, alignItems: "center", justifyContent: "center",
  },
  goalCheckboxActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  goalLabel: { fontFamily: "Inter_500Medium", fontSize: 16, color: Colors.text.primary },
  infoCard: {
    flexDirection: "row", gap: 10, backgroundColor: "rgba(78,205,196,0.1)",
    borderRadius: 14, padding: 16, marginBottom: 32, alignItems: "flex-start",
  },
  infoText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.text.secondary, flex: 1, lineHeight: 20 },
  continueBtn: { borderRadius: 26, overflow: "hidden" },
  btnGradient: { height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  continueBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
});
