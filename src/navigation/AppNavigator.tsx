import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthScreen from "../screens/AuthScreen";
import ResortListScreen from "../screens/ResortListScreen";
import RouteFinderScreen from "../screens/RouteFinderScreen";
import RouteDisplayScreen from "../screens/RouteDisplayScreen";
import theme from "../components/theme";
import { RouteStep } from "../types";

// Define the parameter list for your routes
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ResortList: undefined;
  RouteFinder: { resortId: number; resortName: string };
  // Add the new route and define its parameters here
  RouteDisplay: { path: RouteStep[] };
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
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const initialRouteName: keyof RootStackParamList = "Auth";

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
