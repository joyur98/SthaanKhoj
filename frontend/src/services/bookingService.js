import { auth } from "../firebase";
import { createBooking as apiCreateBooking, getMyBookings, cancelBooking } from "./api";

// Student creates a booking
export const createBooking = async (bookingData, studentId, studentName) => {
  try {
    // Map your existing parameters to what the backend expects
    const result = await apiCreateBooking({
      propertyId: bookingData.roomId,
      startDate: bookingData.moveInDate,
      endDate: bookingData.moveInDate, // or calculate duration
      message: `Booking request from ${studentName}`
    });
    console.log("Booking created with ID:", result.bookingId);
    return result.bookingId;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Get all bookings for a student
export const getStudentBookings = async (studentId) => {
  try {
    const bookings = await getMyBookings();
    // Filter by studentId if needed, or just return all (backend already filters by logged-in user)
    return bookings;
  } catch (error) {
    console.error("Error getting student bookings:", error);
    return [];
  }
};

// Get all bookings for a landlord
export const getLandlordBookings = async (landlordId) => {
  try {
    // Use the landlord-specific endpoint from your backend
    const { getMyBookingRequests } = await import("./api");
    const bookings = await getMyBookingRequests();
    return bookings;
  } catch (error) {
    console.error("Error getting landlord bookings:", error);
    return [];
  }
};

// Landlord accepts or rejects a booking
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { respondToBooking } = await import("./api");
    await respondToBooking(bookingId, status);
    console.log("Booking status updated to:", status);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Update payment status after eSewa/Khalti confirms
export const updatePaymentStatus = async (bookingId, paymentId) => {
  try {
    // You'll need to add this endpoint to your backend if not present
    // For now, we'll keep direct Firestore as a fallback
    const { db } = await import("../firebase");
    const { doc, updateDoc } = await import("firebase/firestore");
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      paymentStatus: "paid",
      paymentId: paymentId
    });
    console.log("Payment confirmed for booking:", bookingId);
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};
//bookingService.js