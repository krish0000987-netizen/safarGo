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
import { useData } from "@/contexts/DataContext";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { getStats, bookings } = useData();
  const stats = getStats();

  const statCards = [
    { icon: "car", label: "Total Bookings", value: stats.totalBookings.toString(), color: "#3498DB", bg: "#3498DB18" },
    { icon: "checkmark-circle", label: "Active Rides", value: stats.activeBookings.toString(), color: "#2ECC71", bg: "#2ECC7118" },
    { icon: "wallet", label: "Revenue", value: `\u20B9${stats.totalRevenue.toLocaleString()}`, color: Colors.gold, bg: Colors.gold + "18" },
    { icon: "people", label: "Drivers", value: `${stats.activeDrivers}/${stats.totalDrivers}`, color: "#9B59B6", bg: "#9B59B618" },
  ];

  const recentBookings = bookings.slice(0, 5);

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
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Admin Panel</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || "Admin"}</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: Colors.gold + "18" }]}>
          <Ionicons name="shield" size={16} color={Colors.gold} />
          <Text style={[styles.adminLabel, { color: Colors.gold }]}>Admin</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((card, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(100 + i * 60).duration(500)} style={styles.statCardWrapper}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon as any} size={20} color={card.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{card.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <LinearGradient
          colors={isDark ? ["#1A1A1A", "#242420"] : [Colors.gold + "08", Colors.gold + "03"]}
          style={[styles.overviewCard, { borderColor: Colors.gold + "20" }]}
        >
          <Text style={[styles.overviewTitle, { color: colors.text }]}>Performance Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: Colors.gold }]}>94%</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Completion Rate</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: Colors.gold }]}>4.7</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Avg Rating</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: Colors.gold }]}>12m</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Avg Response</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Bookings</Text>
        {recentBookings.map((booking, i) => (
          <View
            key={booking.id}
            style={[
              styles.bookingRow,
              { borderBottomColor: colors.border },
              i === recentBookings.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[styles.bookingIcon, { backgroundColor: Colors.gold + "18" }]}>
              <Ionicons name="navigate" size={14} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bookingDest, { color: colors.text }]}>{booking.destinationName}</Text>
              <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>{booking.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.bookingFare}>{"\u20B9"}{booking.fare.toLocaleString()}</Text>
              <Text
                style={[
                  styles.bookingStatus,
                  {
                    color:
                      booking.status === "completed"
                        ? "#2ECC71"
                        : booking.status === "cancelled"
                        ? "#E74C3C"
                        : "#3498DB",
                  },
                ]}
              >
                {booking.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  name: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  adminLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCardWrapper: { width: "47%" },
  statCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Poppins_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  overviewCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 24 },
  overviewTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 16 },
  overviewRow: { flexDirection: "row" },
  overviewItem: { flex: 1, alignItems: "center" },
  overviewValue: { fontFamily: "Poppins_700Bold", fontSize: 24 },
  overviewLabel: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 4 },
  sectionTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, marginBottom: 14 },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  bookingIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  bookingDest: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  bookingMeta: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  bookingFare: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: Colors.gold },
  bookingStatus: { fontFamily: "Poppins_500Medium", fontSize: 10, marginTop: 2 },
});
