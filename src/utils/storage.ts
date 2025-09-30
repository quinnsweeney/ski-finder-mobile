import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "userData";

export interface StoredUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Store authentication token securely
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing auth token:", error);
    throw new Error("Failed to store authentication token");
  }
};

/**
 * Store refresh token securely
 */
export const storeRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Error storing refresh token:", error);
    throw new Error("Failed to store refresh token");
  }
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

/**
 * Get stored authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

/**
 * Store user data
 */
export const storeUserData = async (user: StoredUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user data:", error);
    throw new Error("Failed to store user data");
  }
};

/**
 * Get stored user data
 */
export const getUserData = async (): Promise<StoredUser | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

/**
 * Clear all stored authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw new Error("Failed to clear authentication data");
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return token !== null;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};
