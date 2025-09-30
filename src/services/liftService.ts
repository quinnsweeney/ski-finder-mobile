import api from "../api";

export interface Lift {
  id: number;
  ski_area_id: number;
  name: string;
  start_point_id: number;
  end_point_id: number;
  lift_type: string;
  estimated_time_minutes: number;
}

export interface LiftsResponse {
  lifts: Lift[];
}

export const fetchResortLifts = async (resortId: number): Promise<Lift[]> => {
  try {
    const response = await api.get(`/resorts/${resortId}/lifts`);
    // Handle both array response and object with lifts array
    const data = response.data;
    return Array.isArray(data) ? data : data.lifts || [];
  } catch (error: any) {
    console.error("Error fetching lifts:", error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch lifts");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};

// export const liftToOption = (lift: Lift) => ({
//   resortId: lift.ski_area_id,
//   id: lift.id,

// });
