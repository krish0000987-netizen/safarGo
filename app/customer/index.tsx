import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { destinations, Destination, LUCKNOW_CENTER, simulatedDriverLocations } from "@/constants/data";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;
const MAP_HEIGHT = 280;

const quickActions = [
  { icon: "time-outline", label: "Bookings", color: "#4CAF50", bg: "#E8F5E9", onPress: () => router.push("/customer/rides") },
  { icon: "heart", label: "Favorites", color: "#E91E63", bg: "#FCE4EC", onPress: () => {} },
  { icon: "chatbubble-ellipses", label: "Support", color: "#FF9800", bg: "#FFF3E0", onPress: () => {} },
  { icon: "wallet", label: "Wallet", color: "#1976D2", bg: "#E3F2FD", onPress: () => {} },
];

function DriverMarkerCallout({ driver }: { driver: typeof simulatedDriverLocations[0] }) {
  return (
    <View style={driverStyles.callout}>
      <Text style={driverStyles.calloutName}>{driver.name}</Text>
      <Text style={driverStyles.calloutVehicle}>{driver.vehicle}</Text>
      <View style={driverStyles.calloutRating}>
        <Ionicons name="star" size={12} color={Colors.gold} />
        <Text style={driverStyles.calloutRatingText}>{driver.rating}</Text>
      </View>
    </View>
  );
}

function DestinationCard({ item }: { item: Destination }) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/destination/[id]", params: { id: item.id } });
      }}
      style={({ pressed }) => [
        styles.destCard,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Image source={item.image} style={styles.destImage} contentFit="cover" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.65)"]}
        style={styles.destGradient}
      />
      <View style={styles.destInfo}>
        <Text style={styles.destName}>{item.name}</Text>
        <View style={styles.destMeta}>
          <Text style={styles.destPrice}>{"\u20B9"}{item.basePrice.toLocaleString()}</Text>
          <Text style={styles.destDistance}>{item.distance}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [driverPositions, setDriverPositions] = useState(simulatedDriverLocations);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        try {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
              setLocationPermission(true);
            },
            () => {
              setUserLocation(LUCKNOW_CENTER);
              setLocationPermission(false);
            }
          );
        } catch {
          setUserLocation(LUCKNOW_CENTER);
          setLocationPermission(false);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        } else {
          setLocationPermission(false);
          setUserLocation(LUCKNOW_CENTER);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPositions((prev) =>
        prev.map((d) => ({
          ...d,
          latitude: d.latitude + (Math.random() - 0.5) * 0.002,
          longitude: d.longitude + (Math.random() - 0.5) * 0.002,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const mapRegion = {
    latitude: userLocation?.latitude || LUCKNOW_CENTER.latitude,
    longitude: userLocation?.longitude || LUCKNOW_CENTER.longitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.topBar}>
        <Pressable style={styles.profileBtn}>
          <Ionicons name="person-outline" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.logoBar}>
          <Text style={[styles.logoText, { color: colors.text }]}>Safar </Text>
          <View style={styles.goBadge}>
            <Text style={styles.goText}>Go</Text>
          </View>
        </View>
        <Pressable onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.mapSection}>
        {userLocation ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={mapRegion}
            showsUserLocation={locationPermission === true}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {!locationPermission && userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                description="Lucknow, Uttar Pradesh"
              >
                <View style={driverStyles.userPin}>
                  <View style={driverStyles.userPinInner} />
                </View>
              </Marker>
            )}

            {driverPositions.map((driver) => (
              <Marker
                key={driver.id}
                coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                title={driver.name}
                description={`${driver.vehicle} | ${driver.rating}`}
              >
                <View style={driverStyles.driverPin}>
                  <Ionicons name="car" size={16} color="#FFF" />
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={[styles.map, styles.mapLoading, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={[styles.mapLoadingText, { color: colors.textSecondary }]}>Loading map...</Text>
          </View>
        )}
        <View style={styles.mapOverlay}>
          <Pressable
            onPress={() => {
              if (mapRef.current && userLocation) {
                mapRef.current.animateToRegion(mapRegion, 500);
              }
            }}
            style={[styles.mapBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="locate" size={18} color={Colors.gold} />
          </Pressable>
        </View>
        <View style={styles.driverCountBadge}>
          <View style={driverStyles.liveDot} />
          <Text style={styles.driverCountText}>{driverPositions.length} drivers nearby</Text>
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.quickActionsSection}>
        <View style={styles.quickGrid}>
          {quickActions.map((action, i) => (
            <Pressable
              key={i}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                action.onPress();
              }}
              style={({ pressed }) => [
                styles.quickAction,
                { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.chipsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {destinations.map((dest) => (
            <Pressable
              key={dest.id}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/destination/[id]", params: { id: dest.id } });
              }}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="location" size={14} color={Colors.gold} />
              <Text style={[styles.chipText, { color: colors.text }]}>{dest.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.cardsSection}>
        <View style={styles.cardsGrid}>
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} item={dest} />
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const driverStyles = StyleSheet.create({
  userPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(66,133,244,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  userPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  driverPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  callout: {
    padding: 8,
    minWidth: 120,
  },
  calloutName: {
    fontWeight: "600" as const,
    fontSize: 14,
    marginBottom: 2,
  },
  calloutVehicle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  calloutRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
  },
  goBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FFF",
  },
  mapSection: {
    marginHorizontal: 0,
    marginBottom: 16,
    position: "relative",
  },
  map: {
    width: "100%",
    height: MAP_HEIGHT,
  },
  mapLoading: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapLoadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  mapOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  mapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  driverCountBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  driverCountText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#333",
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  chipsSection: {
    marginBottom: 16,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  cardsSection: {
    paddingHorizontal: 20,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  destCard: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
  },
  destImage: {
    width: "100%",
    height: "100%",
  },
  destGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  destInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  destName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#FFF",
    marginBottom: 4,
  },
  destMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  destPrice: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: Colors.gold,
  },
  destDistance: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});
