import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookingData, sampleBookings, sampleDrivers, DriverData, destinations, vehicleTypes } from "@/constants/data";

interface DataContextValue {
  bookings: BookingData[];
  favorites: string[];
  drivers: DriverData[];
  addBooking: (booking: Omit<BookingData, "id">) => Promise<BookingData>;
  cancelBooking: (id: string) => Promise<void>;
  toggleFavorite: (destinationId: string) => void;
  isFavorite: (destinationId: string) => boolean;
  updateDriverStatus: (driverId: string, updates: Partial<DriverData>) => void;
  getStats: () => { totalBookings: number; activeBookings: number; totalRevenue: number; totalDrivers: number; activeDrivers: number };
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<BookingData[]>(sampleBookings);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>(sampleDrivers);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedBookings, storedFavorites] = await Promise.all([
        AsyncStorage.getItem("@safargo_bookings"),
        AsyncStorage.getItem("@safargo_favorites"),
      ]);
      if (storedBookings) setBookings(JSON.parse(storedBookings));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const saveBookings = async (b: BookingData[]) => {
    await AsyncStorage.setItem("@safargo_bookings", JSON.stringify(b));
  };

  const saveFavorites = async (f: string[]) => {
    await AsyncStorage.setItem("@safargo_favorites", JSON.stringify(f));
  };

  const addBooking = useCallback(async (booking: Omit<BookingData, "id">): Promise<BookingData> => {
    const id = "b" + Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newBooking: BookingData = { ...booking, id };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    await saveBookings(updated);
    return newBooking;
  }, [bookings]);

  const cancelBooking = useCallback(async (id: string) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    );
    setBookings(updated);
    await saveBookings(updated);
  }, [bookings]);

  const toggleFavorite = useCallback((destinationId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(destinationId)
        ? prev.filter((f) => f !== destinationId)
        : [...prev, destinationId];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (destinationId: string) => favorites.includes(destinationId),
    [favorites]
  );

  const updateDriverStatus = useCallback((driverId: string, updates: Partial<DriverData>) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, ...updates } : d))
    );
  }, []);

  const getStats = useCallback(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;
    const totalRevenue = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.fare, 0);
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.isAvailable).length;
    return { totalBookings, activeBookings, totalRevenue, totalDrivers, activeDrivers };
  }, [bookings, drivers]);

  const value = useMemo(
    () => ({
      bookings,
      favorites,
      drivers,
      addBooking,
      cancelBooking,
      toggleFavorite,
      isFavorite,
      updateDriverStatus,
      getStats,
    }),
    [bookings, favorites, drivers, addBooking, cancelBooking, toggleFavorite, isFavorite, updateDriverStatus, getStats]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
