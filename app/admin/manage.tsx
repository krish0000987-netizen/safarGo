import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { destinations } from "@/constants/data";

export default function ManageScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { getStats } = useData();
  const stats = getStats();

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
        paddingHorizontal: 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Manage</Text>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Destinations ({destinations.length})</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {destinations.map((dest, i) => (
            <View
              key={dest.id}
              style={[
                styles.destRow,
                i < destinations.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.destIcon, { backgroundColor: Colors.gold + "18" }]}>
                <Ionicons name="location" size={16} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.destName, { color: colors.text }]}>{dest.name}</Text>
                <Text style={[styles.destTagline, { color: colors.textSecondary }]}>{dest.tagline}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.destPrice}>{"\u20B9"}{dest.basePrice.toLocaleString()}</Text>
                <View style={styles.destRating}>
                  <Ionicons name="star" size={10} color={Colors.gold} />
                  <Text style={[styles.destRatingText, { color: colors.textSecondary }]}>{dest.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Quick Stats</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.quickStatRow}>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {"\u20B9"}{stats.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatRow}>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Active Drivers</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats.activeDrivers} / {stats.totalDrivers}
            </Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatRow}>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Total Bookings</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{stats.totalBookings}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Settings</Text>
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
      </Animated.View>

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
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, marginBottom: 24 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  destRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  destIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  destName: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  destTagline: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  destPrice: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: Colors.gold },
  destRating: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  destRatingText: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  quickStatRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  quickStatLabel: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  quickStatValue: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  quickStatDivider: { height: 1, marginHorizontal: 16 },
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
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(231,76,60,0.08)",
    marginTop: 8,
  },
  logoutText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
});
