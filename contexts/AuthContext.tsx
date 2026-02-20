import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData, DriverData } from "@/constants/data";

interface AuthContextValue {
  user: UserData | DriverData | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultUsers: Record<string, UserData | DriverData> = {
  "customer@safargo.com": {
    id: "user1",
    name: "Arjun Sharma",
    email: "customer@safargo.com",
    phone: "+91 99887 76655",
    role: "customer",
    walletBalance: 5250,
    totalTrips: 12,
    memberSince: "2025-06-15",
  },
  "driver@safargo.com": {
    id: "d1",
    name: "Rajesh Kumar",
    email: "driver@safargo.com",
    phone: "+91 98765 43210",
    role: "driver",
    walletBalance: 15400,
    totalTrips: 342,
    memberSince: "2024-03-15",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "UP32 AB 1234",
    rating: 4.8,
    isAvailable: true,
    isBlocked: false,
    kycStatus: "approved",
    totalEarnings: 485000,
    todayEarnings: 3200,
    weekEarnings: 18500,
    monthEarnings: 72000,
    completedTrips: 342,
    commissionRate: 15,
    documents: [
      { type: "driving_license", label: "Driving License", status: "verified", uploadDate: "2024-03-15", expiryDate: "2028-03-15" },
      { type: "rc", label: "Vehicle Registration (RC)", status: "verified", uploadDate: "2024-03-15", expiryDate: "2029-06-20" },
      { type: "aadhaar", label: "Aadhaar Card", status: "verified", uploadDate: "2024-03-15" },
      { type: "insurance", label: "Vehicle Insurance", status: "verified", uploadDate: "2024-03-15", expiryDate: "2027-01-10" },
      { type: "pan", label: "PAN Card", status: "verified", uploadDate: "2024-03-15" },
    ],
  } as DriverData,
  "admin@safargo.com": {
    id: "admin1",
    name: "Priya Gupta",
    email: "admin@safargo.com",
    phone: "+91 99999 00000",
    role: "admin",
    walletBalance: 0,
    totalTrips: 0,
    memberSince: "2023-01-01",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | DriverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("@safargo_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, _password: string, _role: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    const foundUser = defaultUsers[normalizedEmail];
    if (foundUser) {
      setUser(foundUser);
      await AsyncStorage.setItem("@safargo_user", JSON.stringify(foundUser));
      return true;
    }
    const stored = await AsyncStorage.getItem("@safargo_registered_" + normalizedEmail);
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      await AsyncStorage.setItem("@safargo_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, phone: string, _password: string, role: string): Promise<boolean> => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUser: UserData = {
      id,
      name,
      email: email.toLowerCase().trim(),
      phone,
      role: role as "customer" | "driver" | "admin",
      walletBalance: 0,
      totalTrips: 0,
      memberSince: new Date().toISOString().split("T")[0],
    };
    setUser(newUser);
    await AsyncStorage.setItem("@safargo_user", JSON.stringify(newUser));
    await AsyncStorage.setItem("@safargo_registered_" + newUser.email, JSON.stringify(newUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("@safargo_user");
  };

  const updateUser = async (updates: Partial<UserData>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem("@safargo_user", JSON.stringify(updated));
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
