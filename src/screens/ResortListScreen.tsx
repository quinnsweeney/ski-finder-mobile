import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { Button, Card, ListItem, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchResorts, Resort } from "../services/resortService";

type ResortListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResortList"
>;

const ResortListScreen: React.FC<ResortListScreenProps> = ({ navigation }) => {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load resorts (can be called by refresh button)
  const loadResorts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedResorts = await fetchResorts();
      setResorts(fetchedResorts);
    } catch (error: any) {
      console.error("Failed to load resorts:", error);
      setError(error.message);
      Alert.alert(
        "Error Loading Resorts",
        "Failed to load resort list. Please try again.",
        [
          { text: "Retry", onPress: loadResorts },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch resorts when component mounts
  useEffect(() => {
    loadResorts();
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleSelectResort = (resort: Resort) => {
    navigation.navigate("RouteFinder", {
      resortId: resort.id,
      resortName: resort.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          Choose a Resort
        </Typography>

        <Card>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Typography color="secondary" style={styles.loadingText}>
                Loading resorts...
              </Typography>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Typography color="secondary" style={styles.errorText}>
                Failed to load resorts
              </Typography>
            </View>
          ) : resorts.length > 0 ? (
            <FlatList
              data={resorts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <ListItem
                  title={item.name}
                  subtitle={item.location}
                  onPress={() => handleSelectResort(item)}
                  showSeparator={index < resorts.length - 1}
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Typography color="secondary" style={styles.emptyText}>
                No resorts available
              </Typography>
              <Button
                title="Refresh"
                onPress={loadResorts}
                style={styles.refreshButton}
                variant="secondary"
              />
            </View>
          )}
        </Card>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  title: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  profileButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  profileButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  refreshButton: {
    marginTop: theme.spacing.sm,
  },
});

export default ResortListScreen;
