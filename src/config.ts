import Constants from "expo-constants";

/**
 * Configuration for different environments
 */
export const config = {
  development: {
    apiUrl: "http://localhost:3001/api/v1",
    timeout: 10000,
    enableLogging: true,
  },
  production: {
    apiUrl: "https://ski-route-api.onrender.com/api/v1",
    timeout: 15000,
    enableLogging: false,
  },
};

// Determine current environment - can be overridden by environment variable
const envFromConfig = Constants.expoConfig?.extra?.environment as
  | keyof typeof config
  | undefined;
const envFromPublic = process.env.EXPO_PUBLIC_ENVIRONMENT as
  | keyof typeof config
  | undefined;
const forceEnvironment = envFromPublic || envFromConfig;

export const isDevelopment =
  forceEnvironment === "production"
    ? false
    : typeof __DEV__ !== "undefined" && __DEV__;
export const currentEnvironment: keyof typeof config =
  forceEnvironment || (isDevelopment ? "development" : "production");
export const currentConfig = config[currentEnvironment];

// Helper to force production mode locally
export const isProductionMode = currentEnvironment === "production";
