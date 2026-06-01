import { db } from "../firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"

// Student creates a booking
export const createBooking = async (bookingData, studentId, studentName) => {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      studentId: studentId,
      studentName: studentName,
      roomId: bookingData.roomId,
      roomTitle: bookingData.roomTitle,        // copied from room so we don't need extra fetch
      landlordId: bookingData.landlordId,
      landlordName: bookingData.landlordName,  // same reason
      price: bookingData.price,
      moveInDate: bookingData.moveInDate,
      status: "pending",                       // "pending" | "confirmed" | "rejected"
      paymentStatus: "unpaid",                 // "unpaid" | "paid"
      paymentId: null,
      createdAt: serverTimestamp()
    })
    console.log("Booking created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating booking:", error)
  }
}

// Get all bookings for a student
export const getStudentBookings = async (studentId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("studentId", "==", studentId)
    )
    const querySnapshot = await getDocs(q)
    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() })
    })
    return bookings
  } catch (error) {
    console.error("Error getting student bookings:", error)
  }
}

// Get all bookings for a landlord
export const getLandlordBookings = async (landlordId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("landlordId", "==", landlordId)
    )
    const querySnapshot = await getDocs(q)
    const bookings = []
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() })
    })
    return bookings
  } catch (error) {
    console.error("Error getting landlord bookings:", error)
  }
}

// Landlord accepts or rejects a booking
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, { status: status })
    console.log("Booking status updated to:", status)
  } catch (error) {
    console.error("Error updating booking status:", error)
  }
}

// Update payment status after eSewa/Khalti confirms
export const updatePaymentStatus = async (bookingId, paymentId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, {
      paymentStatus: "paid",
      paymentId: paymentId
    })
    console.log("Payment confirmed for booking:", bookingId)
  } catch (error) {
    console.error("Error updating payment:", error)
  }
}