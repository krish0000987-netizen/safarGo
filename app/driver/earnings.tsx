import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { DriverData } from "@/constants/data";

const earningsHistory = [
  { id: "1", date: "Feb 19", destination: "Varanasi Trip", amount: 3200, type: "credit" },
  { id: "2", date: "Feb 18", destination: "Ayodhya Trip", amount: 2499, type: "credit" },
  { id: "3", date: "Feb 18", destination: "Withdrawal", amount: -5000, type: "debit" },
  { id: "4", date: "Feb 17", destination: "Agra Trip", amount: 5600, type: "credit" },
  { id: "5", date: "Feb 16", destination: "Mathura Trip", amount: 4299, type: "credit" },
  { id: "6", date: "Feb 15", destination: "Prayagraj Trip", amount: 3499, type: "credit" },
];

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const driver = user as DriverData | null;

  const weekEarnings = earningsHistory
    .filter((e) => e.type === "credit")
    .slice(0, 4)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
        paddingBottom: 100,
        paddingHorizontal: 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Earnings</Text>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <LinearGradient
          colors={[Colors.gold, Colors.goldDark]}
          style={styles.totalCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalValue}>{"\u20B9"}{(driver?.totalEarnings || 0).toLocaleString()}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{"\u20B9"}{(driver?.todayEarnings || 0).toLocaleString()}</Text>
              <Text style={styles.totalStatLabel}>Today</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{"\u20B9"}{weekEarnings.toLocaleString()}</Text>
              <Text style={styles.totalStatLabel}>This Week</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{driver?.completedTrips || 0}</Text>
              <Text style={styles.totalStatLabel}>Trips</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.walletSection}>
        <View style={[styles.walletCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="wallet" size={22} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>Wallet Balance</Text>
            <Text style={[styles.walletValue, { color: colors.text }]}>
              {"\u20B9"}{(driver?.walletBalance || 0).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.withdrawBtn, { backgroundColor: Colors.gold + "15" }]}>
            <Text style={[styles.withdrawText, { color: Colors.gold }]}>Withdraw</Text>
          </View>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
      {earningsHistory.map((item, i) => (
        <Animated.View key={item.id} entering={FadeInDown.delay(250 + i * 50).duration(400)}>
          <View style={[styles.txRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.txIcon, { backgroundColor: item.type === "credit" ? "#2ECC7118" : "#E74C3C18" }]}>
              <Ionicons
                name={item.type === "credit" ? "arrow-down" : "arrow-up"}
                size={16}
                color={item.type === "credit" ? "#2ECC71" : "#E74C3C"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.txName, { color: colors.text }]}>{item.destination}</Text>
              <Text style={[styles.txDate, { color: colors.textSecondary }]}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: item.type === "credit" ? "#2ECC71" : "#E74C3C" },
              ]}
            >
              {item.type === "credit" ? "+" : ""}{"\u20B9"}{Math.abs(item.amount).toLocaleString()}
            </Text>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, marginBottom: 20 },
  totalCard: { borderRadius: 20, padding: 24, marginBottom: 20 },
  totalLabel: { fontFamily: "Poppins_400Regular", fontSize: 14, color: "rgba(10,10,10,0.6)" },
  totalValue: { fontFamily: "Poppins_700Bold", fontSize: 38, color: "#0A0A0A", marginTop: 4 },
  totalRow: { flexDirection: "row", marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(10,10,10,0.1)" },
  totalStat: { flex: 1, alignItems: "center" },
  totalStatValue: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#0A0A0A" },
  totalStatLabel: { fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(10,10,10,0.5)", marginTop: 2 },
  totalDivider: { width: 1, backgroundColor: "rgba(10,10,10,0.1)" },
  walletSection: { marginBottom: 24 },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  walletLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  walletValue: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  withdrawBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  withdrawText: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  sectionTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, marginBottom: 14 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txName: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  txDate: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  txAmount: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
});
