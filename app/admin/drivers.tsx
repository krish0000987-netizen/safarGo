import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
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
import { DriverData } from "@/constants/data";

function DriverCard({ driver, index, onApprove, onReject }: {
  driver: DriverData;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { colors } = useTheme();

  const kycColors: Record<string, string> = {
    approved: "#2ECC71",
    submitted: "#F39C12",
    rejected: "#E74C3C",
    pending: "#9E9E9E",
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.driverAvatar, { backgroundColor: Colors.gold }]}>
            <Text style={styles.driverAvatarText}>{driver.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>
            <Text style={[styles.driverPhone, { color: colors.textSecondary }]}>{driver.phone}</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: driver.isAvailable ? "#2ECC71" : "#E74C3C" },
            ]}
          />
        </View>

        <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
          <View style={styles.infoItem}>
            <Ionicons name="car-sport-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{driver.vehicle}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="document-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{driver.vehicleNumber}</Text>
          </View>
          <View style={styles.cardStats}>
            <View style={styles.miniStat}>
              <Ionicons name="star" size={14} color={Colors.gold} />
              <Text style={[styles.miniStatText, { color: colors.text }]}>{driver.rating || "N/A"}</Text>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="navigate" size={14} color={Colors.gold} />
              <Text style={[styles.miniStatText, { color: colors.text }]}>{driver.completedTrips} trips</Text>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="wallet" size={14} color={Colors.gold} />
              <Text style={[styles.miniStatText, { color: colors.text }]}>
                {"\u20B9"}{driver.totalEarnings.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.kycBadge,
              { backgroundColor: (kycColors[driver.kycStatus] || "#9E9E9E") + "18" },
            ]}
          >
            <Ionicons
              name={
                driver.kycStatus === "approved"
                  ? "checkmark-circle"
                  : driver.kycStatus === "rejected"
                  ? "close-circle"
                  : "time"
              }
              size={14}
              color={kycColors[driver.kycStatus] || "#9E9E9E"}
            />
            <Text
              style={[
                styles.kycText,
                { color: kycColors[driver.kycStatus] || "#9E9E9E" },
              ]}
            >
              KYC {driver.kycStatus.charAt(0).toUpperCase() + driver.kycStatus.slice(1)}
            </Text>
          </View>
          {driver.kycStatus === "submitted" && (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onApprove(driver.id);
                }}
                style={[styles.actionBtn, { backgroundColor: "#2ECC7118" }]}
              >
                <Ionicons name="checkmark" size={18} color="#2ECC71" />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onReject(driver.id);
                }}
                style={[styles.actionBtn, { backgroundColor: "#E74C3C18" }]}
              >
                <Ionicons name="close" size={18} color="#E74C3C" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function DriversScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { drivers, updateDriverStatus } = useData();

  const handleApprove = (id: string) => {
    Alert.alert("Approve KYC", "Approve this driver's KYC?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => updateDriverStatus(id, { kycStatus: "approved" } as any),
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert("Reject KYC", "Reject this driver's KYC?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => updateDriverStatus(id, { kycStatus: "rejected" } as any),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: 100,
          paddingHorizontal: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.title, { color: colors.text }]}>
            Manage Drivers ({drivers.length})
          </Text>
        }
        renderItem={({ item, index }) => (
          <DriverCard
            driver={item}
            index={index}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, marginBottom: 20 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  driverAvatarText: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#0A0A0A" },
  driverName: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  driverPhone: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardBody: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 6 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  cardStats: { flexDirection: "row", gap: 16, marginTop: 6 },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  miniStatText: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  kycText: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
