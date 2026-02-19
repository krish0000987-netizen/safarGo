import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { destinations, Destination } from "@/constants/data";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

function DestinationCard({ item, index }: { item: Destination; index: number }) {
  const { colors, isDark } = useTheme();
  const { toggleFavorite, isFavorite } = useData();
  const fav = isFavorite(item.id);

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/destination/[id]", params: { id: item.id } });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={item.image} style={styles.cardImage} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.cardGradient}
          />
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(item.id);
            }}
            style={styles.heartBtn}
          >
            <Ionicons
              name={fav ? "heart" : "heart-outline"}
              size={18}
              color={fav ? "#E74C3C" : "#FFF"}
            />
          </Pressable>
          {item.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
          <View style={styles.cardOverlay}>
            <Text style={styles.cardDistance}>{item.distance}</Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.cardTagline, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.tagline}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.gold} />
              <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
            </View>
            <Text style={styles.priceText}>
              {"\u20B9"}{item.basePrice.toLocaleString()}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CustomerHome() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "Traveler";

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{firstName}</Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: Colors.gold }]}>
          <Text style={styles.avatarText}>{firstName[0]}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {}}
        style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>
          Where would you like to go?
        </Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Destinations</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={destinations.filter((d) => d.popular)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 14 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/destination/[id]", params: { id: item.id } });
            }}
            style={({ pressed }) => [
              styles.featuredCard,
              { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <Image source={item.image} style={styles.featuredImage} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.featuredGradient}
            />
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{item.name}</Text>
              <View style={styles.featuredMeta}>
                <Ionicons name="star" size={12} color={Colors.gold} />
                <Text style={styles.featuredRating}>{item.rating}</Text>
                <Text style={styles.featuredDot}> </Text>
                <Text style={styles.featuredDuration}>{item.duration}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 28 }]}>
        All Destinations
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={destinations}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: 100,
          paddingHorizontal: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => <DestinationCard item={item} index={index} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { marginBottom: 16 },
  greetingRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  userName: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#0A0A0A" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchPlaceholder: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  sectionTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, marginBottom: 16 },
  featuredCard: {
    width: width * 0.65,
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredInfo: { position: "absolute", bottom: 16, left: 16 },
  featuredName: { fontFamily: "Poppins_600SemiBold", fontSize: 18, color: "#FFF" },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  featuredRating: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#FFF" },
  featuredDot: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  featuredDuration: { fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },
  columnWrapper: { gap: 16, marginBottom: 16 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageWrapper: { width: "100%", height: 120, position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: { fontFamily: "Poppins_600SemiBold", fontSize: 9, color: "#0A0A0A" },
  cardOverlay: { position: "absolute", bottom: 8, left: 8 },
  cardDistance: { fontFamily: "Poppins_500Medium", fontSize: 11, color: "#FFF" },
  cardInfo: { padding: 10, gap: 2 },
  cardName: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  cardTagline: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  priceText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: Colors.gold },
});
