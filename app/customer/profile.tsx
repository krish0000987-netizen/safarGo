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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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

  const menuItems = [
    { icon: "wallet-outline", label: "Wallet", value: `\u20B9${user?.walletBalance?.toLocaleString() || "0"}`, color: Colors.gold },
    { icon: "car-outline", label: "Total Trips", value: `${user?.totalTrips || 0}`, color: "#3498DB" },
    { icon: "calendar-outline", label: "Member Since", value: user?.memberSince || "--", color: "#2ECC71" },
  ];

  const settingsItems = [
    { icon: "person-outline", label: "Edit Profile", onPress: () => {} },
    { icon: "notifications-outline", label: "Notifications", onPress: () => {} },
    { icon: "shield-checkmark-outline", label: "Privacy & Security", onPress: () => {} },
    { icon: "help-circle-outline", label: "Help & Support", onPress: () => {} },
    { icon: "information-circle-outline", label: "About Safar Go", onPress: () => {} },
  ];

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
          <Text style={styles.avatarText}>{user?.name?.[0] || "U"}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name || "User"}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || ""}</Text>
        <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone || ""}</Text>
      </View>

      <View style={styles.statsRow}>
        {menuItems.map((item, i) => (
          <View
            key={i}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
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

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {settingsItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              item.onPress();
            }}
            style={({ pressed }) => [
              styles.settingRow,
              i < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          { backgroundColor: "rgba(231,76,60,0.08)", opacity: pressed ? 0.7 : 1 },
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
  phone: { fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  statValue: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  statLabel: { fontFamily: "Poppins_400Regular", fontSize: 11 },
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
    marginTop: 8,
  },
  logoutText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
});
