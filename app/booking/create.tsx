import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { destinations, vehicleTypes } from "@/constants/data";

type VehicleType = "sedan" | "suv" | "luxury";

export default function CreateBooking() {
  const { destinationId, pickup: pickupParam } = useLocalSearchParams<{ destinationId: string; pickup?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { addBooking } = useData();

  const destination = destinations.find((d) => d.id === destinationId);

  const [vehicle, setVehicle] = useState<VehicleType>("sedan");
  const [passengers, setPassengers] = useState(2);
  const [pickup, setPickup] = useState(pickupParam || "Hazratganj, Lucknow");
  const [date, setDate] = useState("2026-03-01");
  const [time, setTime] = useState("06:00 AM");
  const [loading, setLoading] = useState(false);

  if (!destination) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.text }}>Destination not found</Text>
      </View>
    );
  }

  const fare = Math.round(destination.basePrice * vehicleTypes[vehicle].multiplier);

  const handleBook = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);

    try {
      await addBooking({
        userId: user?.id || "guest",
        destinationId: destination.id,
        destinationName: destination.name,
        date,
        time,
        status: "confirmed",
        vehicleType: vehicle,
        passengers,
        fare,
        driverName: "Auto Assigned",
        driverPhone: "+91 98765 00000",
        pickupLocation: pickup,
      });
      Alert.alert(
        "Booking Confirmed!",
        `Your trip to ${destination.name} has been booked for ${date} at ${time}.\n\nFare: \u20B9${fare.toLocaleString()}`,
        [{ text: "Great!", onPress: () => router.dismissAll() }]
      );
    } catch {
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBg = isDark ? "#242420" : "#F5F3EE";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Book Trip</Text>
          <View style={{ width: 44 }} />
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.destCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="location" size={22} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.destLabel, { color: colors.textSecondary }]}>Destination</Text>
            <Text style={[styles.destValue, { color: colors.text }]}>{destination.name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.destLabel, { color: colors.textSecondary }]}>{destination.distance} | {destination.duration}</Text>
            <View style={styles.pricePerKmBadge}>
              <Text style={styles.pricePerKmText}>{"\u20B9"}{destination.pricePerKm}/km</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Pickup Location</Text>
          <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
            <Ionicons name="navigate-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Enter pickup location"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.dateTimeRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
            <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Time</Text>
            <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM AM"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {(Object.keys(vehicleTypes) as VehicleType[]).map((v) => {
              const vt = vehicleTypes[v];
              const selected = vehicle === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setVehicle(v);
                  }}
                  style={[
                    styles.vehicleCard,
                    {
                      backgroundColor: selected ? Colors.gold + "15" : colors.surface,
                      borderColor: selected ? Colors.gold : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={vt.icon as any} size={24} color={selected ? Colors.gold : colors.textSecondary} />
                  <Text style={[styles.vehicleName, { color: selected ? Colors.gold : colors.text }]}>{vt.name}</Text>
                  <Text style={[styles.vehicleCapacity, { color: colors.textSecondary }]}>
                    Up to {vt.capacity}
                  </Text>
                  <Text style={[styles.vehiclePrice, { color: selected ? Colors.gold : colors.text }]}>
                    {"\u20B9"}{Math.round(destination.basePrice * vt.multiplier).toLocaleString()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Passengers</Text>
          <View style={[styles.passengerRow, { backgroundColor: inputBg }]}>
            <Pressable
              onPress={() => {
                if (passengers > 1) {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPassengers(passengers - 1);
                }
              }}
              style={[styles.passengerBtn, { opacity: passengers <= 1 ? 0.3 : 1 }]}
            >
              <Ionicons name="remove" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.passengerCount, { color: colors.text }]}>{passengers}</Text>
            <Pressable
              onPress={() => {
                if (passengers < vehicleTypes[vehicle].capacity) {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPassengers(passengers + 1);
                }
              }}
              style={[styles.passengerBtn, { opacity: passengers >= vehicleTypes[vehicle].capacity ? 0.3 : 1 }]}
            >
              <Ionicons name="add" size={22} color={colors.text} />
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 12,
          },
        ]}
      >
        <View>
          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare ({destination.distanceKm > 0 ? `${destination.distanceKm} km` : "Local"})</Text>
          <Text style={styles.fareValue}>{"\u20B9"}{fare.toLocaleString()}</Text>
        </View>
        <Pressable
          onPress={handleBook}
          disabled={loading}
          style={({ pressed }) => [
            styles.confirmBtn,
            { opacity: pressed || loading ? 0.9 : 1 },
          ]}
        >
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={20} color="#0A0A0A" />
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  screenTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22 },
  destCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  destLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  destValue: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  pricePerKmBadge: {
    backgroundColor: Colors.gold + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  pricePerKmText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: Colors.gold,
  },
  label: { fontFamily: "Poppins_500Medium", fontSize: 13, marginBottom: 8, marginTop: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  input: { flex: 1, fontFamily: "Poppins_400Regular", fontSize: 15, padding: 0 },
  dateTimeRow: { flexDirection: "row", gap: 12 },
  vehicleRow: { flexDirection: "row", gap: 10 },
  vehicleCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  vehicleName: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  vehicleCapacity: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  vehiclePrice: { fontFamily: "Poppins_700Bold", fontSize: 14 },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  passengerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  passengerCount: { fontFamily: "Poppins_700Bold", fontSize: 28, minWidth: 40, textAlign: "center" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fareLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  fareValue: { fontFamily: "Poppins_700Bold", fontSize: 24, color: Colors.gold },
  confirmBtn: { borderRadius: 14, overflow: "hidden" },
  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  confirmText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#0A0A0A" },
});
