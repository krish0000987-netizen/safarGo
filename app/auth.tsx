import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

type AuthMode = "login" | "register";
type Role = "customer" | "driver" | "admin";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const { colors, isDark } = useTheme();

  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleAuth = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === "login") {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please enter email and password.");
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please fill in all fields.");
        return;
      }
    }

    setLoading(true);
    try {
      let success: boolean;
      if (mode === "login") {
        success = await login(email, password, role);
      } else {
        success = await register(name, email, phone, password, role);
      }

      if (success) {
        if (role === "customer") router.replace("/customer");
        else if (role === "driver") router.replace("/driver");
        else router.replace("/admin");
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Try:\ncustomer@safargo.com\ndriver@safargo.com\nadmin@safargo.com\nwith any password.");
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (r: Role) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const emails = { customer: "customer@safargo.com", driver: "driver@safargo.com", admin: "admin@safargo.com" };
    const success = await login(emails[r], "pass", r);
    if (success) {
      if (r === "customer") router.replace("/customer");
      else if (r === "driver") router.replace("/driver");
      else router.replace("/admin");
    }
    setLoading(false);
  };

  const bg = isDark ? "#0A0A0A" : "#FAFAF8";
  const cardBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const inputBg = isDark ? "#242420" : "#F5F3EE";
  const textColor = colors.text;
  const secondaryText = colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 20,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text style={[styles.title, { color: textColor }]}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={[styles.subtitle, { color: secondaryText }]}>
              {mode === "login"
                ? "Sign in to continue your journey"
                : "Join Safar Go for premium travel"}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.roleSection}>
            <Text style={[styles.label, { color: secondaryText }]}>I am a</Text>
            <View style={styles.roleRow}>
              {(["customer", "driver", "admin"] as Role[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: role === r ? Colors.gold : inputBg,
                      borderColor: role === r ? Colors.gold : isDark ? "#2A2A26" : "#E8E4DC",
                    },
                  ]}
                >
                  <Ionicons
                    name={r === "customer" ? "person-outline" : r === "driver" ? "car-outline" : "settings-outline"}
                    size={16}
                    color={role === r ? "#0A0A0A" : secondaryText}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      { color: role === r ? "#0A0A0A" : textColor },
                    ]}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.formCard, { backgroundColor: cardBg }]}>
            {mode === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: secondaryText }]}>Full Name</Text>
                <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                  <Ionicons name="person-outline" size={18} color={secondaryText} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Enter your name"
                    placeholderTextColor={isDark ? "#555" : "#AAA"}
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Email</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Ionicons name="mail-outline" size={18} color={secondaryText} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? "#555" : "#AAA"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    mode === "register" ? phoneRef.current?.focus() : passwordRef.current?.focus()
                  }
                />
              </View>
            </View>

            {mode === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: secondaryText }]}>Phone</Text>
                <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                  <Ionicons name="call-outline" size={18} color={secondaryText} />
                  <TextInput
                    ref={phoneRef}
                    style={[styles.input, { color: textColor }]}
                    placeholder="+91 XXXXX XXXXX"
                    placeholderTextColor={isDark ? "#555" : "#AAA"}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Ionicons name="lock-closed-outline" size={18} color={secondaryText} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { color: textColor, flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? "#555" : "#AAA"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={secondaryText}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleAuth}
              disabled={loading}
              style={({ pressed }) => [
                styles.authBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.gold, Colors.goldDark]}
                style={styles.authBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#0A0A0A" />
                ) : (
                  <Text style={styles.authBtnText}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => setMode(mode === "login" ? "register" : "login")}
              style={styles.switchMode}
            >
              <Text style={[styles.switchText, { color: secondaryText }]}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <Text style={{ color: Colors.gold, fontFamily: "Poppins_600SemiBold" }}>
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: secondaryText }]}>Quick Demo Login</Text>
            <View style={styles.quickRow}>
              {(["customer", "driver", "admin"] as Role[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => quickLogin(r)}
                  style={({ pressed }) => [
                    styles.quickBtn,
                    {
                      backgroundColor: cardBg,
                      borderColor: isDark ? "#2A2A26" : "#E8E4DC",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={r === "customer" ? "person" : r === "driver" ? "car" : "shield"}
                    size={20}
                    color={Colors.gold}
                  />
                  <Text style={[styles.quickBtnText, { color: textColor }]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, justifyContent: "center", marginBottom: 12 },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    marginBottom: 24,
  },
  roleSection: { marginBottom: 20 },
  label: { fontFamily: "Poppins_500Medium", fontSize: 13, marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  formCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: { gap: 6 },
  inputLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    padding: 0,
  },
  authBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  authBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  authBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#0A0A0A",
  },
  switchMode: { alignItems: "center", paddingVertical: 4 },
  switchText: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  quickSection: { marginTop: 28, alignItems: "center", gap: 12 },
  quickLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  quickRow: { flexDirection: "row", gap: 10, width: "100%" },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickBtnText: { fontFamily: "Poppins_500Medium", fontSize: 12 },
});
