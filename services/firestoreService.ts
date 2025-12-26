import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserPreferences, DailyCraving } from "../types";

export interface UserData {
  preferences: UserPreferences;
  dailyCraving?: DailyCraving;
  updatedAt: Date;
}

// Save user preferences to Firestore
export const saveUserPreferences = async (
  userId: string,
  preferences: UserPreferences
): Promise<void> => {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        preferences,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

// Save daily craving to Firestore
export const saveDailyCraving = async (
  userId: string,
  craving: DailyCraving
): Promise<void> => {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        dailyCraving: craving,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving daily craving:", error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Local storage functions for guest users
const GUEST_PREFS_KEY = "chownow_guest_preferences";
const GUEST_CRAVING_KEY = "chownow_guest_craving";

export const saveGuestPreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(preferences));
};

export const getGuestPreferences = (): UserPreferences | null => {
  const data = localStorage.getItem(GUEST_PREFS_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveGuestCraving = (craving: DailyCraving): void => {
  localStorage.setItem(GUEST_CRAVING_KEY, JSON.stringify(craving));
};

export const getGuestCraving = (): DailyCraving | null => {
  const data = localStorage.getItem(GUEST_CRAVING_KEY);
  return data ? JSON.parse(data) : null;
};
