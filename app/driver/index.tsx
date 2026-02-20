import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
  Alert,
  Modal,
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
import { DriverData, BookingData } from "@/constants/data";

function RideRequestModal({
  visible, onClose, booking, onAccept, onReject,
}: { visible: boolean; onClose: () => void; booking: BookingData | null; onAccept: () => void; onReject: () => void; }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!booking) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={reqStyles.overlay}>
        <View style={[reqStyles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 20 }]}>
          <View style={reqStyles.handle} />
          <View style={reqStyles.pulseRow}>
            <View style={reqStyles.pulseCircle}>
              <Ionicons name="car" size={28} color="#FFF" />
            </View>
          </View>
          <Text style={[reqStyles.title, { color: colors.text }]}>New Ride Request</Text>

          <View style={[reqStyles.routeCard, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={reqStyles.routeRow}>
              <View style={[reqStyles.dot, { backgroundColor: "#4CAF50" }]} />
              <Text style={[reqStyles.routeText, { color: colors.text }]}>{booking.pickupLocation}</Text>
            </View>
            <View style={[reqStyles.routeLine, { borderLeftColor: colors.border }]} />
            <View style={reqStyles.routeRow}>
              <View style={[reqStyles.dot, { backgroundColor: "#E74C3C" }]} />
              <Text style={[reqStyles.routeText, { color: colors.text }]}>{booking.destinationName}</Text>
            </View>
          </View>

          <View style={reqStyles.detailsRow}>
            <View style={reqStyles.detailItem}>
              <Ionicons name="cash-outline" size={18} color={Colors.gold} />
              <Text style={[reqStyles.detailValue, { color: colors.text }]}>{"\u20B9"}{booking.fare.toLocaleString()}</Text>
              <Text style={[reqStyles.detailLabel, { color: colors.textSecondary }]}>Fare</Text>
            </View>
            <View style={reqStyles.detailItem}>
              <Ionicons name="people-outline" size={18} color={Colors.gold} />
              <Text style={[reqStyles.detailValue, { color: colors.text }]}>{booking.passengers}</Text>
              <Text style={[reqStyles.detailLabel, { color: colors.textSecondary }]}>Passengers</Text>
            </View>
            <View style={reqStyles.detailItem}>
              <Ionicons name="car-outline" size={18} color={Colors.gold} />
              <Text style={[reqStyles.detailValue, { color: colors.text }]}>{booking.vehicleType}</Text>
              <Text style={[reqStyles.detailLabel, { color: colors.textSecondary }]}>Vehicle</Text>
            </View>
          </View>

          <View style={reqStyles.btnRow}>
            <Pressable onPress={onReject} style={[reqStyles.rejectBtn]}>
              <Ionicons name="close" size={22} color="#E74C3C" />
              <Text style={reqStyles.rejectText}>Decline</Text>
            </Pressable>
            <Pressable onPress={onAccept} style={reqStyles.acceptBtn}>
              <Ionicons name="checkmark" size={22} color="#0A0A0A" />
              <Text style={reqStyles.acceptText}>Accept Ride</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DriverDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useData();

  const driver = user as DriverData | null;
  const [isOnline, setIsOnline] = useState(driver?.isAvailable ?? false);
  const [selectedRequest, setSelectedRequest] = useState<BookingData | null>(null);

  const driverBookings = bookings.filter((b) => b.driverId === driver?.id);
  const activeRides = driverBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress");
  const pendingRequests = bookings.filter((b) => b.status === "confirmed" && !b.driverId);

  const handleAccept = () => {
    if (selectedRequest) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Ride Accepted!", `You've accepted the ride to ${selectedRequest.destinationName}.`);
    }
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSelectedRequest(null);
  };

  const handleCompleteRide = (bookingId: string) => {
    Alert.alert("Complete Ride", "Mark this ride as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: () => {
          updateBookingStatus(bookingId, "completed");
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleStartRide = (bookingId: string) => {
    updateBookingStatus(bookingId, "in_progress");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {isOnline ? "You're Online" : "You're Offline"}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{driver?.name || "Driver"}</Text>
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

        {driver?.isBlocked && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <View style={styles.blockedBanner}>
              <Ionicons name="warning" size={20} color="#FFF" />
              <Text style={styles.blockedText}>Your account has been blocked. Contact support.</Text>
            </View>
          </Animated.View>
        )}

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

        {isOnline && pendingRequests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Requests</Text>
            {pendingRequests.slice(0, 3).map((req, i) => (
              <Pressable
                key={req.id}
                onPress={() => setSelectedRequest(req)}
                style={[styles.requestCard, { backgroundColor: Colors.gold + "08", borderColor: Colors.gold + "30" }]}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.requestPulse, { backgroundColor: "#2ECC71" }]} />
                  <Text style={[styles.requestDest, { color: colors.text }]}>{req.destinationName}</Text>
                  <Text style={styles.requestFare}>{"\u20B9"}{req.fare.toLocaleString()}</Text>
                </View>
                <Text style={[styles.requestPickup, { color: colors.textSecondary }]}>{req.pickupLocation} → {req.destinationName}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

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
                    <View style={[styles.rideBadge, { backgroundColor: ride.status === "in_progress" ? "#2ECC7118" : "#3498DB18" }]}>
                      <Ionicons name={ride.status === "in_progress" ? "navigate" : "time"} size={14} color={ride.status === "in_progress" ? "#2ECC71" : "#3498DB"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rideDestination, { color: colors.text }]}>{ride.destinationName}</Text>
                      <Text style={[styles.ridePickup, { color: colors.textSecondary }]}>{ride.pickupLocation}</Text>
                    </View>
                    <Text style={styles.rideFare}>{"\u20B9"}{ride.fare.toLocaleString()}</Text>
                  </View>
                  <View style={styles.rideFooter}>
                    <Text style={[styles.rideTime, { color: colors.textSecondary }]}>{ride.date} at {ride.time}</Text>
                    <Text style={[styles.ridePassengers, { color: colors.textSecondary }]}>{ride.passengers} passengers</Text>
                  </View>
                  <View style={styles.rideActions}>
                    {ride.status === "confirmed" && (
                      <Pressable onPress={() => handleStartRide(ride.id)} style={[styles.startBtn, { backgroundColor: "#3498DB" }]}>
                        <Ionicons name="play" size={16} color="#FFF" />
                        <Text style={styles.startBtnText}>Start Ride</Text>
                      </Pressable>
                    )}
                    {ride.status === "in_progress" && (
                      <Pressable onPress={() => handleCompleteRide(ride.id)} style={[styles.startBtn, { backgroundColor: "#2ECC71" }]}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                        <Text style={styles.startBtnText}>Complete Ride</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle & KYC</Text>
          <View style={[styles.vehicleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-sport" size={22} color={Colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.vehicleName, { color: colors.text }]}>{driver?.vehicle || "N/A"}</Text>
                <Text style={[styles.vehicleNum, { color: colors.textSecondary }]}>{driver?.vehicleNumber || ""}</Text>
              </View>
              <View style={[styles.kycBadge, { backgroundColor: driver?.kycStatus === "approved" ? "#2ECC7118" : "#F39C1218" }]}>
                <Ionicons name={driver?.kycStatus === "approved" ? "checkmark-circle" : "time"} size={14} color={driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12"} />
                <Text style={[styles.kycText, { color: driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12" }]}>KYC {driver?.kycStatus || "Pending"}</Text>
              </View>
            </View>

            {driver?.documents && (
              <View style={[styles.docsPreview, { borderTopColor: colors.border }]}>
                <Text style={[styles.docsPreviewLabel, { color: colors.textSecondary }]}>Documents</Text>
                <View style={styles.docsRow}>
                  {driver.documents.map((doc) => (
                    <View key={doc.type} style={[styles.docDot, {
                      backgroundColor: doc.status === "verified" ? "#2ECC71" : doc.status === "uploaded" ? "#F39C12" : doc.status === "rejected" ? "#E74C3C" : "#D0D0D0"
                    }]} />
                  ))}
                </View>
                <Text style={[styles.docsCount, { color: colors.textTertiary }]}>
                  {driver.documents.filter((d) => d.status === "verified").length}/{driver.documents.length} verified
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <RideRequestModal
        visible={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        booking={selectedRequest}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
}

const reqStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D0D0D0", alignSelf: "center", marginBottom: 16 },
  pulseRow: { alignItems: "center", marginBottom: 12 },
  pulseCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.gold, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, textAlign: "center", marginBottom: 16 },
  routeCard: { borderRadius: 14, padding: 16, marginBottom: 16 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { height: 16, borderLeftWidth: 2, marginLeft: 4 },
  routeText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  detailsRow: { flexDirection: "row", marginBottom: 20 },
  detailItem: { flex: 1, alignItems: "center", gap: 4 },
  detailValue: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  detailLabel: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  btnRow: { flexDirection: "row", gap: 12 },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: "#E74C3C18" },
  rejectText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
  acceptBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.gold },
  acceptText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#0A0A0A" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  name: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26 },
  onlineToggle: { marginLeft: 12 },
  blockedBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#E74C3C", padding: 14, borderRadius: 12, marginBottom: 16 },
  blockedText: { fontFamily: "Poppins_500Medium", fontSize: 13, color: "#FFF", flex: 1 },
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
  requestCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  requestPulse: { width: 8, height: 8, borderRadius: 4 },
  requestDest: { fontFamily: "Poppins_600SemiBold", fontSize: 15, flex: 1 },
  requestFare: { fontFamily: "Poppins_700Bold", fontSize: 16, color: Colors.gold },
  requestPickup: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  emptyCard: { alignItems: "center", padding: 32, borderRadius: 16, borderWidth: 1, gap: 12, marginBottom: 24 },
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
  rideActions: { marginTop: 12 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  startBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#FFF" },
  vehicleCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  vehicleName: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  vehicleNum: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  kycBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  kycText: { fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "capitalize" },
  docsPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  docsPreviewLabel: { fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 6 },
  docsRow: { flexDirection: "row", gap: 6 },
  docDot: { width: 12, height: 12, borderRadius: 6 },
  docsCount: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 4 },
});
