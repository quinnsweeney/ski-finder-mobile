import React, { useState } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { Button, Card, Input, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type AuthScreenProps = NativeStackScreenProps<RootStackParamList, "Auth">;

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const handleAuthAction = () => {
    setIsLoading(true);
    console.log(isLoginView ? "Logging in..." : "Creating account...");
    console.log({ email, password });

    setTimeout(() => {
      setIsLoading(false);
      if (email && password) {
        navigation.replace("Main");
      } else {
        Alert.alert("Error", "Please enter both email and password.");
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          {isLoginView ? "Welcome Back" : "Create Account"}
        </Typography>
        <Typography color="secondary" style={styles.subtitle}>
          {isLoginView
            ? "Log in to continue to SkiNav"
            : "Get started with your guide to the slopes"}
        </Typography>

        <Card>
          <Input
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </Card>

        <Button
          title={isLoginView ? "Log In" : "Create Account"}
          onPress={handleAuthAction}
          isLoading={isLoading}
          disabled={isLoading}
          size="large"
        />

        <Button
          title={
            isLoginView ? "Need an account? Sign Up" : "Have an account? Log In"
          }
          onPress={() => setIsLoginView(!isLoginView)}
          variant="secondary"
          style={styles.toggleButton}
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
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  toggleButton: {
    marginTop: theme.spacing.md,
  },
});

export default AuthScreen;
