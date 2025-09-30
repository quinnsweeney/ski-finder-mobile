import axios from "axios";
import Constants from "expo-constants";
import { getAuthToken } from "./utils/storage";

// Get API URL from environment variables with fallback
const getApiUrl = (): string => {
  // First try to get from Expo environment variables
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Fallback to app.json extra config
  const extraConfig = Constants.expoConfig?.extra;
  if (extraConfig?.apiUrl) {
    const isDev = typeof __DEV__ !== "undefined" && __DEV__;
    return isDev
      ? extraConfig.apiUrl.development
      : extraConfig.apiUrl.production;
  }

  // Final fallback based on dev environment
  const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;
  return isDevelopment
    ? "http://localhost:3001/api/v1"
    : "https://ski-route-api.onrender.com/api/v1";
};

// Environment-based configuration
const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;
const config = {
  baseURL: getApiUrl(),
  timeout: isDevelopment ? 10000 : 15000,
};
console.log(config.baseURL);
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDevelopment) {
      console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
      if (token) console.log("🔐 Auth token included");
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error("❌ API Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log("✅ API Response:", response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    if (isDevelopment) {
      console.error(
        "❌ API Response Error:",
        error.response?.status,
        error.config.url
      );
    }

    const originalRequest = error.config;

    // Handle unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh attempts for the refresh endpoint itself
      if (originalRequest.url?.includes("/refresh")) {
        console.log("🔒 Refresh endpoint failed - clearing auth data");
        const { clearAuthData } = require("./utils/storage");
        await clearAuthData();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log("🔒 Received 401 - attempting token refresh...");
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Import here to avoid circular dependency
        const { refreshAuthToken } = require("./services/tokenService");
        const { clearAuthData } = require("./utils/storage");

        const refreshSuccess = await refreshAuthToken();

        if (refreshSuccess) {
          // Retry the original request with new token
          console.log("✅ Token refreshed, retrying request");
          const newToken = await getAuthToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return api.request(originalRequest);
          }
        } else {
          // Refresh failed, clear auth data
          console.log("❌ Token refresh failed - clearing auth data");
          await clearAuthData();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);
        const { clearAuthData } = require("./utils/storage");
        await clearAuthData();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
