import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DriverData, sampleBookings } from "@/constants/data";

export default function DriverDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { bookings } = useData();

  const driver = user as DriverData | null;
  const [isOnline, setIsOnline] = useState(driver?.isAvailable ?? false);

  const activeRides = sampleBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress");

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
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {isOnline ? "You're Online" : "You're Offline"}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {driver?.name || "Driver"}
          </Text>
        </View>
        <View style={styles.onlineToggle}>
          <Switch
            value={isOnline}
            onValueChange={(val) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsOnline(val);
            }}
            trackColor={{ false: "#D4D4D4", true: "#2ECC71" }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <LinearGradient
          colors={isDark ? ["#1A1A1A", "#242420"] : [Colors.gold + "15", Colors.gold + "08"]}
          style={[styles.earningsCard, { borderColor: Colors.gold + "30" }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.earningsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Today's Earnings</Text>
              <Text style={styles.earningsValue}>{"\u20B9"}{(driver?.todayEarnings || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.earningsIcon, { backgroundColor: Colors.gold + "20" }]}>
              <Ionicons name="trending-up" size={24} color={Colors.gold} />
            </View>
          </View>
          <View style={[styles.earningsStats, { borderTopColor: Colors.gold + "20" }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.text }]}>{driver?.completedTrips || 0}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Total Trips</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors.gold + "30" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.text }]}>{driver?.rating || 0}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors.gold + "30" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.text }]}>{"\u20B9"}{(driver?.walletBalance || 0).toLocaleString()}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>Wallet</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Rides</Text>
        {activeRides.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="car-outline" size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isOnline ? "Waiting for ride requests..." : "Go online to receive rides"}
            </Text>
          </View>
        ) : (
          activeRides.map((ride, i) => (
            <Animated.View key={ride.id} entering={FadeInDown.delay(250 + i * 60).duration(400)}>
              <View style={[styles.rideCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.rideHeader}>
                  <View style={[styles.rideBadge, { backgroundColor: "#3498DB18" }]}>
                    <Ionicons name="navigate" size={14} color="#3498DB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rideDestination, { color: colors.text }]}>{ride.destinationName}</Text>
                    <Text style={[styles.ridePickup, { color: colors.textSecondary }]}>{ride.pickupLocation}</Text>
                  </View>
                  <Text style={styles.rideFare}>{"\u20B9"}{ride.fare.toLocaleString()}</Text>
                </View>
                <View style={styles.rideFooter}>
                  <Text style={[styles.rideTime, { color: colors.textSecondary }]}>{ride.date} at {ride.time}</Text>
                  <Text style={[styles.ridePassengers, { color: colors.textSecondary }]}>
                    {ride.passengers} passengers
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Info</Text>
        <View style={[styles.vehicleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.vehicleRow}>
            <Ionicons name="car-sport" size={22} color={Colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>{driver?.vehicle || "N/A"}</Text>
              <Text style={[styles.vehicleNum, { color: colors.textSecondary }]}>{driver?.vehicleNumber || ""}</Text>
            </View>
            <View style={[styles.kycBadge, { backgroundColor: driver?.kycStatus === "approved" ? "#2ECC7118" : "#F39C1218" }]}>
              <Ionicons
                name={driver?.kycStatus === "approved" ? "checkmark-circle" : "time"}
                size={14}
                color={driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12"}
              />
              <Text
                style={[styles.kycText, { color: driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12" }]}
              >
                KYC {driver?.kycStatus || "Pending"}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  name: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26 },
  onlineToggle: { marginLeft: 12 },
  earningsCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 24 },
  earningsRow: { flexDirection: "row", alignItems: "center" },
  earningsLabel: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  earningsValue: { fontFamily: "Poppins_700Bold", fontSize: 32, color: Colors.gold, marginTop: 4 },
  earningsIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  earningsStats: { flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  statDesc: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: "100%" },
  sectionTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, marginBottom: 14 },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center" },
  rideCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  rideHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  rideBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rideDestination: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  ridePickup: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  rideFare: { fontFamily: "Poppins_700Bold", fontSize: 17, color: Colors.gold },
  rideFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  rideTime: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  ridePassengers: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  vehicleCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  vehicleName: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  vehicleNum: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kycText: { fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "capitalize" },
});
