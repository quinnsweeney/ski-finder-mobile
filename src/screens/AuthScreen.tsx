import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import
import { Button, Card, Input, Typography } from "../components";
import theme from "../components/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  loginUser,
  signupUser,
  validateEmail,
  validatePassword,
  LoginResponse,
  SignupResponse,
} from "../services/authService";
import {
  storeAuthToken,
  storeRefreshToken,
  storeUserData,
  isAuthenticated,
} from "../utils/storage";

type AuthScreenProps = NativeStackScreenProps<RootStackParamList, "Auth">;

const SECURE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_EMAIL: "user_email",
  USER_DATA: "user_data",
};

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Check if user is already authenticated when component mounts
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const hasAuth = await isAuthenticated();

        console.log("🔍 AuthScreen: Checking existing auth:", hasAuth);

        // If user is already authenticated, redirect to main app
        if (hasAuth) {
          console.log("✅ User already authenticated, redirecting to Main");
          navigation.replace("Main");
        }
      } catch (error) {
        console.error("❌ Error checking existing auth:", error);
      }
    };
    checkExistingAuth();
  }, [navigation]);

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.message || "Invalid password");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleAuthAction = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const credentials = { email: email.trim(), password };

      if (isLoginView) {
        console.log("Logging in...");
        const response = await loginUser(credentials);
        console.log("Login successful:", response.session.user.email);

        // Store auth tokens and user data securely
        await storeAuthToken(response.session.access_token);
        await storeRefreshToken(response.session.refresh_token);
        await storeUserData({
          id: response.session.user.id,
          email: response.session.user.email,
          name: response.session.user.user_metadata?.name,
        });

        // Navigate to main app
        navigation.replace("Main");
      } else {
        const response = await signupUser(credentials);

        // Store user data (no token for signup, user needs to verify email)
        await storeUserData({
          id: response.user.id,
          email: response.user.email,
          name: response.user.user_metadata?.name,
        });

        Alert.alert(
          "Account created!",
          response.message ||
            `Welcome to SkiFinder! Please check your email to verify your account.`,
          [{ text: "OK", onPress: () => setIsLoginView(true) }] // Switch to login view after signup
        );
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography level="h1" style={styles.title}>
          {isLoginView ? "Welcome Back" : "Create Account"}
        </Typography>
        <Typography color="secondary" style={styles.subtitle}>
          {isLoginView
            ? "Log in to continue to SkiFinder"
            : "Get started with your guide to the slopes"}
        </Typography>

        <Card>
          <View>
            <Input
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(""); // Clear error on change
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              style={{
                ...styles.input,
                ...(emailError ? styles.inputError : {}),
              }}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(""); // Clear error on change
              }}
              secureTextEntry
              autoComplete={isLoginView ? "current-password" : "new-password"}
              textContentType={isLoginView ? "password" : "newPassword"}
              style={{
                ...styles.input,
                ...(passwordError ? styles.inputError : {}),
              }}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>
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
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
});

export default AuthScreen;
