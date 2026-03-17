import React from "react";
import {
  View, Text, StyleSheet, Pressable, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#4ECDC4", "#45B7D1", "#2A9D95"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet" size={36} color={Colors.white} />
        </View>
        <Text style={styles.brandName}>the{"\n"}wellness{"\n"}wallet</Text>
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.headline}>Start unlocking fitter finances and a fitter you</Text>
        <Text style={styles.subline}>Take control. Stay motivated.</Text>
      </View>

      <View style={styles.featureRow}>
        <FeatureItem icon="flag" label="Choose a goal" sub="and lock funds" />
        <FeatureItem icon="running" label="Stay active" sub="to unlock money" />
        <FeatureItem icon="star" label="Reach goals" sub="to earn rewards" />
      </View>

      <View style={styles.buttonSection}>
        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.outlineBtnText}>Sign in</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.solidBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={styles.solidBtnText}>Get Started</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <FontAwesome5 name={icon} size={18} color={Colors.white} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  decorCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -50,
    right: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: 50,
    left: -150,
  },
  decorCircle3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: 100,
    right: -40,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  brandName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.white,
    lineHeight: 28,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  headline: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.white,
    lineHeight: 36,
    marginBottom: 10,
  },
  subline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.white,
    textAlign: "center",
  },
  featureSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  buttonSection: {
    gap: 12,
    marginBottom: 16,
  },
  outlineBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
  solidBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.teal,
  },
});
