import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ListItem, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getUserData, clearAuthData, StoredUser } from "../utils/storage";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAuthData();
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!", [
      { text: "OK" },
    ]);
  };

  const handleAccountSettings = () => {
    Alert.alert("Account Settings", "Account settings feature coming soon!", [
      { text: "OK" },
    ]);
  };

  const handleSupport = () => {
    Alert.alert(
      "Support",
      "Need help? Contact me at quinnsweeney11@gmail.com",
      [{ text: "OK" }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Typography level="body" color="secondary">
            Loading profile...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Typography level="h1" style={styles.title}>
          Profile
        </Typography>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Typography level="h2" style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </Typography>
            </View>
            <View style={styles.userDetails}>
              <Typography level="h3" style={styles.userName}>
                {user?.name || "User"}
              </Typography>
              <Typography color="secondary" style={styles.userEmail}>
                {user?.email || "No email"}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Profile Actions */}
        <Card>
          <ListItem
            title="Edit Profile"
            onPress={handleEditProfile}
            showSeparator={true}
            trailing={<Text style={styles.chevron}>›</Text>}
          />
          <ListItem
            title="Account Settings"
            onPress={handleAccountSettings}
            showSeparator={true}
            trailing={<Text style={styles.chevron}>›</Text>}
          />
          <ListItem
            title="Support"
            onPress={handleSupport}
            showSeparator={false}
            trailing={<Text style={styles.chevron}>›</Text>}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.appInfoCard}>
          <Typography level="body" color="secondary" style={styles.appInfo}>
            Ski Finder v1.0.1
          </Typography>
          <Typography color="secondary" style={styles.appInfo}>
            Your guide to the slopes
          </Typography>
        </Card>

        {/* Logout Button */}
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 15,
  },
  appInfoCard: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  appInfo: {
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: "300",
  },
});

export default ProfileScreen;
