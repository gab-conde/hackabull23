import { GoogleGenAI } from "@google/genai";
import { UserPreferences, Restaurant, DailyCraving } from "../types";
import { getPlacePhoto, getCuisineFallbackImage } from "./placesService";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY,
});

const kmToMiles = (km: number): string => {
  const miles = km * 0.621371;
  return miles < 0.1 ? "< 0.1 mi" : `${miles.toFixed(1)} mi`;
};

type FallbackLevel = "exact" | "profile" | "any";

export const getRecommendations = async (
  preferences: UserPreferences,
  location: { lat: number; lng: number } | null,
  dailyCraving: DailyCraving | null = null,
  excludedNames: string[] = [],
  fallbackLevel: FallbackLevel = "exact"
): Promise<{ restaurants: Restaurant[]; fallbackUsed: FallbackLevel }> => {
  const model = "gemini-2.5-flash";

  // Transport Logic - RELAX constraints based on fallback level
  let searchRadius = "1.5km";
  let transportContext = "Walking only (strict 1.5km limit)";

  if (fallbackLevel === "any") {
    // In "any" mode, ignore transport preferences and expand radius significantly
    searchRadius = "25km";
    transportContext =
      "ANY distance - find the best open restaurants regardless of distance";
  } else if (preferences.transport === "bus") {
    searchRadius = fallbackLevel === "profile" ? "8km" : "5km";
    transportContext = `Public Transit or Walking (up to ${searchRadius})`;
  } else if (preferences.transport === "drive") {
    searchRadius = fallbackLevel === "profile" ? "20km" : "15km";
    transportContext = `Driving, Transit, or Walking (up to ${searchRadius})`;
  } else {
    // walk
    searchRadius = fallbackLevel === "profile" ? "3km" : "1.5km";
    transportContext = `Walking (up to ${searchRadius})`;
  }

  const locationConfig = location
    ? {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng,
          },
        },
      }
    : undefined;

  // Safely get cuisines array
  const userCuisines =
    Array.isArray(preferences.cuisines) && preferences.cuisines.length > 0
      ? preferences.cuisines
      : ["American", "Italian", "Asian"]; // Default fallback cuisines

  // Determine cuisine criteria based on fallback level and craving
  let cuisineCriteria = "";
  let searchDescription = "";
  let cuisineInstructions = "";

  if (fallbackLevel === "exact") {
    if (dailyCraving?.type === "custom" && dailyCraving.customSearch) {
      cuisineCriteria = `"${dailyCraving.customSearch}"`;
      searchDescription = `exact match for "${dailyCraving.customSearch}"`;
      cuisineInstructions = `Find restaurants that specifically serve "${dailyCraving.customSearch}". Be very precise and literal about this food item.`;
    } else if (
      dailyCraving?.type === "categories" &&
      Array.isArray(dailyCraving.categories) &&
      dailyCraving.categories.length > 0
    ) {
      cuisineCriteria = dailyCraving.categories.join(", ");
      searchDescription = `categories: ${cuisineCriteria}`;
      cuisineInstructions = `Find restaurants that match these specific cuisines: ${cuisineCriteria}`;
    } else {
      cuisineCriteria = userCuisines.join(", ");
      searchDescription = `profile cuisines: ${cuisineCriteria}`;
      cuisineInstructions = `Find restaurants matching these cuisines: ${cuisineCriteria}`;
    }
  } else if (fallbackLevel === "profile") {
    cuisineCriteria = userCuisines.join(", ");
    searchDescription = `profile preferences (${cuisineCriteria})`;
    cuisineInstructions = `Try to find restaurants matching these cuisines: ${cuisineCriteria}. If very limited, include popular alternatives.`;
  } else {
    // "any" - no cuisine or distance restrictions
    cuisineCriteria = "ANY cuisine";
    searchDescription = "any available cuisine, any distance";
    cuisineInstructions =
      "Find ANY highly-rated restaurants that are currently open. Cuisine type doesn't matter. Distance doesn't matter. Just find good open restaurants.";
  }

  // Fast food detection
  let includeFastFood = false;
  const currentHour = new Date().getHours();

  if (dailyCraving?.type === "custom") {
    includeFastFood = true; // Always for custom searches to ensure results
  }

  if (currentHour >= 22 || currentHour < 6) {
    includeFastFood = true; // Late night logic
  }

  // Enhanced prompt with examples
  if (includeFastFood) {
    cuisineInstructions += `
      IMPORTANT: You are explicitly authorized to suggest fast food chains (e.g., McDonald's, Taco Bell, Wendy's, Burger King, Domino's) and 24-hour convenience stores with hot food (e.g., Wawa, 7-Eleven, Sheetz) if they are the closest open options. Do not limit results to sit-down restaurants.`;
  }

  const priorityInstruction =
    fallbackLevel === "any"
      ? "Sort by: Highest ratings and best reviews first (distance is irrelevant)"
      : preferences.importance === "distance"
      ? "Sort by: Closest distance first"
      : "Sort by: Shortest wait time first";

  const prompt = `
    You are a restaurant recommendation AI. Your job is to find 5-10 REAL, CURRENTLY OPEN restaurants.
    
    CONTEXT:
    - User Location: ${
      location ? `${location.lat}, ${location.lng}` : "Not provided"
    }
    - Search Radius: ${searchRadius}
    - Transport: ${transportContext}
    - Fallback Level: ${fallbackLevel}
    - ${priorityInstruction}
    - Exclude: ${excludedNames.length > 0 ? excludedNames.join(", ") : "None"}

    SEARCH INSTRUCTIONS:
    ${cuisineInstructions}

    CRITICAL REQUIREMENTS:
    1. **MUST BE OPEN NOW** - This is MANDATORY. Only return restaurants currently open.
    2. **REAL RESTAURANTS ONLY** - Use Google Maps to find actual existing restaurants.
    3. **DISTANCE IN MILES** - Format: "0.3 mi", "1.2 mi", "5.8 mi" etc.
    ${
      fallbackLevel === "any"
        ? "4. **IGNORE CUISINE & DISTANCE RESTRICTIONS** - Just find ANY good open restaurants."
        : "4. **MATCH CRITERIA** - Try to match the cuisine preferences above."
    }

    RESPONSE FORMAT:
    Return a JSON array of restaurant objects. Each object must have:
    {
      "id": "unique-id-string",
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "address": "Full Street Address",
      "rating": 4.5,
      "priceLevel": "$$",
      "description": "Short description",
      "distance": "1.2 mi",
      "waitTimeEstimate": "10-15 min",
      "openStatus": "Open Now • Closes 10 PM",
      "googleMapsUrl": "https://maps.google.com/...",
      "verified": true,
      "verificationReason": "Personalized reason why this fits the user",
      "websiteUrl": "",
      "menuUrl": "https://www.google.com/search?q=menu+for+RestaurantName+City"
    }

    IMPORTANT:
    - Find 5-10 restaurants minimum
    - If you find fewer than 5, expand your search radius further
    - Return ONLY the JSON array, no other text
    - If truly no restaurants exist, return []
  `;

  try {
    console.log(`[Gemini] Searching with criteria: ${searchDescription}`);
    console.log(
      `[Gemini] Search radius: ${searchRadius}, Transport: ${transportContext}`
    );

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: locationConfig,
      },
    });

    let text = response.text || "[]";

    // Log raw response for debugging
    console.log(`[Gemini] Raw response preview: ${text.substring(0, 200)}...`);

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data: any[] = [];
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", e);
      console.error("Text was:", text.substring(0, 500));

      // Try to extract JSON array from text
      const match = text.match(/\[.*\]/s);
      if (match) {
        try {
          data = JSON.parse(match[0]);
        } catch (e2) {
          console.error("Failed to extract JSON array from match");
        }
      }
    }

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn("Gemini returned non-array data, converting:", typeof data);
      data = [];
    }

    console.log(`[Gemini] Parsed ${data.length} restaurants from response`);

    // Filter out excluded restaurants
    const beforeFilter = data.length;
    data = data.filter(
      (item) => item && item.name && !excludedNames.includes(item.name)
    );
    if (beforeFilter !== data.length) {
      console.log(
        `[Gemini] Filtered out ${
          beforeFilter - data.length
        } excluded restaurants`
      );
    }

    // Convert to Restaurant objects
    const basicRestaurants = data.map((item: any, index: number) => ({
      id: item.id || `rest-${Date.now()}-${index}`,
      name: item.name || "Unknown Restaurant",
      cuisine: item.cuisine || "Various",
      address: item.address || "Address not available",
      rating: item.rating || 0,
      priceLevel: item.priceLevel || "$$",
      description: item.description || "No description available",
      distance: item.distance || "N/A",
      waitTimeEstimate: item.waitTimeEstimate || "15-20 min",
      openStatus: item.openStatus || "Hours not available",
      googleMapsUrl:
        item.googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.name || ""
        )}`,
      verified: item.verified !== false,
      verificationReason: item.verificationReason || "Available in your area",
      websiteUrl: item.websiteUrl || "",
      menuUrl:
        item.menuUrl ||
        `https://www.google.com/search?q=menu+for+${encodeURIComponent(
          item.name || ""
        )}`,
      imageUrl: "",
    }));

    console.log(
      `[Gemini] Found ${basicRestaurants.length} restaurants at fallback level: ${fallbackLevel}`
    );

    // If we still have no results, return early
    if (basicRestaurants.length === 0) {
      console.warn(`[Gemini] No restaurants found at ${fallbackLevel} level`);
      return {
        restaurants: [],
        fallbackUsed: fallbackLevel,
      };
    }

    // Enrich with photos
    const enrichedRestaurants = await Promise.all(
      basicRestaurants.map(async (restaurant) => {
        let imageUrl = "";

        if (location?.lat && location?.lng) {
          try {
            const photoUrl = await getPlacePhoto(
              restaurant.name,
              restaurant.address,
              location
            );
            imageUrl = photoUrl || getCuisineFallbackImage(restaurant.cuisine);
          } catch (err) {
            console.warn(
              `[Gemini] Failed to fetch photo for ${restaurant.name}`
            );
            imageUrl = getCuisineFallbackImage(restaurant.cuisine);
          }
        } else {
          imageUrl = getCuisineFallbackImage(restaurant.cuisine);
        }

        return {
          ...restaurant,
          imageUrl,
        };
      })
    );

    return {
      restaurants: enrichedRestaurants,
      fallbackUsed: fallbackLevel,
    };
  } catch (error) {
    console.error("[Gemini] API Error:", error);
    return {
      restaurants: [],
      fallbackUsed: fallbackLevel,
    };
  }
};
