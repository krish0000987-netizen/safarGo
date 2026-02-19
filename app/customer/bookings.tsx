import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { BookingData } from "@/constants/data";

type FilterType = "all" | "active" | "completed" | "cancelled";

const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: "#F39C12", icon: "time-outline", label: "Pending" },
  confirmed: { color: "#3498DB", icon: "checkmark-circle-outline", label: "Confirmed" },
  in_progress: { color: "#2ECC71", icon: "car-outline", label: "In Progress" },
  completed: { color: "#27AE60", icon: "checkmark-done-outline", label: "Completed" },
  cancelled: { color: "#E74C3C", icon: "close-circle-outline", label: "Cancelled" },
};

function BookingCard({ item, index, onCancel }: { item: BookingData; index: number; onCancel: (id: string) => void }) {
  const { colors, isDark } = useTheme();
  const config = statusConfig[item.status];

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <View style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.bookingHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.destName, { color: colors.text }]}>{item.destinationName}</Text>
            <Text style={[styles.bookingDate, { color: colors.textSecondary }]}>
              {item.date} at {item.time}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color + "18" }]}>
            <Ionicons name={config.icon as any} size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={[styles.bookingDetails, { borderTopColor: colors.border }]}>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.vehicleType.charAt(0).toUpperCase() + item.vehicleType.slice(1)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.passengers} Passengers
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.pickupLocation}
            </Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.fareText}>{"\u20B9"}{item.fare.toLocaleString()}</Text>
          {item.driverName && (
            <View style={styles.driverInfo}>
              <View style={[styles.driverAvatar, { backgroundColor: Colors.gold + "30" }]}>
                <Ionicons name="person" size={12} color={Colors.gold} />
              </View>
              <Text style={[styles.driverName, { color: colors.textSecondary }]}>{item.driverName}</Text>
            </View>
          )}
          {(item.status === "pending" || item.status === "confirmed") && (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onCancel(item.id);
              }}
              style={styles.cancelBtn}
            >
              <Ionicons name="close" size={16} color="#E74C3C" />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { bookings, cancelBooking } = useData();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "active") return b.status === "pending" || b.status === "confirmed" || b.status === "in_progress";
    return b.status === filter;
  });

  const handleCancel = (id: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => cancelBooking(id) },
      ]
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Done" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16 },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.key ? Colors.gold : colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? "#0A0A0A" : colors.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <BookingCard item={item} index={index} onCancel={handleCancel} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookings yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Browse destinations and book your first trip!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  bookingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  destName: { fontFamily: "Poppins_600SemiBold", fontSize: 17 },
  bookingDate: { fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  bookingDetails: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 8 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontFamily: "Poppins_400Regular", fontSize: 13, flex: 1 },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  fareText: { fontFamily: "Poppins_700Bold", fontSize: 18, color: Colors.gold },
  driverInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  driverAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  driverName: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(231,76,60,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 18 },
  emptySubtitle: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center" },
});
