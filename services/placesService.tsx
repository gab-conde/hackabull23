/**
 * Fetches a stable Google Places photo URL for a restaurant
 * Calls your backend API to avoid CORS issues
 */
export const getPlacePhoto = async (
  placeName: string,
  address: string,
  location: { lat: number; lng: number }
): Promise<string | null> => {
  try {
    console.log(`[Frontend] Requesting photo for: ${placeName}`, { location });

    const response = await fetch("/api/places/photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeName,
        address,
        location,
      }),
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.photoUrl || null;
  } catch (error) {
    console.error(`Places API error for ${placeName}:`, error);
    return null;
  }
};

/**
 * Fallback cuisine-based images using Unsplash
 */
export const getCuisineFallbackImage = (cuisine: string): string => {
  const fallbacks: Record<string, string> = {
    Italian:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", // Pizza
    Asian:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80", // Sushi
    Hispanic:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", // Tacos
    American:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", // Burger
    Indian:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80", // Curry
    Healthy:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Salad
    Mediterranean:
      "https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80", // Falafel
  };

  return (
    fallbacks[cuisine] ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
  ); // Generic food
};
