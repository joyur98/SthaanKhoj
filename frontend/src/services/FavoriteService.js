import { db, auth } from "../firebase"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"

// Add a room to the current user's favorites
export const addFavorite = async (room) => {
  const user = auth.currentUser
  if (!user) return

  const ref = doc(db, "favorites", `${user.uid}_${room.id}`)
  await setDoc(ref, {
    userId: user.uid,
    roomId: room.id,
    ...room,
  })
}

// Remove a room from the current user's favorites
export const removeFavorite = async (roomId) => {
  const user = auth.currentUser
  if (!user) return

  const ref = doc(db, "favorites", `${user.uid}_${roomId}`)
  await deleteDoc(ref)
}

// Get all favorites for the current user
export const getFavorites = async () => {
  const user = auth.currentUser
  if (!user) return []

  const q = query(
    collection(db, "favorites"),
    where("userId", "==", user.uid)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.data().roomId, ...doc.data() }))
}

// Check if a specific room is favorited by the current user
export const isFavorited = async (roomId) => {
  const user = auth.currentUser
  if (!user) return false

  const favorites = await getFavorites()
  return favorites.some((fav) => fav.roomId === roomId)
}