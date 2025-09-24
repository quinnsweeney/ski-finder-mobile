import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline } from "react-native-maps";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";

import { RootStackParamList } from "../navigation/AppNavigator";
import { Button, Card, Typography } from "../components";
import theme from "../components/theme";

// --- Type Definitions ---
type Coordinate = { lat: number; lng: number };

// --- Helper Functions ---
const getDistance = (coord1: Coordinate, coord2: Coordinate) => {
  if (!coord1 || !coord2) return 0;
  const R = 6371e3;
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const getBearing = (start: Coordinate, end: Coordinate) => {
  // Check for same points to avoid division by zero
  if (start.lat === end.lat && start.lng === end.lng) {
    return 0;
  }
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;
  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  return (brng + 360) % 360;
};
const interpolate = (
  p1: Coordinate,
  p2: Coordinate,
  fraction: number
): Coordinate => {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
};

// --- Main Component ---
type RouteDisplayScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "RouteDisplay"
>;

const RouteDisplayScreen: React.FC<RouteDisplayScreenProps> = ({
  route,
  navigation,
}) => {
  const { path } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<Coordinate>(
    path[0].start_coords
  );
  const [userHeading, setUserHeading] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Process the raw path to group runs and handle connectors
  const processedSteps = useMemo(() => {
    const grouped = [];
    let i = 0;

    while (i < path.length) {
      const currentStep = path[i];

      // Skip connectors - they will be absorbed by the next non-connector
      if (currentStep.name === "Connector") {
        i++;
        continue;
      }

      // For non-connector steps, look backwards to include any preceding connectors
      let startIndex = i;
      // Look backwards for connectors to include
      while (startIndex > 0 && path[startIndex - 1].name === "Connector") {
        startIndex--;
      }

      // For trail steps, group consecutive segments with the same name
      if (currentStep.type === "trail") {
        let j = i;
        while (
          j < path.length &&
          path[j].type === "trail" &&
          path[j].name === currentStep.name &&
          path[j].name !== "Connector"
        ) {
          j++;
        }

        // Include any connectors that immediately follow this run
        while (j < path.length && path[j].name === "Connector") {
          j++;
        }

        const groupedStep = {
          ...currentStep,
          originalSteps: path.slice(startIndex, j),
          start_coords: path[startIndex].start_coords,
          end_coords: path[j - 1].end_coords,
          estimated_time_minutes: path
            .slice(startIndex, j)
            .reduce((sum, step) => sum + step.estimated_time_minutes, 0),
        };
        grouped.push(groupedStep);
        i = j;
      } else {
        // For lifts, include any connectors that immediately follow
        let j = i + 1;
        while (j < path.length && path[j].name === "Connector") {
          j++;
        }

        const groupedStep = {
          ...currentStep,
          originalSteps: path.slice(startIndex, j),
          start_coords: path[startIndex].start_coords,
          end_coords: path[j - 1].end_coords,
          estimated_time_minutes: path
            .slice(startIndex, j)
            .reduce((sum, step) => sum + step.estimated_time_minutes, 0),
        };
        grouped.push(groupedStep);
        i = j;
      }
    }

    return grouped;
  }, [path]);

  const { fullRoutePolyline, currentStepPolyline, otherStepsPolylines } =
    useMemo(() => {
      // Use original path for the full route polyline to maintain continuity
      const fullRoute = path.flatMap((step) => [
        { latitude: step.start_coords.lat, longitude: step.start_coords.lng },
        { latitude: step.end_coords.lat, longitude: step.end_coords.lng },
      ]);

      // For current step, use all original steps that make up this grouped step
      const currentGroupedStep = processedSteps[currentStepIndex];
      const currentStepCoords = currentGroupedStep.originalSteps.flatMap(
        (step) => [
          { latitude: step.start_coords.lat, longitude: step.start_coords.lng },
          { latitude: step.end_coords.lat, longitude: step.end_coords.lng },
        ]
      );

      // For other steps, create polylines for each grouped step
      const otherSteps = processedSteps
        .map((groupedStep, index) => ({
          coordinates: groupedStep.originalSteps.flatMap((step) => [
            {
              latitude: step.start_coords.lat,
              longitude: step.start_coords.lng,
            },
            { latitude: step.end_coords.lat, longitude: step.end_coords.lng },
          ]),
          isCurrentStep: index === currentStepIndex,
        }))
        .filter((step) => !step.isCurrentStep);

      return {
        fullRoutePolyline: fullRoute,
        currentStepPolyline: currentStepCoords,
        otherStepsPolylines: otherSteps,
      };
    }, [processedSteps, currentStepIndex]);

  const { segmentLengths, totalLength } = useMemo(() => {
    // Keep using original path for simulation since we need the granular segments
    const lengths = path.map((step) =>
      getDistance(step.start_coords, step.end_coords)
    );
    return {
      segmentLengths: lengths,
      totalLength: lengths.reduce((sum, len) => sum + len, 0),
    };
  }, [path]);

  const handleSimulationScrub = (progress: number) => {
    setSimulationProgress(progress);
    const distanceAlongRoute = totalLength * progress;
    let cumulativeDistance = 0;

    for (let i = 0; i < path.length; i++) {
      const segmentLength = segmentLengths[i];
      // Use a small epsilon to handle floating point comparisons
      if (cumulativeDistance + segmentLength >= distanceAlongRoute - 0.001) {
        const fractionIntoSegment =
          segmentLength > 0
            ? (distanceAlongRoute - cumulativeDistance) / segmentLength
            : 0;

        // Clamp the fraction to prevent extrapolation errors
        const clampedFraction = Math.max(0, Math.min(1, fractionIntoSegment));

        const newLocation = interpolate(
          path[i].start_coords,
          path[i].end_coords,
          clampedFraction
        );

        // Calculate heading toward the next step's start point
        let newHeading;
        if (i < path.length - 1) {
          // Point toward the next step's start point
          newHeading = getBearing(newLocation, path[i + 1].start_coords);
        } else {
          // For the last step, use the current segment's direction
          newHeading = getBearing(path[i].start_coords, path[i].end_coords);
        }

        // This is now the ONLY place these states are set by the slider
        setUserLocation(newLocation);
        setUserHeading(newHeading);
        return;
      }
      cumulativeDistance += segmentLength;
    }

    // Fallback for the very end of the slider
    const finalLocation = path[path.length - 1].end_coords;
    setUserLocation(finalLocation);
  };

  // THIS IS THE SINGLE SOURCE OF TRUTH FOR THE CAMERA
  useEffect(() => {
    if (
      mapRef.current &&
      isFinite(userLocation.lat) &&
      isFinite(userLocation.lng)
    ) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.002, // Small delta to maintain zoom level
          longitudeDelta: 0.002,
        },
        0 // Duration 0 makes it instant
      );
    }
  }, [userLocation]); // Only update position

  // Separate effect for heading changes if needed
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          heading: userHeading,
          pitch: 60,
        },
        { duration: 0 }
      );
    }
  }, [userHeading]);

  const currentStep = processedSteps[currentStepIndex];
  const nextNodeCoords = currentStep.end_coords;
  const distanceToNextNode = getDistance(userLocation, nextNodeCoords);

  const handleNext = () => {
    if (currentStepIndex < processedSteps.length - 1) {
      // This function now ONLY updates the instruction text index.
      // It DOES NOT move the camera.
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigation.pop();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType="standard"
        showsCompass={false}
        initialCamera={{
          center: {
            latitude: path[0].start_coords.lat,
            longitude: path[0].start_coords.lng,
          },
          pitch: 60,
          heading: getBearing(path[0].start_coords, path[0].end_coords),
          zoom: 18,
        }}
      >
        {/* Other steps polylines */}
        {otherStepsPolylines.map((step, index) => (
          <Polyline
            key={`other-step-${index}`}
            coordinates={step.coordinates}
            strokeColor={theme.colors.primary}
            strokeWidth={10}
            zIndex={1}
          />
        ))}

        {/* Current step polyline - highlighted */}
        <Polyline
          coordinates={currentStepPolyline}
          strokeColor="#FF6B35" // Orange/red color for current step
          strokeWidth={12}
          zIndex={2}
        />

        {/* Circle marker at the end of current step */}
        <Marker
          coordinate={{
            latitude: processedSteps[currentStepIndex].end_coords.lat,
            longitude: processedSteps[currentStepIndex].end_coords.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.endPointCircle} />
        </Marker>

        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat={true}
        >
          <MaterialIcons
            name="navigation"
            size={32}
            color={theme.colors.primary}
            style={styles.userArrow}
          />
        </Marker>
      </MapView>

      <View style={styles.overlayContainer}>
        <Card
          style={{
            ...styles.topCard,
            marginTop: insets.top + theme.spacing.sm,
          }}
        >
          <Typography level="h2">{currentStep.name ?? "Connector"}</Typography>
          <Typography color="secondary">
            {`Step ${currentStepIndex + 1} of ${
              processedSteps.length
            } • About ${
              Math.round(currentStep.estimated_time_minutes * 10) / 10
            } min`}
          </Typography>
        </Card>

        <Card
          style={{
            ...styles.bottomCard,
            marginBottom: insets.bottom + theme.spacing.sm,
          }}
        >
          <Typography level="h3" style={{ textAlign: "center" }}>
            {distanceToNextNode.toFixed(0)} meters
          </Typography>
          <Typography
            color="secondary"
            style={{ textAlign: "center", marginBottom: theme.spacing.md }}
          >
            to next point
          </Typography>
          <Button
            title={
              currentStepIndex === processedSteps.length - 1
                ? "Finish Route"
                : "Next Step"
            }
            onPress={handleNext}
          />

          <View style={styles.devPanel}>
            <Typography>Simulate Location</Typography>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={simulationProgress}
              onValueChange={handleSimulationScrub}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: theme.spacing.md,
    pointerEvents: "box-none",
  },
  topCard: { pointerEvents: "auto" },
  bottomCard: { pointerEvents: "auto" },
  userArrow: {
    transform: [{ rotate: "0deg" }],
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  devPanel: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  endPointCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B35",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default RouteDisplayScreen;
