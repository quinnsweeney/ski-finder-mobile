import axios from "axios";
import Constants from "expo-constants";
import {
  getRefreshToken,
  storeAuthToken,
  storeRefreshToken,
  clearAuthData,
} from "../utils/storage";

// Create a separate axios instance for token refresh to avoid interceptor loops
const getApiUrl = (): string => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  const extraConfig = Constants.expoConfig?.extra;
  if (extraConfig?.apiUrl) {
    const isDev = typeof __DEV__ !== "undefined" && __DEV__;
    return isDev
      ? extraConfig.apiUrl.development
      : extraConfig.apiUrl.production;
  }

  const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;
  return isDevelopment
    ? "http://localhost:3001/api/v1"
    : "https://ski-route-api.onrender.com/api/v1";
};

const refreshApi = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RefreshTokenResponse {
  message: string;
  session: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      user_metadata?: any;
    };
  };
}

/**
 * Refresh the authentication token using the stored refresh token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.log("❌ No refresh token available");
      return false;
    }

    console.log("🔄 Attempting to refresh auth token...");

    // Use the separate axios instance to avoid interceptor loops
    const response = await refreshApi.post("/refresh", {
      refresh_token: refreshToken,
    });

    const data: RefreshTokenResponse = response.data;

    // Store new tokens
    await storeAuthToken(data.session.access_token);
    await storeRefreshToken(data.session.refresh_token);

    console.log("✅ Token refreshed successfully");
    return true;
  } catch (error: any) {
    console.error(
      "❌ Token refresh failed:",
      error.response?.status || error.message
    );

    // If refresh fails with 401/403, the refresh token is invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("🔒 Refresh token invalid - clearing auth data");
      await clearAuthData();
    }

    return false;
  }
};

/**
 * Check if token is expired and refresh if needed
 * Call this before making authenticated requests
 */
export const ensureValidToken = async (): Promise<boolean> => {
  try {
    // You could decode the JWT to check expiration
    // For now, we'll try to refresh proactively
    return await refreshAuthToken();
  } catch (error) {
    console.error("Error ensuring valid token:", error);
    return false;
  }
};
