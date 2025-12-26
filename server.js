import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.API_KEY;

// Endpoint to get restaurant photo
app.post("/api/places/photo", async (req, res) => {
  try {
    const { placeName, address, location } = req.body;

    console.log(`[Backend] Fetching photo for: ${placeName}`, { location });

    // Validate location data
    if (!location || !location.lat || !location.lng) {
      console.log(`[Backend] ✗ No valid location provided for ${placeName}`);
      return res.json({ photoUrl: null });
    }

    // Step 1: Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      placeName + " " + address
    )}&location=${location.lat},${
      location.lng
    }&radius=1000&key=${PLACES_API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" || !searchData.results?.[0]) {
      console.log(`[Backend] No place found for: ${placeName}`);
      return res.json({ photoUrl: null });
    }

    const place = searchData.results[0];

    // Step 2: Get Place Details for photos
    if (place.place_id) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=photo&key=${PLACES_API_KEY}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === "OK" && detailsData.result?.photos?.[0]) {
        const photoReference = detailsData.result.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoReference}&key=${PLACES_API_KEY}`;
        console.log(`[Backend] ✓ Found photo for ${placeName}`);
        return res.json({ photoUrl });
      }
    }

    // Fallback: Check search results for photo
    if (place.photos?.[0]?.photo_reference) {
      const photoReference = place.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoReference}&key=${PLACES_API_KEY}`;
      console.log(`[Backend] ✓ Found photo for ${placeName}`);
      return res.json({ photoUrl });
    }

    console.log(`[Backend] ✗ No photo found for ${placeName}`);
    res.json({ photoUrl: null });
  } catch (error) {
    console.error("[Backend] Places API Error:", error);
    res.status(500).json({ error: "Failed to fetch place photo" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend proxy running on http://localhost:${PORT}`);
  console.log(
    `📸 Places API endpoint: http://localhost:${PORT}/api/places/photo`
  );
});
