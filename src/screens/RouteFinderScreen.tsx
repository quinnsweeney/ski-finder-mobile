import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { Button, Card, Input, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { route as testRoute, route2 } from "./testRoute";

type RouteFinderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "RouteFinder"
>;

const RouteFinderScreen: React.FC<RouteFinderScreenProps> = ({
  route,
  navigation,
}) => {
  const { resortName } = route.params;

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFindRoute = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (startLocation && destination) {
        Alert.alert(
          "Route Found!",
          `Displaying the best route from ${startLocation} to ${destination}.`
        );
        navigation.navigate("RouteDisplay", { path: route2 });
      } else {
        Alert.alert("Error", "Please enter a start and destination.");
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          {resortName}
        </Typography>
        <Typography color="secondary" style={styles.subtitle}>
          Find your way on the mountain.
        </Typography>

        <Card>
          <Input
            placeholder="Current Location"
            value={startLocation}
            onChangeText={setStartLocation}
            style={styles.input}
          />
          <Input
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
          />
        </Card>

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
    padding: theme.spacing.lg,
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
});

export default RouteFinderScreen;
