export interface PointOfInterest {
  id: number;
  name: string | null;
  type: string;
  latitude: number;
  longitude: number;
  aliases: string[] | null;
}

export interface Resort {
  id: number;
  name: string;
  location: string;
}

export interface Lift {
  id: number;
  name: string;
}

export interface RouteStep {
  id: number;
  name: string | null; // Name can be null for connectors
  type: "lift" | "trail";
  start_point_id: number;
  end_point_id: number;
  estimated_time_minutes: number;
  difficulty: string | null; // Can be null for lifts/connectors
  start_coords: {
    lat: number;
    lng: number;
  };
  end_coords: {
    lat: number;
    lng: number;
  };
}

export interface PathfindingResult {
  message: string;
  path: RouteStep[];
  // Add other result properties as needed
}

// --- RouteFinderForm Component ---
export interface RouteFinderFormProps {
  resortId: number; // We'll hardcode this for now
  onPathFound: (path: RouteStep[], formState: any) => void;
  setIsLoading: (loading: boolean) => void;
  setApiError: (error: string | null) => void;
  initialValues: {
    startPointId: number | null;
    endPointId: number | null;
    maxDifficulty: string;
    avoidLifts: number[];
  };
}

export interface RouteDisplayProps {
  path: RouteStep[];
  onReset: () => void;
}

export interface DeviceOrientationEventWithCompass
  extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}
