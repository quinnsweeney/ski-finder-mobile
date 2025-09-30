import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import {
  Button,
  Card,
  Autocomplete,
  Typography,
  AutocompleteOption,
  ChairliftSelector,
  Dropdown,
  DIFFICULTY_OPTIONS,
} from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchResortPOIs, poiToOption, POI } from "../services/poiService";
import { findRoute, RouteRequest } from "../services/routeService";

type RouteFinderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "RouteFinder"
>;

const RouteFinderScreen: React.FC<RouteFinderScreenProps> = ({
  route,
  navigation,
}) => {
  const { resortId, resortName } = route.params;

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [startPOIId, setStartPOIId] = useState<number | null>(null);
  const [endPOIId, setEndPOIId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [poiOptions, setPoiOptions] = useState<AutocompleteOption[]>([]);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(true);
  const [avoidedLifts, setAvoidedLifts] = useState<number[]>([]);
  const [maxTrailDifficulty, setMaxTrailDifficulty] = useState<string>(
    DIFFICULTY_OPTIONS[2].value
  );

  // Fetch POIs when component mounts
  useEffect(() => {
    const loadPOIs = async () => {
      try {
        setIsLoadingPOIs(true);
        const fetchedPois = await fetchResortPOIs(resortId);
        setPois(fetchedPois);
        const options = fetchedPois.flatMap(poiToOption);
        setPoiOptions(options);
      } catch (error: any) {
        console.error("Failed to load POIs:", error);
        Alert.alert(
          "Error Loading Locations",
          "Failed to load resort locations. Please try again.",
          [
            { text: "Retry", onPress: loadPOIs },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } finally {
        setIsLoadingPOIs(false);
      }
    };

    loadPOIs();
  }, [resortId]);

  const handleStartLocationSelect = (option: AutocompleteOption) => {
    if (option.data) {
      setStartPOIId(option.data.id);
    }
  };

  const handleDestinationSelect = (option: AutocompleteOption) => {
    if (option.data) {
      setEndPOIId(option.data.id);
    }
  };

  const handleFindRoute = async () => {
    if (!startLocation || !destination) {
      Alert.alert(
        "Error",
        "Please select both a start location and destination."
      );
      return;
    }

    if (!startPOIId || !endPOIId) {
      Alert.alert("Error", "Please select locations from the suggestions.");
      return;
    }

    setIsLoading(true);

    try {
      const routeRequest: RouteRequest = {
        ski_area_id: resortId,
        start_point_id: startPOIId,
        end_point_id: endPOIId,
        max_difficulty: maxTrailDifficulty as
          | "green"
          | "blue"
          | "black"
          | "blue_black"
          | "double_black",
        avoid_lifts: avoidedLifts,
      };
      console.log(routeRequest);

      const routeSteps = await findRoute(routeRequest);

      if (routeSteps.length > 0) {
        navigation.navigate("RouteDisplay", { path: routeSteps });
      } else {
        Alert.alert(
          "No Route Found",
          "No route could be found between these locations. Please try different points."
        );
      }
    } catch (error: any) {
      console.error("Failed to find route:", error);
      Alert.alert(
        "Route Error",
        error.message || "Failed to find route. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          {resortName}
        </Typography>
        <Typography color="secondary" style={styles.subtitle}>
          Find your way on the mountain.
        </Typography>

        <Card>
          {isLoadingPOIs ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Typography color="secondary" style={styles.loadingText}>
                Loading locations...
              </Typography>
            </View>
          ) : (
            <>
              <Autocomplete
                placeholder="Current Location (start typing)"
                value={startLocation}
                onChangeText={setStartLocation}
                options={poiOptions}
                style={styles.input}
                showAllOnFocus={true}
                maxOptions={8}
                onOptionSelect={handleStartLocationSelect}
              />
              <Autocomplete
                placeholder="Destination (start typing)"
                value={destination}
                onChangeText={setDestination}
                options={poiOptions}
                showAllOnFocus={true}
                maxOptions={8}
                onOptionSelect={handleDestinationSelect}
              />
            </>
          )}
        </Card>
        <ChairliftSelector
          resortId={resortId}
          title="Avoid Chairlifts"
          maxHeight={200}
          onSelectionChange={setAvoidedLifts}
          selectedLiftIds={avoidedLifts}
        />
        <Dropdown
          options={DIFFICULTY_OPTIONS}
          placeholder="Maximum Difficulty"
          selectedValue={maxTrailDifficulty}
          onSelect={setMaxTrailDifficulty}
          title="Maximum Trail Difficulty"
        />

        <Button
          title="Find Route"
          onPress={handleFindRoute}
          isLoading={isLoading}
          disabled={isLoading}
          size="large"
          style={styles.findButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  findButton: {
    marginTop: theme.spacing.lg,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
  },
});

export default RouteFinderScreen;
