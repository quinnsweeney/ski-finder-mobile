import api from "../api";

export interface POI {
  id: number;
  ski_area_id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  aliases: string[] | null;
  osm_id: number;
}

export interface POIResponse {
  pois: POI[];
}

/**
 * Fetch POIs for a specific resort
 */
export const fetchResortPOIs = async (resortId: number): Promise<POI[]> => {
  try {
    const response = await api.get(`/resorts/${resortId}/pois`);
    // Handle both array response and object with pois array
    const data = response.data;
    return Array.isArray(data) ? data : data.pois || [];
  } catch (error: any) {
    console.error("Error fetching POIs:", error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch POIs");
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
};

/**
 * Convert POI to AutocompleteOption format
 */
export const poiToOption = (poi: POI) => {
  if (poi.type === "node") {
    return [];
  }
  const baseOption = {
    label: poi.name,
    value: poi.id.toString(),
    data: poi,
  };
  const aliasOptions = (poi.aliases || []).map((alias) => {
    return {
      label: alias,
      value: poi.id.toString(),
      data: poi,
    };
  });

  return [baseOption, ...aliasOptions];
};
