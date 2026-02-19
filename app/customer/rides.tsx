import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { BookingData } from "@/constants/data";

const gridActions = [
  { icon: "time-outline", label: "Bookings", color: "#4CAF50", bg: "#E8F5E9" },
  { icon: "heart", label: "Favorites", color: "#E91E63", bg: "#FCE4EC" },
  { icon: "chatbubble-ellipses", label: "Support", color: "#FF9800", bg: "#FFF3E0" },
  { icon: "settings", label: "Settings", color: "#5C6BC0", bg: "#E8EAF6" },
];

function TripCard({ booking, onCancel }: { booking: BookingData; onCancel: (id: string) => void }) {
  const { colors } = useTheme();

  const statusColor = booking.status === "completed" ? "#4CAF50"
    : booking.status === "confirmed" ? "#1976D2"
    : booking.status === "cancelled" ? "#E74C3C"
    : booking.status === "in_progress" ? "#2ECC71"
    : "#FF9800";

  return (
    <View style={[styles.tripCard, { backgroundColor: colors.surface }]}>
      <View style={styles.tripHeader}>
        <View style={[styles.tripBadge, { backgroundColor: statusColor + "18" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {booking.status.replace("_", " ").charAt(0).toUpperCase() + booking.status.replace("_", " ").slice(1)}
          </Text>
        </View>
        {(booking.status === "pending" || booking.status === "confirmed") && (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onCancel(booking.id);
            }}
          >
            <Ionicons name="close-circle-outline" size={22} color="#E74C3C" />
          </Pressable>
        )}
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeIndicator}>
          <View style={[styles.routeDotGreen, { backgroundColor: "#4CAF50" }]} />
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={[styles.routeDotRed, { backgroundColor: "#E74C3C" }]} />
        </View>
        <View style={styles.routeTexts}>
          <Text style={[styles.routeLabel, { color: colors.text }]}>{booking.pickupLocation || "Current Location"}</Text>
          <Text style={[styles.routeLabel, { color: colors.text, marginTop: 20 }]}>{booking.destinationName}, Uttar Pradesh</Text>
        </View>
      </View>

      <View style={[styles.tripFooter, { borderTopColor: colors.border }]}>
        <View style={styles.vehicleInfo}>
          <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
            {booking.vehicleType}
          </Text>
        </View>
        <Text style={styles.fareText}>{"\u20B9"}{booking.fare.toLocaleString()}</Text>
      </View>
    </View>
  );
}

export default function RidesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { bookings, cancelBooking } = useData();

  const handleCancel = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: () => cancelBooking(id) },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
        paddingBottom: 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Trips</Text>
        {bookings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="car-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No trips yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Book your first ride to get started!</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <TripCard key={booking.id} booking={booking} onCancel={handleCancel} />
          ))
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.gridSection}>
        <View style={styles.actionGrid}>
          {gridActions.map((action, i) => (
            <Pressable
              key={i}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.gridAction,
                { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon as any} size={26} color={action.color} />
              </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 32, marginBottom: 20 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 17, marginBottom: 14 },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tripBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  routeSection: { flexDirection: "row", gap: 14 },
  routeIndicator: { alignItems: "center", paddingTop: 4 },
  routeDotGreen: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { width: 2, height: 24 },
  routeDotRed: { width: 12, height: 12, borderRadius: 6 },
  routeTexts: { flex: 1 },
  routeLabel: { fontFamily: "Poppins_500Medium", fontSize: 15 },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  vehicleText: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  fareText: { fontFamily: "Poppins_700Bold", fontSize: 18, color: Colors.gold },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  emptyText: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  emptySubtext: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  gridSection: { marginTop: 8 },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridAction: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: { fontFamily: "Poppins_500Medium", fontSize: 14 },
});
