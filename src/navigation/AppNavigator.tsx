import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import AuthScreen from "../screens/AuthScreen";
import ResortListScreen from "../screens/ResortListScreen";
import RouteFinderScreen from "../screens/RouteFinderScreen";
import RouteDisplayScreen from "../screens/RouteDisplayScreen";
import ProfileScreen from "../screens/ProfileScreen";
import theme from "../components/theme";
import { RouteStep } from "../types";
import { isAuthenticated } from "../utils/storage";
import { refreshAuthToken } from "../services/tokenService";

// Define the parameter list for your routes
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ResortList: undefined;
  RouteFinder: { resortId: number; resortName: string };
  // Add the new route and define its parameters here
  RouteDisplay: { path: RouteStep[] };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// A simple stack for the main part of the app after login
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="ResortList"
        component={ResortListScreen}
        options={{ title: "Select Resort" }}
      />
      <Stack.Screen
        name="RouteFinder"
        component={RouteFinderScreen}
        options={({ route }) => ({ title: route.params.resortName })}
      />
      {/* Add the new screen to the stack */}
      <Stack.Screen
        name="RouteDisplay"
        component={RouteDisplayScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const [initialRouteName, setInitialRouteName] = useState<
    keyof RootStackParamList | null
  >(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("🔍 Checking authentication status on app start...");

        // Check if user has stored auth data
        const hasAuth = await isAuthenticated();

        if (hasAuth) {
          console.log("📱 Found stored auth data, attempting token refresh...");

          // Try to refresh the token to ensure it's still valid
          const tokenRefreshed = await refreshAuthToken();

          if (tokenRefreshed) {
            // User is authenticated and token is valid/refreshed
            console.log("✅ Token valid/refreshed - redirecting to Main");
            setInitialRouteName("Main");
          } else {
            // Token refresh failed, redirect to auth
            console.log("❌ Token refresh failed - redirecting to Auth");
            setInitialRouteName("Auth");
          }
        } else {
          // No stored auth data
          console.log("❌ No stored auth data - redirecting to Auth");
          setInitialRouteName("Auth");
        }
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
        setInitialRouteName("Auth");
      }
    };

    checkAuthStatus();
  }, []);

  // Show loading screen while checking auth status
  if (initialRouteName === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
