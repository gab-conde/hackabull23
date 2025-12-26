import React, { useState } from "react";
import { DailyCraving } from "../types";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Sparkles, Search, Settings } from "lucide-react"; // 1. Import Settings icon

interface DailyCravingScreenProps {
  onComplete: (craving: DailyCraving) => void;
  username?: string;
  onOpenSettings: () => void; // 2. Add this prop
}

export const DailyCravingScreen: React.FC<DailyCravingScreenProps> = ({
  onComplete,
  username,
  onOpenSettings, // 3. Destructure the prop
}) => {
  const [mode, setMode] = useState<"select" | "categories" | "custom">(
    "select"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customSearch, setCustomSearch] = useState("");

  const categories = [
    "American",
    "Italian",
    "Asian",
    "Hispanic",
    "Indian",
    "Healthy",
    "Mediterranean",
    "Fast Food",
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleCategoriesSubmit = () => {
    if (selectedCategories.length === 0) return;

    onComplete({
      type: "categories",
      categories: selectedCategories,
      date: new Date().toISOString(),
    });
  };

  const handleCustomSubmit = () => {
    if (!customSearch.trim()) return;

    onComplete({
      type: "custom",
      customSearch: customSearch.trim(),
      date: new Date().toISOString(),
    });
  };

  // 4. Create a wrapper to hold the absolute positioned Settings button
  // This prevents code duplication across the 3 views
  const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="min-h-screen bg-brand-50 p-6 flex items-center justify-center relative">
      {/* Settings Button - Top Right */}
      <button
        onClick={onOpenSettings}
        className="absolute top-6 right-6 p-3 text-brand-400 hover:text-brand-700 transition-colors bg-white/50 backdrop-blur-sm rounded-full hover:bg-white shadow-sm z-10"
        title="Open Settings"
      >
        <Settings size={24} />
      </button>
      {children}
    </div>
  );

  if (mode === "select") {
    return (
      <ScreenWrapper>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <Sparkles className="mx-auto text-brand-600 mb-4" size={48} />
            <h2 className="text-3xl marker-font text-brand-900 mb-2">
              What are you craving?
            </h2>
            <p className="text-gray-600">
              {username ? (
                <>
                  Welcome back,{" "}
                  <span className="font-bold text-brand-700">{username}</span>
                </>
              ) : (
                <span className="font-bold text-brand-700">Welcome!</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode("categories")}
              className="p-6 border-2 border-gray-200 bg-white rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-brand-900 mb-2">
                Browse Categories
              </h3>
              <p className="text-sm text-gray-600">
                Choose from popular food types
              </p>
            </button>

            <button
              onClick={() => setMode("custom")}
              className="p-6 border-2 border-gray-200 bg-white rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-brand-900 mb-2">
                Custom Search
              </h3>
              <p className="text-sm text-gray-600">
                Type exactly what you want (e.g., "spicy ramen")
              </p>
            </button>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  if (mode === "categories") {
    return (
      <ScreenWrapper>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <h2 className="text-3xl marker-font text-center mb-8 text-brand-900">
            Pick Your Cravings
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm
                  ${
                    selectedCategories.includes(category)
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setMode("select")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCategoriesSubmit}
              disabled={selectedCategories.length === 0}
              className="flex-1"
            >
              Find Food
            </Button>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  // Custom search mode
  return (
    <ScreenWrapper>
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <Search className="mx-auto text-brand-600 mb-4" size={48} />
          <h2 className="text-3xl marker-font text-brand-900 mb-2">
            What's on your mind?
          </h2>
          <p className="text-gray-600 text-sm">
            Be specific! Try "pepperoni pizza", "chicken tikka masala", or
            "vegan tacos"
          </p>
        </div>

        <Input
          type="text"
          placeholder="e.g., spicy tuna roll, beef burrito..."
          value={customSearch}
          onChange={(e) => setCustomSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCustomSubmit()}
          className="mb-6"
          autoFocus
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setMode("select")}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleCustomSubmit}
            disabled={!customSearch.trim()}
            className="flex-1"
          >
            Search
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
};
