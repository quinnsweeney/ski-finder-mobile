import api from "../api";

export interface RouteRequest {
  ski_area_id: number;
  start_point_id: number;
  end_point_id: number;
  max_difficulty?: "green" | "blue" | "black" | "blue_black" | "double_black";
  avoid_lifts?: number[];
}

export interface RouteStep {
  id: number;
  name: string;
  type: "trail" | "lift" | "intersection";
  start_point_id: number;
  end_point_id: number;
  estimated_time_minutes: number;
  difficulty: "green" | "blue" | "black" | "double_black";
  start_coords: {
    lat: number;
    lng: number;
  };
  end_coords: {
    lat: number;
    lng: number;
  };
}

/**
 * Find a route between two points on a ski area
 */
export const findRoute = async (
  routeRequest: RouteRequest
): Promise<RouteStep[]> => {
  try {
    const response = await api.post("/route", routeRequest);
    // Handle both array response and object with route array
    const data = response.data;
    return Array.isArray(data) ? data : data.route || [];
  } catch (error: any) {
    console.error("Error finding route:", error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to find route");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};
