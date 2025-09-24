import React from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { Card, ListItem } from "./src/components"; // Assuming your components are exported from here
import theme from "./src/components/theme";

// A simple chevron component for the trailing prop
const ChevronRight = () => (
  <Text style={{ color: theme.colors.textSecondary, fontSize: 20 }}>›</Text>
);

// A simple icon component for the leading prop
const Icon = ({ name }: { name: string }) => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>{name.charAt(0)}</Text>
  </View>
);

const ExampleListScreen = () => {
  return (
    <View style={styles.container}>
      <Card>
        {/* 1. Basic ListItem */}
        <ListItem title="Zephyr Mountain Lodge" showSeparator={true} />

        {/* 2. ListItem with an onPress handler */}
        <ListItem
          title="Find a Route"
          onPress={() =>
            Alert.alert("Navigate", "Navigating to route finder...")
          }
          showSeparator={true}
        />

        {/* 3. ListItem with a subtitle and leading element */}
        <ListItem
          title="Sunspot Lodge"
          subtitle="Top of Panorama Lift"
          leading={<Icon name="Sunspot Lodge" />}
          onPress={() =>
            Alert.alert("Location", "Showing details for Sunspot Lodge...")
          }
          showSeparator={true}
        />

        {/* 4. ListItem with all props */}
        <ListItem
          title="Settings"
          subtitle="Manage your preferences"
          leading={<Icon name="Settings" />}
          trailing={<ChevronRight />}
          onPress={() => Alert.alert("Settings", "Opening settings...")}
          showSeparator={false} // No separator for the last item in a card
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
});

export default ExampleListScreen;
