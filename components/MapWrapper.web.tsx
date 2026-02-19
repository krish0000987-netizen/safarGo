import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface AppMapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  markers?: any[];
  polylines?: any[];
  mapRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export function AppMapView({ style, initialRegion, showsUserLocation }: AppMapViewProps) {
  const lat = initialRegion?.latitude || 26.8467;
  const lng = initialRegion?.longitude || 80.9462;

  return (
    <View style={[style, webStyles.container]}>
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04}%2C${lat - 0.03}%2C${lng + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`}
        style={{ width: "100%", height: "100%", border: "none" } as any}
        title="Map"
      />
      {showsUserLocation && (
        <View style={webStyles.locationBadge}>
          <View style={webStyles.locationDot} />
          <Text style={webStyles.locationText}>Your Location</Text>
        </View>
      )}
    </View>
  );
}

export function AppMarker(_props: any) {
  return null;
}

export function AppPolyline(_props: any) {
  return null;
}

const webStyles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  locationBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  locationText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: "#333",
  },
});
