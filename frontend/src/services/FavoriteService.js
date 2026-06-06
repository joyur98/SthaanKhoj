import { auth } from "../firebase";
import { getSavedProperties, toggleSavedProperty } from "./api";

// Add a room to the current user's favorites
export const addFavorite = async (room) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    await toggleSavedProperty(room.id);
    console.log("Added to favorites:", room.id);
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
};

// Remove a room from the current user's favorites
export const removeFavorite = async (roomId) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    await toggleSavedProperty(roomId);
    console.log("Removed from favorites:", roomId);
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
};

// Get all favorites for the current user
export const getFavorites = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const favorites = await getSavedProperties();
    // Format to match your existing component expectations
    return favorites.map(fav => ({
      id: fav.id,
      roomId: fav.id,
      userId: user.uid,
      ...fav
    }));
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

// Check if a specific room is favorited by the current user
export const isFavorited = async (roomId) => {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.roomId === roomId);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};