import React, { useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { UserPreferences, ViewState, Restaurant, DailyCraving } from "./types";
import { getRecommendations } from "./services/geminiService";
import {
  saveUserPreferences,
  saveDailyCraving,
  getUserData,
  saveGuestPreferences,
  saveGuestCraving,
  getGuestPreferences,
  getGuestCraving,
} from "./services/firestoreService";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { DailyCravingScreen } from "./components/DailyCravingScreen";
import {
  Utensils,
  MapPin,
  Clock,
  Car,
  Bus,
  Footprints,
  LogOut,
  Settings,
  ExternalLink,
  BadgeCheck,
  Menu as MenuIcon,
  Plus,
  Hourglass,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

// 1. Welcome Screen
const WelcomeScreen: React.FC<{ onStart: () => void; onLogin: () => void }> = ({
  onStart,
  onLogin,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-brand-50 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none text-brand-900">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <div className="z-10 max-w-md w-full">
      <h1 className="text-6xl text-brand-900 marker-font mb-4 transform -rotate-2">
        ChowNow
      </h1>
      <p className="text-xl text-brand-800 mb-8 font-medium">
        Don't let a busy schedule ruin a good meal. Find the perfect bite, right
        now.
      </p>

      <div className="flex flex-col gap-4 w-full">
        <Button
          onClick={onStart}
          className="w-full text-lg h-14 shadow-brand-900/10"
        >
          Get Started
        </Button>
        <Button
          variant="ghost"
          onClick={onLogin}
          className="w-full text-brand-800 hover:text-brand-900 hover:bg-brand-100"
        >
          Sign In
        </Button>
      </div>
    </div>
  </div>
);

// 2. Auth Screen
const AuthScreen: React.FC<{
  mode: "login" | "signup";
  onSuccess: (user: User) => void;
  onBack: () => void;
  onGuest: () => void;
}> = ({ mode, onSuccess, onBack, onGuest }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCred;
      if (mode === "signup") {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      if (userCred.user) {
        onSuccess(userCred.user);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-brand-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-brand-500/10">
        <h2 className="text-4xl marker-font text-center mb-8 text-brand-900">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {mode === "signup" && (
            <Input
              placeholder="Pick a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" isLoading={loading} className="mt-4">
            {mode === "login" ? "Sign In" : "Next"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-brand-700 text-sm font-medium"
          >
            Back to home
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">Development Preview</p>
          <Button variant="outline" onClick={onGuest} className="w-full">
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

// 3. Profile Builder
const ProfileBuilder: React.FC<{
  onComplete: (prefs: UserPreferences) => void;
  initialUsername?: string;
}> = ({ onComplete, initialUsername }) => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    importance: null,
    transport: null,
    cuisines: [],
    maxWalkingDistance: 1,
    maxBusDistance: 3,
    maxDrivingDistance: 10,
  });

  const handleNext = () => setStep((p) => p + 1);

  const StepOne = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-3xl marker-font text-center mb-2 text-brand-900">
        Build your profile
      </h2>
      <div className="h-1 w-24 bg-brand-300 mx-auto rounded-full mb-12"></div>

      <p className="text-xl text-center mb-8 font-semibold text-gray-800">
        Which is more important?
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            setPrefs({ ...prefs, importance: "distance" });
            handleNext();
          }}
          className="p-6 border-2 border-gray-200 bg-white rounded-2xl flex items-center gap-4 hover:border-brand-500 hover:bg-brand-50 transition-all group shadow-sm"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-brand-200 group-hover:text-brand-700 transition-colors">
            <MapPin size={24} />
          </div>
          <span className="text-lg font-bold text-gray-800 group-hover:text-brand-900">
            Distance
          </span>
        </button>

        <button
          onClick={() => {
            setPrefs({ ...prefs, importance: "wait_time" });
            handleNext();
          }}
          className="p-6 border-2 border-gray-200 bg-white rounded-2xl flex items-center gap-4 hover:border-brand-500 hover:bg-brand-50 transition-all group shadow-sm"
        >
          <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-brand-200 group-hover:text-brand-700 transition-colors">
            <Hourglass size={24} />
          </div>
          <span className="text-lg font-bold text-gray-800 group-hover:text-brand-900">
            Wait Time
          </span>
        </button>
      </div>
    </div>
  );

  const StepTwo = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-3xl marker-font text-center mb-2 text-brand-900">
        Build your profile
      </h2>
      <div className="h-1 w-24 bg-brand-300 mx-auto rounded-full mb-12"></div>

      <p className="text-xl text-center mb-8 font-semibold text-gray-800">
        How do you get around?
      </p>

      <div className="grid grid-cols-1 gap-4">
        {[
          { val: "drive", label: "I Drive", icon: Car },
          { val: "bus", label: "Bus / Public", icon: Bus },
          { val: "walk", label: "Walk", icon: Footprints },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => {
              setPrefs({ ...prefs, transport: opt.val as any });
              handleNext();
            }}
            className="p-4 border-2 border-gray-200 bg-white rounded-2xl flex items-center justify-between hover:border-brand-500 hover:bg-brand-50 transition-all px-8 shadow-sm group"
          >
            <span className="text-lg font-bold text-gray-800 group-hover:text-brand-900">
              {opt.label}
            </span>
            <opt.icon className="text-gray-400 group-hover:text-brand-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );

  const StepThree = () => {
    const options = [
      "American",
      "Italian",
      "Asian",
      "Hispanic",
      "Indian",
      "Healthy",
    ];

    const toggle = (c: string) => {
      if (prefs.cuisines.includes(c)) {
        setPrefs({ ...prefs, cuisines: prefs.cuisines.filter((x) => x !== c) });
      } else {
        setPrefs({ ...prefs, cuisines: [...prefs.cuisines, c] });
      }
    };

    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-300">
        <h2 className="text-3xl marker-font text-center mb-2 text-brand-900">
          Build your profile
        </h2>
        <div className="h-1 w-24 bg-brand-300 mx-auto rounded-full mb-12"></div>

        <p className="text-xl text-center mb-8 font-semibold text-gray-800">
          What do you like?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`p-3 rounded-xl border-2 transition-all font-bold text-sm sm:text-base ${
                prefs.cuisines.includes(opt)
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <Button
          className="w-full shadow-brand-500/20"
          disabled={prefs.cuisines.length === 0}
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    );
  };

  const StepFour = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-300">
        <h2 className="text-3xl marker-font text-center mb-2 text-brand-900">
          Set your limits
        </h2>
        <div className="h-1 w-24 bg-brand-300 mx-auto rounded-full mb-12"></div>

        <p className="text-lg text-center mb-8 font-semibold text-gray-800">
          How far are you willing to travel?
        </p>

        <div className="space-y-6 mb-8">
          {/* Walking */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Footprints size={20} className="text-brand-600" />
                <span className="font-bold">Walking</span>
              </div>
              <span className="text-brand-700 font-bold">
                {prefs.maxWalkingDistance}{" "}
                {prefs.maxWalkingDistance === 1 ? "mile" : "miles"}
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={prefs.maxWalkingDistance}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  maxWalkingDistance: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.25 mi</span>
              <span>3 mi</span>
            </div>
          </div>

          {/* Bus/Transit */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bus size={20} className="text-brand-600" />
                <span className="font-bold">Bus / Transit</span>
              </div>
              <span className="text-brand-700 font-bold">
                {prefs.maxBusDistance} miles
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={prefs.maxBusDistance}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  maxBusDistance: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 mi</span>
              <span>10 mi</span>
            </div>
          </div>

          {/* Driving */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Car size={20} className="text-brand-600" />
                <span className="font-bold">Driving</span>
              </div>
              <span className="text-brand-700 font-bold">
                {prefs.maxDrivingDistance} miles
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={prefs.maxDrivingDistance}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  maxDrivingDistance: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2 mi</span>
              <span>25 mi</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full shadow-brand-500/20"
          onClick={() => onComplete(prefs)}
        >
          Complete Setup
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/50 backdrop-blur-sm p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-brand-800 uppercase tracking-widest">
            Step {step + 1} of 4
          </span>
          <span className="text-xs font-bold text-brand-600">
            {initialUsername}
          </span>
        </div>
        {step === 0 && <StepOne />}
        {step === 1 && <StepTwo />}
        {step === 2 && <StepThree />}
        {step === 3 && <StepFour />}
      </div>
    </div>
  );
};

// 4. Settings Screen

const SettingsScreen: React.FC<{
  currentPrefs: UserPreferences;
  user: User | null;
  onSave: (prefs: UserPreferences) => void;
  onBack: () => void;
}> = ({ currentPrefs, user, onSave, onBack }) => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    ...currentPrefs,
    maxWalkingDistance: currentPrefs.maxWalkingDistance || 1,
    maxBusDistance: currentPrefs.maxBusDistance || 3,
    maxDrivingDistance: currentPrefs.maxDrivingDistance || 10,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        await saveUserPreferences(user.uid, prefs);
      } else {
        saveGuestPreferences(prefs);
      }
      onSave(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl marker-font text-brand-900 mb-8">Settings</h2>

          {/* Transportation */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Transportation</h3>
            <p className="text-sm text-gray-600 mb-4">
              The listings of transprotation methods are in hierarchy, so it is
              assumed that if you can drive to a location, you can also walk or
              take the bus there. However, if you can only walk somewhere, you
              cannot take the bus or drive there.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { val: "walk", label: "Walk", icon: Footprints },
                { val: "bus", label: "Bus / Public Transit", icon: Bus },
                { val: "drive", label: "Drive", icon: Car },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() =>
                    setPrefs({ ...prefs, transport: opt.val as any })
                  }
                  className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${
                    prefs.transport === opt.val
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <span className="font-bold">{opt.label}</span>
                  <opt.icon />
                </button>
              ))}
            </div>
          </div>

          {/* Distance Limits */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Distance Limits</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set how far you're willing to travel for each transportation
              method
            </p>

            <div className="space-y-4">
              {/* Walking Distance */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Footprints size={20} className="text-brand-600" />
                    <span className="font-bold">Walking</span>
                  </div>
                  <span className="text-brand-700 font-bold">
                    {prefs.maxWalkingDistance}{" "}
                    {prefs.maxWalkingDistance === 1 ? "mile" : "miles"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.25"
                  value={prefs.maxWalkingDistance}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      maxWalkingDistance: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.25 mi</span>
                  <span>3 mi</span>
                </div>
              </div>

              {/* Bus/Transit Distance */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bus size={20} className="text-brand-600" />
                    <span className="font-bold">Bus / Transit</span>
                  </div>
                  <span className="text-brand-700 font-bold">
                    {prefs.maxBusDistance} miles
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={prefs.maxBusDistance}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      maxBusDistance: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 mi</span>
                  <span>10 mi</span>
                </div>
              </div>

              {/* Driving Distance */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car size={20} className="text-brand-600" />
                    <span className="font-bold">Driving</span>
                  </div>
                  <span className="text-brand-700 font-bold">
                    {prefs.maxDrivingDistance} miles
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={prefs.maxDrivingDistance}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      maxDrivingDistance: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2 mi</span>
                  <span>25 mi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Priority</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { val: "distance", label: "Closest Distance", icon: MapPin },
                {
                  val: "wait_time",
                  label: "Shortest Wait Time",
                  icon: Hourglass,
                },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() =>
                    setPrefs({ ...prefs, importance: opt.val as any })
                  }
                  className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${
                    prefs.importance === opt.val
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <span className="font-bold">{opt.label}</span>
                  <opt.icon />
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Cuisines */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Favorite Cuisines</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                "American",
                "Italian",
                "Asian",
                "Hispanic",
                "Indian",
                "Healthy",
                "Mediterranean",
                "Fast Food",
              ].map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => {
                    if (prefs.cuisines.includes(cuisine)) {
                      setPrefs({
                        ...prefs,
                        cuisines: prefs.cuisines.filter((c) => c !== cuisine),
                      });
                    } else {
                      setPrefs({
                        ...prefs,
                        cuisines: [...prefs.cuisines, cuisine],
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border-2 font-bold transition-all ${
                    prefs.cuisines.includes(cuisine)
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Recommendations Screen
const RecommendationsScreen: React.FC<{
  prefs: UserPreferences;
  dailyCraving: DailyCraving | null;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onChangeCraving: () => void;
}> = ({
  prefs,
  dailyCraving,
  user,
  onLogout,
  onOpenSettings,
  onChangeCraving,
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [fetchedNames, setFetchedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [fallbackLevel, setFallbackLevel] = useState<
    "exact" | "profile" | "any"
  >("exact");
  const [searchStatus, setSearchStatus] = useState<string>("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location access denied or failed", err);
        }
      );
    }
  }, []);

  const fetchRecs = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError("");
      setFallbackLevel("exact");
      setSearchStatus("Initializing search...");
    }

    try {
      let currentFallback: "exact" | "profile" | "any" = isLoadMore
        ? fallbackLevel
        : "exact";
      let result = {
        restaurants: [] as Restaurant[],
        fallbackUsed: currentFallback,
      };

      // Validate preferences before making request
      if (!prefs.cuisines || !Array.isArray(prefs.cuisines)) {
        console.warn("[App] Invalid cuisines in preferences, using defaults");
        prefs.cuisines = ["American", "Italian", "Asian"];
      }

      // Get distance info for status display
      const getDistanceText = (
        transport: string | null,
        level: "exact" | "profile" | "any"
      ) => {
        const walkMiles = prefs.maxWalkingDistance || 1;
        const busMiles = prefs.maxBusDistance || 3;
        const driveMiles = prefs.maxDrivingDistance || 10;

        if (level === "any") return "25 miles";

        let baseMiles =
          transport === "walk"
            ? walkMiles
            : transport === "bus"
            ? busMiles
            : driveMiles;
        if (level === "profile") baseMiles *= 2;

        return `${baseMiles} miles`;
      };

      // Build search criteria text
      const getCriteriaText = () => {
        if (dailyCraving?.type === "custom" && dailyCraving.customSearch) {
          return dailyCraving.customSearch;
        } else if (
          dailyCraving?.type === "categories" &&
          dailyCraving.categories?.length
        ) {
          return dailyCraving.categories.join(", ");
        } else {
          return prefs.cuisines.join(", ");
        }
      };

      const criteriaText = getCriteriaText();
      const distanceText = getDistanceText(prefs.transport, currentFallback);

      // Try with current fallback level first
      console.log(`[App] Attempting fetch at level: ${currentFallback}`);
      setSearchStatus(
        `Searching for ${criteriaText} within ${distanceText}...`
      );

      result = await getRecommendations(
        prefs,
        location,
        dailyCraving,
        Array.from(fetchedNames),
        currentFallback
      );

      // If no results and not loading more, try fallback hierarchy
      if (result.restaurants.length === 0 && !isLoadMore) {
        console.log("[App] No results at 'exact' level, trying 'profile'...");
        currentFallback = "profile";
        const newDistanceText = getDistanceText(
          prefs.transport,
          currentFallback
        );
        setSearchStatus(
          `No exact matches found. Expanding to ${newDistanceText} with profile preferences...`
        );

        try {
          result = await getRecommendations(
            prefs,
            location,
            dailyCraving,
            Array.from(fetchedNames),
            currentFallback
          );
        } catch (profileErr) {
          console.error("[App] Profile fallback failed:", profileErr);
        }

        if (result.restaurants.length === 0) {
          console.log("[App] No results at 'profile' level, trying 'any'...");
          currentFallback = "any";
          setSearchStatus(
            "Expanding search to 25 miles for any open restaurants..."
          );

          try {
            result = await getRecommendations(
              prefs,
              location,
              dailyCraving,
              Array.from(fetchedNames),
              currentFallback
            );
          } catch (anyErr) {
            console.error("[App] 'Any' fallback failed:", anyErr);
          }
        }
      }

      // Handle results
      if (result.restaurants.length === 0 && !isLoadMore) {
        setSearchStatus("");
        setError(
          "No open restaurants found nearby. Try adjusting your location settings or expanding your search radius."
        );
      } else {
        setRestaurants((prev) =>
          isLoadMore ? [...prev, ...result.restaurants] : result.restaurants
        );
        setFallbackLevel(result.fallbackUsed);

        const newNames = new Set(fetchedNames);
        result.restaurants.forEach((r) => newNames.add(r.name));
        setFetchedNames(newNames);
        setSearchStatus("");
      }
    } catch (err) {
      console.error("[App] Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again.");
      setSearchStatus("");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (restaurants.length === 0) fetchRecs();
    }, 1000);
    return () => clearTimeout(t);
  }, [prefs, location, dailyCraving]);

  const getFallbackMessage = () => {
    if (fallbackLevel === "exact") return null;

    if (fallbackLevel === "profile") {
      return {
        title: "Showing profile preferences",
        message:
          dailyCraving?.type === "custom"
            ? `We couldn't find exact matches for "${dailyCraving.customSearch}", but here are great options from your favorite cuisines!`
            : "Here are restaurants matching your profile preferences.",
        icon: <Lightbulb className="text-blue-600 shrink-0 mt-0.5" size={20} />,
        color: "blue",
      };
    }

    return {
      title: "Showing all available options",
      message:
        "We couldn't find exact matches for your preferences, but here are highly-rated open restaurants nearby!",
      icon: (
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
      ),
      color: "amber",
    };
  };

  const fallbackInfo = getFallbackMessage();

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="marker-font text-2xl text-brand-700">ChowNow</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onChangeCraving}
            className="text-brand-600 hover:text-brand-800 font-bold text-sm hidden sm:block"
          >
            Change Craving
          </button>
          <button
            onClick={onOpenSettings}
            className="text-brand-400 hover:text-brand-700 transition-colors"
          >
            <Settings size={20} />
          </button>
          <span className="text-sm font-bold text-brand-900 hidden sm:block">
            {user?.email ? user.email.split("@")[0] : "Guest"}
          </span>
          <button
            onClick={onLogout}
            className="text-brand-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-900">
            Your Recommendations
          </h2>
          {dailyCraving && (
            <div className="text-sm text-gray-600">
              {dailyCraving.type === "custom" ? (
                <span>
                  Searching: <strong>{dailyCraving.customSearch}</strong>
                </span>
              ) : (
                <span>
                  Craving:{" "}
                  <strong>{dailyCraving.categories?.join(", ")}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {fallbackInfo && !loading && (
          <div
            className={`bg-${fallbackInfo.color}-50 border border-${fallbackInfo.color}-200 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in slide-in-from-top-4 duration-500`}
          >
            {fallbackInfo.icon}
            <div>
              <h3 className={`font-bold text-${fallbackInfo.color}-800`}>
                {fallbackInfo.title}
              </h3>
              <p className={`text-${fallbackInfo.color}-700 text-sm`}>
                {fallbackInfo.message}
              </p>
            </div>
          </div>
        )}

        {loading && !loadingMore ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-48 animate-pulse shadow-sm border border-brand-100"
              ></div>
            ))}
            {searchStatus && (
              <div className="text-center mt-6 bg-white rounded-xl p-6 shadow-sm border border-brand-200">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-3"></div>
                <p className="text-brand-800 font-medium text-base leading-relaxed">
                  {searchStatus}
                </p>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-600 font-bold mb-2">{error}</p>
            <p className="text-gray-600 text-sm mb-4">
              Try adjusting your location settings or transport preferences
            </p>
            <Button onClick={() => fetchRecs()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:shadow-brand-500/10 transition-all overflow-hidden flex flex-col sm:flex-row group border border-brand-100 hover:border-brand-300"
              >
                <div className="sm:w-2/5 h-64 sm:h-auto overflow-hidden relative bg-gray-100">
                  <img
                    src={
                      rest.imageUrl ||
                      `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(
                        rest.name
                      )}`
                    }
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(
                        rest.name
                      )}`;
                    }}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <div className="bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-bold text-brand-700 shadow-sm">
                      {rest.cuisine}
                    </div>
                    {rest.verified && (
                      <div className="bg-green-100/95 backdrop-blur px-2 py-1 rounded text-xs font-bold text-green-700 shadow-sm flex items-center gap-1">
                        <BadgeCheck size={12} /> Verified
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                        {rest.name}
                      </h3>
                      <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded text-sm font-bold">
                        {rest.rating} ★
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {rest.description}
                    </p>

                    {rest.verificationReason && (
                      <div className="relative overflow-hidden rounded-r-xl rounded-bl-xl border-l-4 border-indigo-400 bg-indigo-50/50 p-4 mb-4">
                        <div className="flex items-start gap-2 relative z-10">
                          <Lightbulb
                            size={18}
                            className="text-indigo-600 mt-0.5 shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-1">
                              Why it fits
                            </h4>
                            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                              "{rest.verificationReason}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1 font-medium text-brand-800">
                        <MapPin size={16} className="text-brand-500" />
                        {rest.distance}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        <Clock size={16} />
                        {rest.openStatus || "Open Now"}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-brand-800">
                        <Hourglass size={16} className="text-purple-500" />
                        {rest.waitTimeEstimate.toLowerCase().includes("wait")
                          ? rest.waitTimeEstimate
                          : `${rest.waitTimeEstimate} wait`}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {rest.priceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    {rest.menuUrl && (
                      <a
                        href={rest.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 font-bold text-sm flex items-center hover:text-brand-700 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MenuIcon size={16} className="mr-1" /> Menu
                      </a>
                    )}
                    <a
                      href={rest.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-brand-100 text-brand-700 font-bold text-sm flex items-center px-4 py-2 rounded-lg hover:bg-brand-200 transition-colors"
                    >
                      Directions <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {restaurants.length > 0 && (
              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => fetchRecs(true)}
                  isLoading={loadingMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Plus size={20} className="mr-2" /> Find More Places
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.WELCOME);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    importance: null,
    transport: null,
    cuisines: [],
  });
  const [dailyCraving, setDailyCraving] = useState<DailyCraving | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        setUser(currentUser);

        try {
          const userData = await getUserData(currentUser.uid);

          if (userData?.preferences) {
            setUserPrefs(userData.preferences);
          }

          if (userData?.dailyCraving) {
            setDailyCraving(userData.dailyCraving);
          }

          // If user has preferences, go to Daily Craving
          if (userData?.preferences) {
            setView(ViewState.DAILY_CRAVING);
          } else {
            setView(ViewState.PROFILE_BUILDER);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
          setView(ViewState.PROFILE_BUILDER);
        }
      } else {
        // Logged out
        setUser(null);

        const guestPrefs = getGuestPreferences();
        if (guestPrefs) {
          setUserPrefs(guestPrefs);

          const guestCraving = getGuestCraving();
          if (guestCraving) {
            setDailyCraving(guestCraving);
          }
        }

        setView(ViewState.WELCOME);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGuestStart = () => {
    const saved = getGuestPreferences();
    if (saved) {
      setUserPrefs(saved);
      setView(ViewState.DAILY_CRAVING);
    } else {
      setView(ViewState.PROFILE_BUILDER);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <>
      {view === ViewState.WELCOME && (
        <WelcomeScreen
          onStart={handleGuestStart}
          onLogin={() => setView(ViewState.AUTH)}
        />
      )}

      {view === ViewState.AUTH && (
        <AuthScreen
          mode="login"
          onSuccess={async (u) => {
            setUser(u);
            const data = await getUserData(u.uid);
            if (data) {
              setUserPrefs(data);
              setView(ViewState.DAILY_CRAVING);
            } else {
              setView(ViewState.PROFILE_BUILDER);
            }
          }}
          onBack={() => setView(ViewState.WELCOME)}
          onGuest={handleGuestStart}
        />
      )}

      {view === ViewState.PROFILE_BUILDER && (
        <ProfileBuilder
          initialUsername={user?.email?.split("@")[0]}
          onComplete={async (prefs) => {
            setUserPrefs(prefs);
            if (user) {
              await saveUserPreferences(user.uid, prefs);
            } else {
              saveGuestPreferences(prefs);
            }
            setView(ViewState.DAILY_CRAVING);
          }}
        />
      )}

      {view === ViewState.DAILY_CRAVING && (
        <DailyCravingScreen
          onComplete={(craving) => {
            setDailyCraving(craving);
            if (user) {
              saveDailyCraving(user.uid, craving);
            } else {
              saveGuestCraving(craving);
            }
            setView(ViewState.RECOMMENDATIONS);
          }}
          // FIX 1: Change 'onBack' to 'onOpenSettings'
          onOpenSettings={() => setView(ViewState.SETTINGS)}
          // FIX 2: Change 'userName' to 'username' (lowercase 'n')
          username={user?.email?.split("@")[0]}
        />
      )}

      {view === ViewState.RECOMMENDATIONS && (
        <RecommendationsScreen
          prefs={userPrefs}
          dailyCraving={dailyCraving}
          user={user}
          onLogout={async () => {
            await signOut(auth);
            setView(ViewState.WELCOME);
          }}
          onOpenSettings={() => setView(ViewState.SETTINGS)}
          onChangeCraving={() => setView(ViewState.DAILY_CRAVING)}
        />
      )}

      {view === ViewState.SETTINGS && (
        <SettingsScreen
          currentPrefs={userPrefs}
          user={user}
          onSave={(newPrefs) => {
            setUserPrefs(newPrefs);
            setView(ViewState.DAILY_CRAVING); // Or back to where they came from
          }}
          onBack={() => {
            // Logic to go back to previous screen (Recs or Craving)
            // For now default to Daily Craving
            setView(ViewState.DAILY_CRAVING);
          }}
        />
      )}
    </>
  );
};

export default App;
