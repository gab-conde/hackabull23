// types.ts - Make sure your types file includes these definitions

export interface UserPreferences {
  importance: "distance" | "wait_time" | null;
  transport: "walk" | "bus" | "drive" | null;
  cuisines: string[];
  maxWalkingDistance?: number; // Default: 1 mile
  maxBusDistance?: number; // Default: 3 miles
  maxDrivingDistance?: number; // Default: 10 miles
}

export interface DailyCraving {
  type: "categories" | "custom";
  categories?: string[];
  customSearch?: string;
  date: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  rating: number;
  priceLevel: string;
  description: string;
  distance: string;
  waitTimeEstimate: string;
  openStatus: string;
  googleMapsUrl: string;
  verified: boolean;
  verificationReason: string;
  websiteUrl: string;
  menuUrl: string;
  imageUrl: string;
}

export enum ViewState {
  WELCOME = "welcome",
  AUTH = "auth",
  PROFILE_BUILDER = "profile_builder",
  DAILY_CRAVING = "daily_craving",
  RECOMMENDATIONS = "recommendations",
  SETTINGS = "settings",
}
