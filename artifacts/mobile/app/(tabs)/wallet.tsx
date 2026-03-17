import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { apiGet, apiPost } from "@/lib/api";

type WalletData = {
  availableBalance: number;
  lockedFunds: number;
  unlockedFunds: number;
  bonusPoints: number;
  unlockPeriod: string;
  recentUnlock: string | null;
  history: Array<{ id: number; description: string; amount: number; type: string; createdAt: string }>;
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [withdrawing, setWithdrawing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const { data: wallet, refetch } = useQuery<WalletData>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await apiGet("/wallet");
      return res.json();
    },
  });

  const handleWithdraw = () => {
    Alert.prompt(
      "Withdraw Funds",
      `Available: £${wallet?.availableBalance?.toFixed(2) || "0"}\nEnter amount to withdraw:`,
      async (amountStr) => {
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
          Alert.alert("Error", "Please enter a valid amount");
          return;
        }
        setWithdrawing(true);
        const res = await apiPost("/wallet/withdraw", { amount });
        setWithdrawing(false);
        if (res.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({ queryKey: ["wallet"] });
          refetch();
        } else {
          const err = await res.json();
          Alert.alert("Error", err.error || "Withdrawal failed");
        }
      },
      "plain-text",
      "",
      "decimal-pad"
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPadding }]}>
        <Text style={styles.screenTitle}>Wallet</Text>

        <LinearGradient colors={["#1A2744", "#0F1729"]} style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <View>
              <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.walletLogoBox}>
                <Ionicons name="wallet" size={20} color={Colors.white} />
              </LinearGradient>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.walletBrand}>the wellness</Text>
              <Text style={styles.walletBrand}>wallet</Text>
            </View>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>£ {wallet?.availableBalance?.toFixed(0) || "0"}</Text>
          </View>
        </LinearGradient>

        {wallet?.recentUnlock && (
          <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.unlockBanner}>
            <Ionicons name="trophy" size={18} color={Colors.white} />
            <Text style={styles.unlockText}>{wallet.recentUnlock}</Text>
          </LinearGradient>
        )}

        <View style={styles.statsGrid}>
          <WalletStat label="Locked Funds" value={`£${wallet?.lockedFunds?.toFixed(0) || "0"}`} icon="lock-closed" color="#6C63FF" />
          <WalletStat label="Unlocked Funds" value={`£${wallet?.unlockedFunds?.toFixed(0) || "0"}`} icon="lock-open" color="#4ECDC4" />
          <WalletStat label="Bonus Points" value={`${wallet?.bonusPoints || 0} pts`} icon="star" color="#FFD700" />
          <WalletStat label="Unlock Period" value={wallet?.unlockPeriod || "daily"} icon="calendar" color="#45B7D1" />
        </View>

        <Pressable
          style={({ pressed }) => [styles.withdrawBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          onPress={handleWithdraw}
          disabled={withdrawing}
        >
          <LinearGradient colors={["#4ECDC4", "#45B7D1"]} style={styles.withdrawBtnGradient}>
            <Ionicons name="arrow-up-circle" size={20} color={Colors.white} />
            <Text style={styles.withdrawBtnText}>{withdrawing ? "Processing..." : "Withdraw Funds"}</Text>
          </LinearGradient>
        </Pressable>

        {(wallet?.history?.length ?? 0) > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>History</Text>
            {wallet!.history.map(t => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function WalletStat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TransactionRow({ transaction }: { transaction: any }) {
  const isPositive = transaction.amount > 0;
  return (
    <View style={styles.transactionRow}>
      <View style={[styles.txIcon, { backgroundColor: isPositive ? "rgba(78,205,196,0.1)" : "rgba(239,83,80,0.1)" }]}>
        <Ionicons
          name={isPositive ? "arrow-down-circle" : "arrow-up-circle"}
          size={20}
          color={isPositive ? Colors.teal : Colors.status.error}
        />
      </View>
      <Text style={styles.txDesc}>{transaction.description}</Text>
      <Text style={[styles.txAmount, { color: isPositive ? Colors.teal : Colors.status.error }]}>
        {isPositive ? "+" : ""}£{Math.abs(transaction.amount).toFixed(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.screen },
  scroll: { paddingHorizontal: 20 },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text.primary, marginBottom: 20 },
  walletCard: {
    borderRadius: 22, padding: 22, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  walletCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 },
  walletLogoBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  walletBrand: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 16 },
  balanceSection: { gap: 4 },
  balanceLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.6)" },
  balanceAmount: { fontFamily: "Inter_700Bold", fontSize: 36, color: Colors.white },
  unlockBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  unlockText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: {
    width: "47%", backgroundColor: Colors.background.card, borderRadius: 16,
    padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text.primary },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.text.secondary },
  withdrawBtn: { borderRadius: 26, overflow: "hidden", marginBottom: 24 },
  withdrawBtnGradient: {
    height: 54, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, borderRadius: 26,
  },
  withdrawBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  historySection: { gap: 12 },
  historyTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text.primary, marginBottom: 4 },
  transactionRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.background.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border.light,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text.primary, flex: 1 },
  txAmount: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
