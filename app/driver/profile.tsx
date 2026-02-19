import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { DriverData } from "@/constants/data";

export default function DriverProfile() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const driver = user as DriverData | null;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: Colors.gold }]}>
          <Text style={styles.avatarText}>{driver?.name?.[0] || "D"}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{driver?.name || "Driver"}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{driver?.email}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={Colors.gold} />
          <Text style={[styles.rating, { color: colors.text }]}>{driver?.rating || 0}</Text>
          <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
            ({driver?.completedTrips || 0} trips)
          </Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Ionicons name="car-sport" size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Vehicle</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{driver?.vehicle || "N/A"}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Ionicons name="document-text" size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Registration</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{driver?.vehicleNumber || "N/A"}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color={driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12"} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>KYC Status</Text>
            <Text style={[styles.infoValue, { color: driver?.kycStatus === "approved" ? "#2ECC71" : "#F39C12" }]}>
              {(driver?.kycStatus || "pending").charAt(0).toUpperCase() + (driver?.kycStatus || "pending").slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleTheme();
            }}
            trackColor={{ false: "#D4D4D4", true: Colors.gold + "60" }}
            thumbColor={isDark ? Colors.gold : "#FFF"}
          />
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: "center", paddingHorizontal: 20, marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontFamily: "Poppins_700Bold", fontSize: 32, color: "#0A0A0A" },
  name: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 24 },
  email: { fontFamily: "Poppins_400Regular", fontSize: 14, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  rating: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  ratingLabel: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  infoCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  infoLabel: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  infoValue: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  divider: { height: 1, marginVertical: 4 },
  section: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontFamily: "Poppins_500Medium", fontSize: 15 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(231,76,60,0.08)",
    marginTop: 8,
  },
  logoutText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
});
