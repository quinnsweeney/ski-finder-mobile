import api from "../api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  session: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      user_metadata?: any;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    user_metadata?: any;
    [key: string]: any;
  };
}

export interface AuthError {
  message: string;
  field?: string;
}

/**
 * Login user with email and password
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/login", credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};

/**
 * Sign up new user with email and password
 */
export const signupUser = async (
  credentials: SignupRequest
): Promise<SignupResponse> => {
  try {
    const response = await api.post("/signup", credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Signup failed");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { isValid: true };
};
