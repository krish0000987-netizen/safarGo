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
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

type AuthMode = "login" | "register";
type Role = "customer" | "driver";

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
      if (mode === "login") {
        const result = await login(email, password, role);
        if (result) {
          if (result === "admin") router.replace("/admin");
          else if (result === "driver") router.replace("/driver");
          else router.replace("/customer");
        } else {
          Alert.alert("Login Failed", "Invalid credentials. Try:\ncustomer@safargo.com\ndriver@safargo.com\nadmin@safargo.com\nwith any password.");
        }
      } else {
        const success = await register(name, email, phone, password, role);
        if (success) {
          if (role === "driver") router.replace("/driver");
          else router.replace("/customer");
        } else {
          Alert.alert("Registration Failed", "Something went wrong.");
        }
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "#0A0A0A" : "#FAFAF8";
  const inputBg = isDark ? "#1A1A1A" : "#F0EDE6";
  const textColor = colors.text;
  const secondaryText = colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: Colors.gold + "18" }]}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          </Pressable>

          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
          </View>

          <Text style={[styles.title, { color: textColor }]}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            {mode === "login"
              ? "Sign in to continue your journey"
              : "Join Safar Go for premium travel"}
          </Text>

          {mode === "register" && (
            <View style={styles.roleSection}>
              <Pressable
                onPress={() => setRole("customer")}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: role === "customer" ? Colors.gold + "18" : inputBg,
                    borderColor: role === "customer" ? Colors.gold : "transparent",
                  },
                ]}
              >
                <Ionicons name="person" size={16} color={role === "customer" ? Colors.gold : secondaryText} />
                <Text
                  style={[
                    styles.roleText,
                    { color: role === "customer" ? Colors.gold : secondaryText },
                  ]}
                >
                  Customer
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("driver")}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: role === "driver" ? Colors.gold + "18" : inputBg,
                    borderColor: role === "driver" ? Colors.gold : "transparent",
                  },
                ]}
              >
                <Ionicons name="car" size={16} color={role === "driver" ? Colors.gold : secondaryText} />
                <Text
                  style={[
                    styles.roleText,
                    { color: role === "driver" ? Colors.gold : secondaryText },
                  ]}
                >
                  Driver
                </Text>
              </Pressable>
            </View>
          )}

          {mode === "register" && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textColor }]}>Full Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Ionicons name="person-outline" size={18} color={secondaryText} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? "#555" : "#B0A89E"}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>
              {mode === "login" ? "Username" : "Email"}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name={mode === "login" ? "at" : "mail-outline"} size={18} color={secondaryText} />
              <TextInput
                ref={emailRef}
                style={[styles.input, { color: textColor }]}
                placeholder={mode === "login" ? "Enter username" : "Enter your email"}
                placeholderTextColor={isDark ? "#555" : "#B0A89E"}
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
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textColor }]}>Phone</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Ionicons name="call-outline" size={18} color={secondaryText} />
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, { color: textColor }]}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={isDark ? "#555" : "#B0A89E"}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name="lock-closed-outline" size={18} color={secondaryText} />
              <TextInput
                ref={passwordRef}
                style={[styles.input, { color: textColor, flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor={isDark ? "#555" : "#B0A89E"}
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
              { opacity: pressed || loading ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
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

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: secondaryText }]}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
              <Text style={styles.switchLink}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
  },
  logoImage: { width: 110, height: 110 },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
  },
  roleSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  roleChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  roleText: { fontFamily: "Poppins_500Medium", fontSize: 15 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    padding: 0,
  },
  authBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  authBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  authBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
    color: "#0A0A0A",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  switchText: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  switchLink: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: Colors.gold },
});
