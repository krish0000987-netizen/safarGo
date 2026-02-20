import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
  Alert,
  Modal,
  TextInput,
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

export default function ManageScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const {
    getStats, coupons, addCoupon, updateCoupon, deleteCoupon,
    tickets, updateTicket, withdrawals, updateWithdrawal,
    commissionRate, setCommissionRate,
  } = useData();
  const stats = getStats();

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscountType, setNewDiscountType] = useState<"flat" | "percentage">("percentage");
  const [newDiscountValue, setNewDiscountValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("1000");
  const [newMaxDiscount, setNewMaxDiscount] = useState("500");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newDescription, setNewDescription] = useState("");
  const [showTicketResponse, setShowTicketResponse] = useState<string | null>(null);
  const [ticketResponseText, setTicketResponseText] = useState("");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/"); } },
    ]);
  };

  const handleAddCoupon = () => {
    if (!newCode.trim() || !newDiscountValue) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    addCoupon({
      code: newCode.toUpperCase(),
      discountType: newDiscountType,
      discountValue: parseInt(newDiscountValue),
      minOrderAmount: parseInt(newMinOrder) || 0,
      maxDiscount: parseInt(newMaxDiscount) || 500,
      usageLimit: 100,
      usedCount: 0,
      expiryDate: newExpiry,
      isActive: true,
      description: newDescription || `${newDiscountType === "percentage" ? newDiscountValue + "%" : "\u20B9" + newDiscountValue} off`,
    });
    setShowAddCoupon(false);
    setNewCode(""); setNewDiscountValue(""); setNewDescription("");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRespondTicket = () => {
    if (!showTicketResponse || !ticketResponseText.trim()) return;
    updateTicket(showTicketResponse, { response: ticketResponseText, status: "resolved" });
    setShowTicketResponse(null);
    setTicketResponseText("");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleApproveWithdrawal = (id: string) => {
    Alert.alert("Approve Withdrawal", "Approve this withdrawal request?", [
      { text: "Cancel", style: "cancel" },
      { text: "Approve", onPress: () => updateWithdrawal(id, { status: "approved" }) },
    ]);
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Manage</Text>

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Commission Settings</Text>
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.commissionRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.commissionLabel, { color: colors.text }]}>Platform Commission</Text>
                <Text style={[styles.commissionSub, { color: colors.textSecondary }]}>Applied to all driver earnings</Text>
              </View>
              <View style={styles.commissionBtns}>
                <Pressable onPress={() => { if (commissionRate > 5) setCommissionRate(commissionRate - 1); }} style={[styles.commBtn, { borderColor: colors.border }]}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={[styles.commValue, { color: Colors.gold }]}>{commissionRate}%</Text>
                <Pressable onPress={() => { if (commissionRate < 30) setCommissionRate(commissionRate + 1); }} style={[styles.commBtn, { borderColor: colors.border }]}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.commInfoRow, { borderTopColor: colors.border }]}>
              <View style={styles.commInfoItem}>
                <Text style={[styles.commInfoValue, { color: colors.text }]}>{"\u20B9"}{stats.totalRevenue.toLocaleString()}</Text>
                <Text style={[styles.commInfoLabel, { color: colors.textSecondary }]}>Revenue</Text>
              </View>
              <View style={styles.commInfoItem}>
                <Text style={[styles.commInfoValue, { color: Colors.gold }]}>{"\u20B9"}{stats.totalCommission.toLocaleString()}</Text>
                <Text style={[styles.commInfoLabel, { color: colors.textSecondary }]}>Commission</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Coupons ({coupons.length})</Text>
            <Pressable onPress={() => setShowAddCoupon(true)} style={[styles.addBtn, { backgroundColor: Colors.gold + "18" }]}>
              <Ionicons name="add" size={16} color={Colors.gold} />
              <Text style={[styles.addBtnText, { color: Colors.gold }]}>Add</Text>
            </Pressable>
          </View>
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {coupons.map((coupon, i) => (
              <View key={coupon.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.couponRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[styles.couponCode, { color: colors.text }]}>{coupon.code}</Text>
                      <View style={[styles.couponTypeBadge, { backgroundColor: coupon.isActive ? "#2ECC7118" : "#E74C3C18" }]}>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 10, color: coupon.isActive ? "#2ECC71" : "#E74C3C" }}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.couponDesc, { color: colors.textSecondary }]}>{coupon.description}</Text>
                    <Text style={[styles.couponMeta, { color: colors.textTertiary }]}>
                      Used: {coupon.usedCount}/{coupon.usageLimit} · Expires: {coupon.expiryDate}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Pressable
                      onPress={() => {
                        updateCoupon(coupon.id, { isActive: !coupon.isActive });
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.couponAction, { backgroundColor: coupon.isActive ? "#F39C1218" : "#2ECC7118" }]}
                    >
                      <Ionicons name={coupon.isActive ? "pause" : "play"} size={14} color={coupon.isActive ? "#F39C12" : "#2ECC71"} />
                    </Pressable>
                    <Pressable
                      onPress={() => Alert.alert("Delete Coupon", `Delete ${coupon.code}?`, [
                        { text: "Cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteCoupon(coupon.id) },
                      ])}
                      style={[styles.couponAction, { backgroundColor: "#E74C3C18" }]}
                    >
                      <Ionicons name="trash-outline" size={14} color="#E74C3C" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {openTickets.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Support Tickets ({openTickets.length})</Text>
            {openTickets.map((ticket) => {
              const priorityColor = ticket.priority === "high" ? "#E74C3C" : ticket.priority === "medium" ? "#F39C12" : "#3498DB";
              return (
                <View key={ticket.id} style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.ticketHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                    <Text style={[styles.ticketSubject, { color: colors.text }]}>{ticket.subject}</Text>
                    <View style={[styles.ticketRoleBadge, { backgroundColor: ticket.userRole === "driver" ? "#9B59B618" : "#3498DB18" }]}>
                      <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 10, color: ticket.userRole === "driver" ? "#9B59B6" : "#3498DB" }}>
                        {ticket.userRole}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ticketMessage, { color: colors.textSecondary }]}>{ticket.message}</Text>
                  <View style={styles.ticketFooter}>
                    <Text style={[styles.ticketDate, { color: colors.textTertiary }]}>{ticket.userName} · {ticket.date}</Text>
                    <Pressable
                      onPress={() => { setShowTicketResponse(ticket.id); setTicketResponseText(ticket.response || ""); }}
                      style={[styles.respondBtn, { backgroundColor: Colors.gold + "18" }]}
                    >
                      <Text style={styles.respondBtnText}>Respond</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}

        {pendingWithdrawals.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Pending Withdrawals ({pendingWithdrawals.length})</Text>
            {pendingWithdrawals.map((w) => (
              <View key={w.id} style={[styles.withdrawCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.withdrawAmount, { color: colors.text }]}>{"\u20B9"}{w.amount.toLocaleString()}</Text>
                  <Text style={[styles.withdrawMeta, { color: colors.textSecondary }]}>Driver: {w.driverId} · {w.date}</Text>
                </View>
                <Pressable onPress={() => handleApproveWithdrawal(w.id)} style={[styles.approveBtn, { backgroundColor: "#2ECC7118" }]}>
                  <Ionicons name="checkmark" size={16} color="#2ECC71" />
                </Pressable>
              </View>
            ))}
          </Animated.View>
        )}

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
                onValueChange={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
                trackColor={{ false: "#D4D4D4", true: Colors.gold + "60" }}
                thumbColor={isDark ? Colors.gold : "#FFF"}
              />
            </View>
          </View>
        </Animated.View>

        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showAddCoupon} animationType="slide" transparent onRequestClose={() => setShowAddCoupon(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 20 }]}>
            <View style={modalStyles.handle} />
            <Text style={[modalStyles.title, { color: colors.text }]}>Create Coupon</Text>

            <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Coupon Code</Text>
            <TextInput
              style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
              value={newCode} onChangeText={(t) => setNewCode(t.toUpperCase())}
              placeholder="e.g. SUMMER20" placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
            />

            <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Discount Type</Text>
            <View style={modalStyles.typeRow}>
              {(["percentage", "flat"] as const).map((t) => (
                <Pressable key={t} onPress={() => setNewDiscountType(t)}
                  style={[modalStyles.typeBtn, newDiscountType === t && { backgroundColor: Colors.gold + "20", borderColor: Colors.gold }, { borderColor: colors.border }]}
                >
                  <Text style={[modalStyles.typeText, { color: newDiscountType === t ? Colors.gold : colors.textSecondary }]}>
                    {t === "percentage" ? "Percentage %" : "Flat \u20B9"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Value</Text>
                <TextInput style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
                  value={newDiscountValue} onChangeText={setNewDiscountValue}
                  placeholder="e.g. 20" placeholderTextColor={colors.textTertiary} keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Max Discount</Text>
                <TextInput style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
                  value={newMaxDiscount} onChangeText={setNewMaxDiscount}
                  placeholder="\u20B9500" placeholderTextColor={colors.textTertiary} keyboardType="numeric"
                />
              </View>
            </View>

            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Min Order</Text>
                <TextInput style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
                  value={newMinOrder} onChangeText={setNewMinOrder}
                  placeholder="\u20B91000" placeholderTextColor={colors.textTertiary} keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Expiry Date</Text>
                <TextInput style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
                  value={newExpiry} onChangeText={setNewExpiry}
                  placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <Text style={[modalStyles.label, { color: colors.textSecondary }]}>Description</Text>
            <TextInput style={[modalStyles.input, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
              value={newDescription} onChangeText={setNewDescription}
              placeholder="Short description" placeholderTextColor={colors.textTertiary}
            />

            <View style={modalStyles.btnRow}>
              <Pressable onPress={() => setShowAddCoupon(false)} style={[modalStyles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[modalStyles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddCoupon} style={modalStyles.submitBtn}>
                <Text style={modalStyles.submitText}>Create Coupon</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showTicketResponse} animationType="slide" transparent onRequestClose={() => setShowTicketResponse(null)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 20 }]}>
            <View style={modalStyles.handle} />
            <Text style={[modalStyles.title, { color: colors.text }]}>Respond to Ticket</Text>
            <TextInput
              style={[modalStyles.textarea, { color: colors.text, backgroundColor: isDark ? "#242420" : "#F5F3EE" }]}
              value={ticketResponseText} onChangeText={setTicketResponseText}
              placeholder="Type your response..." placeholderTextColor={colors.textTertiary}
              multiline numberOfLines={4} textAlignVertical="top"
            />
            <View style={modalStyles.btnRow}>
              <Pressable onPress={() => setShowTicketResponse(null)} style={[modalStyles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[modalStyles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRespondTicket} style={modalStyles.submitBtn}>
                <Text style={modalStyles.submitText}>Send & Resolve</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D0D0D0", alignSelf: "center", marginBottom: 20 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, textAlign: "center", marginBottom: 20 },
  label: { fontFamily: "Poppins_500Medium", fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: { fontFamily: "Poppins_400Regular", fontSize: 14, padding: 12, borderRadius: 10 },
  textarea: { fontFamily: "Poppins_400Regular", fontSize: 14, padding: 14, borderRadius: 12, minHeight: 100 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  typeText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  row: { flexDirection: "row", gap: 12 },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  cancelText: { fontFamily: "Poppins_500Medium", fontSize: 15 },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.gold, alignItems: "center" },
  submitText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#0A0A0A" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, marginBottom: 24 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 10 },
  addBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24, padding: 16 },
  divider: { height: 1, marginVertical: 8 },
  commissionRow: { flexDirection: "row", alignItems: "center" },
  commissionLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  commissionSub: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  commissionBtns: { flexDirection: "row", alignItems: "center", gap: 12 },
  commBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  commValue: { fontFamily: "Poppins_700Bold", fontSize: 20, minWidth: 50, textAlign: "center" },
  commInfoRow: { flexDirection: "row", marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  commInfoItem: { flex: 1, alignItems: "center" },
  commInfoValue: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  commInfoLabel: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 2 },
  couponRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  couponCode: { fontFamily: "Poppins_700Bold", fontSize: 15 },
  couponTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  couponDesc: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  couponMeta: { fontFamily: "Poppins_400Regular", fontSize: 10, marginTop: 2 },
  couponAction: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  ticketCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  ticketHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  ticketSubject: { fontFamily: "Poppins_600SemiBold", fontSize: 14, flex: 1 },
  ticketRoleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ticketMessage: { fontFamily: "Poppins_400Regular", fontSize: 13, marginBottom: 8 },
  ticketFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ticketDate: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  respondBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  respondBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: Colors.gold },
  withdrawCard: { flexDirection: "row", alignItems: "center", backgroundColor: "transparent", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  withdrawAmount: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  withdrawMeta: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  approveBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontFamily: "Poppins_500Medium", fontSize: 15 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: "rgba(231,76,60,0.08)", marginTop: 8 },
  logoutText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#E74C3C" },
});
