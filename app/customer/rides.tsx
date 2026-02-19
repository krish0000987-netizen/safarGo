import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppMapView, AppMarker, AppPolyline } from "@/components/MapWrapper";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { BookingData, destinations, LUCKNOW_CENTER } from "@/constants/data";

const gridActions = [
  { icon: "time-outline", label: "Bookings", color: "#4CAF50", bg: "#E8F5E9" },
  { icon: "heart", label: "Favorites", color: "#E91E63", bg: "#FCE4EC" },
  { icon: "chatbubble-ellipses", label: "Support", color: "#FF9800", bg: "#FFF3E0" },
  { icon: "settings", label: "Settings", color: "#5C6BC0", bg: "#E8EAF6" },
];

function DriverTrackingModal({
  visible,
  onClose,
  booking,
}: {
  visible: boolean;
  onClose: () => void;
  booking: BookingData | null;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const dest = booking ? destinations.find((d) => d.id === booking.destinationId) : null;

  const [driverPos, setDriverPos] = useState({
    latitude: LUCKNOW_CENTER.latitude + 0.008,
    longitude: LUCKNOW_CENTER.longitude + 0.005,
  });

  useEffect(() => {
    if (!visible || !dest) return;
    setDriverPos({
      latitude: LUCKNOW_CENTER.latitude + 0.008,
      longitude: LUCKNOW_CENTER.longitude + 0.005,
    });
    const target = { latitude: dest.latitude, longitude: dest.longitude };
    const interval = setInterval(() => {
      setDriverPos((prev) => ({
        latitude: prev.latitude + (target.latitude - prev.latitude) * 0.02 + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (target.longitude - prev.longitude) * 0.02 + (Math.random() - 0.5) * 0.001,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [visible, dest]);

  if (!booking || !dest) return null;

  const pickupCoord = LUCKNOW_CENTER;

  const midLat = (pickupCoord.latitude + driverPos.latitude) / 2;
  const midLng = (pickupCoord.longitude + driverPos.longitude) / 2;
  const latDelta = Math.abs(pickupCoord.latitude - driverPos.latitude) * 2 + 0.02;
  const lngDelta = Math.abs(pickupCoord.longitude - driverPos.longitude) * 2 + 0.02;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[trackStyles.container, { backgroundColor: colors.background }]}>
        <View style={[trackStyles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
          <Pressable onPress={onClose} style={[trackStyles.closeBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[trackStyles.headerTitle, { color: colors.text }]}>Track Driver</Text>
          <View style={{ width: 40 }} />
        </View>

        <AppMapView
          mapRef={mapRef}
          style={trackStyles.map}
          initialRegion={{
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: Math.max(latDelta, 0.03),
            longitudeDelta: Math.max(lngDelta, 0.03),
          }}
        >
          <AppMarker coordinate={pickupCoord} title="Pickup" description={booking.pickupLocation || "Current Location"}>
            <View style={trackStyles.pickupPin}>
              <View style={trackStyles.pickupPinInner} />
            </View>
          </AppMarker>

          <AppMarker coordinate={driverPos} title={booking.driverName || "Driver"} description="En route">
            <View style={trackStyles.driverPin}>
              <Ionicons name="car" size={16} color="#FFF" />
            </View>
          </AppMarker>

          <AppPolyline
            coordinates={[pickupCoord, driverPos]}
            strokeColor={Colors.gold}
            strokeWidth={3}
            lineDashPattern={[6, 4]}
          />
        </AppMapView>

        <View style={[trackStyles.bottomSheet, { backgroundColor: colors.surface }]}>
          <View style={trackStyles.bottomHandle} />

          <View style={trackStyles.driverRow}>
            <View style={trackStyles.driverAvatar}>
              <Ionicons name="person" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[trackStyles.driverName, { color: colors.text }]}>
                {booking.driverName || "Assigned Driver"}
              </Text>
              <Text style={[trackStyles.driverVehicle, { color: colors.textSecondary }]}>
                {booking.vehicleType.charAt(0).toUpperCase() + booking.vehicleType.slice(1)}
              </Text>
            </View>
            <View style={trackStyles.driverActions}>
              <Pressable style={[trackStyles.actionCircle, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="call" size={18} color="#4CAF50" />
              </Pressable>
              <Pressable style={[trackStyles.actionCircle, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="chatbubble" size={18} color="#1976D2" />
              </Pressable>
            </View>
          </View>

          <View style={[trackStyles.routeInfo, { borderTopColor: colors.border }]}>
            <View style={trackStyles.routeRow}>
              <View style={[trackStyles.routeDotSmall, { backgroundColor: "#4CAF50" }]} />
              <Text style={[trackStyles.routeText, { color: colors.text }]}>
                {booking.pickupLocation || "Current Location"}
              </Text>
            </View>
            <View style={[trackStyles.routeLineSmall, { borderLeftColor: colors.border }]} />
            <View style={trackStyles.routeRow}>
              <View style={[trackStyles.routeDotSmall, { backgroundColor: "#E74C3C" }]} />
              <Text style={[trackStyles.routeText, { color: colors.text }]}>
                {booking.destinationName}
              </Text>
            </View>
          </View>

          <View style={[trackStyles.fareRow, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[trackStyles.fareLabel, { color: colors.textSecondary }]}>Estimated Fare</Text>
              <Text style={trackStyles.fareAmount}>{"\u20B9"}{booking.fare.toLocaleString()}</Text>
            </View>
            <View style={trackStyles.etaBox}>
              <Ionicons name="time" size={16} color={Colors.gold} />
              <Text style={[trackStyles.etaText, { color: colors.text }]}>~15 min</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TripCard({
  booking,
  onCancel,
  onTrack,
}: {
  booking: BookingData;
  onCancel: (id: string) => void;
  onTrack: (booking: BookingData) => void;
}) {
  const { colors } = useTheme();

  const statusColor = booking.status === "completed" ? "#4CAF50"
    : booking.status === "confirmed" ? "#1976D2"
    : booking.status === "cancelled" ? "#E74C3C"
    : booking.status === "in_progress" ? "#2ECC71"
    : "#FF9800";

  const canTrack = booking.status === "confirmed" || booking.status === "in_progress";

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

      {canTrack && (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTrack(booking);
          }}
          style={styles.trackBtn}
        >
          <Ionicons name="navigate" size={16} color="#FFF" />
          <Text style={styles.trackBtnText}>Track Driver</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function RidesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { bookings, cancelBooking } = useData();

  const [trackingBooking, setTrackingBooking] = useState<BookingData | null>(null);

  const handleCancel = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: () => cancelBooking(id) },
    ]);
  };

  return (
    <>
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
              <TripCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onTrack={setTrackingBooking}
              />
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

      <DriverTrackingModal
        visible={!!trackingBooking}
        onClose={() => setTrackingBooking(null)}
        booking={trackingBooking}
      />
    </>
  );
}

const trackStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 18 },
  map: { flex: 1 },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  driverName: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  driverVehicle: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  driverActions: { flexDirection: "row", gap: 10 },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeDotSmall: { width: 10, height: 10, borderRadius: 5 },
  routeLineSmall: { height: 16, borderLeftWidth: 2, marginLeft: 4 },
  routeText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fareLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  fareAmount: { fontFamily: "Poppins_700Bold", fontSize: 22, color: Colors.gold },
  etaBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  etaText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  pickupPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(76,175,80,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  driverPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
});

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
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  trackBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#FFF",
  },
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
