import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { Card, ListItem, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const MOCK_RESORTS = [
  { id: 1, name: "Winter Park", location: "Winter Park, CO" },
  { id: 2, name: "Vail", location: "Vail, CO" },
  { id: 3, name: "Beaver Creek", location: "Avon, CO" },
  { id: 4, name: "Breckenridge", location: "Breckenridge, CO" },
];

type ResortListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResortList"
>;

const ResortListScreen: React.FC<ResortListScreenProps> = ({ navigation }) => {
  const handleSelectResort = (resort: (typeof MOCK_RESORTS)[0]) => {
    navigation.navigate("RouteFinder", {
      resortId: resort.id,
      resortName: resort.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          Choose a Resort
        </Typography>

        <Card>
          <FlatList
            data={MOCK_RESORTS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <ListItem
                title={item.name}
                subtitle={item.location}
                onPress={() => handleSelectResort(item)}
                showSeparator={index < MOCK_RESORTS.length - 1}
              />
            )}
          />
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
    padding: theme.spacing.md,
  },
  title: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
});

export default ResortListScreen;
