import api from "../api";

export interface Resort {
  id: number;
  name: string;
  location: string;
}

export interface ResortsResponse {
  resorts: Resort[];
}

/**
 * Fetch all available resorts
 */
export const fetchResorts = async (): Promise<Resort[]> => {
  try {
    const response = await api.get("/resorts");
    // Handle both array response and object with resorts array
    const data = response.data;
    return Array.isArray(data) ? data : data.resorts || [];
  } catch (error: any) {
    console.error("Error fetching resorts:", error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch resorts");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};
