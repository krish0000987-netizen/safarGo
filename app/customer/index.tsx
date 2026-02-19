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
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeIn, SlideInUp } from "react-native-reanimated";
import { AppMapView, AppMarker } from "@/components/MapWrapper";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { destinations, Destination, LUCKNOW_CENTER, simulatedDriverLocations } from "@/constants/data";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;
const MAP_HEIGHT = 320;

const quickActions = [
  { icon: "time-outline", label: "Bookings", color: "#4CAF50", bg: "#E8F5E9", onPress: () => router.push("/customer/rides") },
  { icon: "heart", label: "Favorites", color: "#E91E63", bg: "#FCE4EC", onPress: () => {} },
  { icon: "chatbubble-ellipses", label: "Support", color: "#FF9800", bg: "#FFF3E0", onPress: () => {} },
  { icon: "wallet", label: "Wallet", color: "#1976D2", bg: "#E3F2FD", onPress: () => {} },
];

const recentSearches = [
  { id: "r1", name: "Ram Mandir, Ayodhya", subtitle: "Ayodhya, Uttar Pradesh", destId: "1" },
  { id: "r2", name: "Kashi Vishwanath, Varanasi", subtitle: "Varanasi, Uttar Pradesh", destId: "2" },
  { id: "r3", name: "Taj Mahal, Agra", subtitle: "Agra, Uttar Pradesh", destId: "4" },
];

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

function SearchModal({
  visible,
  onClose,
  pickupText,
  colors,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  pickupText: string;
  colors: any;
  isDark: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  const filteredDestinations = searchQuery.trim()
    ? destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : destinations;

  const handleSelectDestination = (dest: Destination) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push({ pathname: "/booking/create", params: { destinationId: dest.id } });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[searchStyles.container, { backgroundColor: colors.background }]}>
          <View style={[searchStyles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
            <Pressable onPress={onClose} style={[searchStyles.backBtn, { backgroundColor: colors.surface }]}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>

            <View style={{ flex: 1, gap: 4 }}>
              <View style={[searchStyles.inputRow, { backgroundColor: colors.surface }]}>
                <View style={searchStyles.pickupDot} />
                <Text style={[searchStyles.pickupText, { color: colors.text }]} numberOfLines={1}>
                  {pickupText}
                </Text>
                <Pressable style={searchStyles.editPickupBtn}>
                  <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={searchStyles.inputConnector}>
                <View style={[searchStyles.connectorLine, { backgroundColor: colors.border }]} />
              </View>

              <View style={[searchStyles.inputRow, searchStyles.destInputRow, { backgroundColor: colors.surface, borderColor: Colors.gold }]}>
                <View style={searchStyles.destDot} />
                <TextInput
                  ref={inputRef}
                  style={[searchStyles.searchInput, { color: colors.text }]}
                  placeholder="Where to?"
                  placeholderTextColor={colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {!searchQuery.trim() && (
            <View style={searchStyles.recentSection}>
              <Text style={[searchStyles.sectionLabel, { color: colors.textSecondary }]}>Recent Searches</Text>
              {recentSearches.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    const dest = destinations.find((d) => d.id === item.destId);
                    if (dest) handleSelectDestination(dest);
                  }}
                  style={({ pressed }) => [
                    searchStyles.recentItem,
                    { backgroundColor: pressed ? colors.surface : "transparent" },
                  ]}
                >
                  <View style={[searchStyles.recentIcon, { backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0" }]}>
                    <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[searchStyles.recentName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[searchStyles.recentSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}

          <View style={[searchStyles.divider, { backgroundColor: colors.border }]} />

          <Text style={[searchStyles.sectionLabel, { color: colors.textSecondary, paddingHorizontal: 20, marginTop: 12 }]}>
            {searchQuery.trim() ? `${filteredDestinations.length} result${filteredDestinations.length !== 1 ? "s" : ""}` : "All Destinations"}
          </Text>

          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectDestination(item)}
                style={({ pressed }) => [
                  searchStyles.destResult,
                  { backgroundColor: pressed ? colors.surface : "transparent" },
                ]}
              >
                <Image source={item.image} style={searchStyles.destThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[searchStyles.destResultName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[searchStyles.destResultTagline, { color: colors.textSecondary }]}>{item.tagline}</Text>
                  <View style={searchStyles.destResultMeta}>
                    <Ionicons name="navigate-outline" size={12} color={Colors.gold} />
                    <Text style={[searchStyles.destResultDist, { color: colors.textSecondary }]}>{item.distance}</Text>
                    <Text style={searchStyles.destResultPrice}>From {"\u20B9"}{item.basePrice.toLocaleString()}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={searchStyles.emptySearch}>
                <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
                <Text style={[searchStyles.emptyText, { color: colors.textSecondary }]}>No destinations found</Text>
                <Text style={[searchStyles.emptySubtext, { color: colors.textTertiary }]}>Try a different search term</Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const mapRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [driverPositions, setDriverPositions] = useState(simulatedDriverLocations);
  const [searchVisible, setSearchVisible] = useState(false);
  const [pickupLabel, setPickupLabel] = useState("Current Location");

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        try {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
              setLocationPermission(true);
              setPickupLabel("Current Location");
            },
            () => {
              setUserLocation(LUCKNOW_CENTER);
              setLocationPermission(false);
              setPickupLabel("Lucknow, Uttar Pradesh");
            }
          );
        } catch {
          setUserLocation(LUCKNOW_CENTER);
          setLocationPermission(false);
          setPickupLabel("Lucknow, Uttar Pradesh");
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermission(true);
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setPickupLabel("Current Location");
        } else {
          setLocationPermission(false);
          setUserLocation(LUCKNOW_CENTER);
          setPickupLabel("Lucknow, Uttar Pradesh");
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
    <>
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
            <>
              <AppMapView
                mapRef={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                showsUserLocation={locationPermission === true}
                showsMyLocationButton={false}
                showsCompass={false}
                markers={driverPositions.map((d) => ({
                  id: d.id,
                  coordinate: { latitude: d.latitude, longitude: d.longitude },
                  title: d.name,
                  description: d.vehicle,
                }))}
              >
                {!locationPermission && userLocation && (
                  <AppMarker
                    coordinate={userLocation}
                    title="Your Location"
                    description="Lucknow, Uttar Pradesh"
                  >
                    <View style={driverStyles.userPin}>
                      <View style={driverStyles.userPinInner} />
                    </View>
                  </AppMarker>
                )}

                {driverPositions.map((driver) => (
                  <AppMarker
                    key={driver.id}
                    coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                    title={driver.name}
                    description={`${driver.vehicle} | ${driver.rating}`}
                  >
                    <View style={driverStyles.driverPin}>
                      <Ionicons name="car" size={16} color="#FFF" />
                    </View>
                  </AppMarker>
                ))}
              </AppMapView>
              {Platform.OS !== "web" && (
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
              )}

              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSearchVisible(true);
                }}
                style={[styles.searchOverlay, { backgroundColor: colors.surface }]}
              >
                <View style={styles.searchPickupRow}>
                  <View style={styles.searchPickupDot} />
                  <Text style={[styles.searchPickupLabel, { color: colors.text }]} numberOfLines={1}>{pickupLabel}</Text>
                </View>
                <View style={[styles.searchDividerLine, { backgroundColor: colors.border }]} />
                <View style={styles.searchDestRow}>
                  <View style={styles.searchDestDot} />
                  <Text style={[styles.searchDestPlaceholder, { color: colors.textTertiary }]}>Where to?</Text>
                  <Ionicons name="search" size={16} color={Colors.gold} />
                </View>
              </Pressable>

              <View style={styles.driverCountBadge}>
                <View style={driverStyles.liveDot} />
                <Text style={styles.driverCountText}>{driverPositions.length} drivers nearby</Text>
              </View>
            </>
          ) : (
            <View style={[styles.map, styles.mapLoading, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color={Colors.gold} />
              <Text style={[styles.mapLoadingText, { color: colors.textSecondary }]}>Loading map...</Text>
            </View>
          )}
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Destinations</Text>
            <Pressable onPress={() => router.push("/customer/destinations")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.cardsGrid}>
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} item={dest} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        pickupText={pickupLabel}
        colors={colors}
        isDark={isDark}
      />
    </>
  );
}

const searchStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  destInputRow: {
    borderWidth: 1.5,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E74C3C",
  },
  pickupText: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  editPickupBtn: {
    padding: 4,
  },
  inputConnector: {
    paddingLeft: 18,
    height: 8,
  },
  connectorLine: {
    width: 2,
    height: "100%",
    marginLeft: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    paddingVertical: 0,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  recentName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  recentSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 8,
  },
  destResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  destThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  destResultName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  destResultTagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    marginBottom: 4,
  },
  destResultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  destResultDist: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    marginRight: 8,
  },
  destResultPrice: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: Colors.gold,
  },
  emptySearch: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  emptySubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
});

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
  searchOverlay: {
    position: "absolute",
    bottom: 42,
    left: 16,
    right: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchPickupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  searchPickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  searchPickupLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    flex: 1,
  },
  searchDividerLine: {
    height: 1,
    marginLeft: 20,
  },
  searchDestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  searchDestDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E74C3C",
  },
  searchDestPlaceholder: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    flex: 1,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 17,
  },
  seeAllText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.gold,
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
