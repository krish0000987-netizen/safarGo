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

export function AppMapView({ style, initialRegion, markers }: AppMapViewProps) {
  const lat = initialRegion?.latitude || 26.8467;
  const lng = initialRegion?.longitude || 80.9462;

  return (
    <View style={[style, webStyles.container]}>
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04}%2C${lat - 0.03}%2C${lng + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`}
        style={{ width: "100%", height: "100%", border: "none" } as any}
        title="Map"
      />
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
});
