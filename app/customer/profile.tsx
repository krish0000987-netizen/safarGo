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
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  const referralCode = "SG" + (user?.id || "").slice(-6).toUpperCase() + "N6";

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
    { icon: "wallet-outline", label: "Wallet", value: `\u20B9${user?.walletBalance?.toLocaleString() || "0"}`, iconColor: "#4CAF50", iconBg: "#E8F5E9" },
    { icon: "heart-outline", label: "Favorites", value: "", iconColor: "#E91E63", iconBg: "#FCE4EC" },
    { icon: "document-text-outline", label: "Booking History", value: "", iconColor: "#1976D2", iconBg: "#E3F2FD" },
    { icon: "gift-outline", label: "Referral Code", value: referralCode, iconColor: "#FF9800", iconBg: "#FFF3E0" },
  ];

  const settingsItems = [
    { icon: "notifications-outline", label: "Notifications", iconColor: "#9C27B0", iconBg: "#F3E5F5" },
    { icon: "shield-checkmark-outline", label: "Privacy", iconColor: "#00897B", iconBg: "#E0F2F1" },
    { icon: "help-circle-outline", label: "Help & Support", iconColor: "#FF5722", iconBg: "#FBE9E7" },
    { icon: "information-circle-outline", label: "About", iconColor: "#607D8B", iconBg: "#ECEFF1" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: Colors.gold }]}>
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name || "User"}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || ""}</Text>
        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={14} color={Colors.gold} />
          <Text style={styles.premiumText}>Premium Member</Text>
        </View>
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.menuRow,
              i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            {item.value ? (
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{item.value}</Text>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
        {settingsItems.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.menuRow,
              i < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
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
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 32, marginBottom: 20 },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: "#0A0A0A",
  },
  name: { fontFamily: "Poppins_600SemiBold", fontSize: 20, marginBottom: 4 },
  email: { fontFamily: "Poppins_400Regular", fontSize: 14, marginBottom: 12 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.gold + "15",
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  premiumText: { fontFamily: "Poppins_500Medium", fontSize: 13, color: Colors.gold },
  menuSection: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontFamily: "Poppins_500Medium", fontSize: 15, flex: 1 },
  menuValue: { fontFamily: "Poppins_400Regular", fontSize: 13, marginRight: 4 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(231,76,60,0.08)",
    marginTop: 8,
  },
  logoutText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
});
