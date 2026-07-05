import { auth } from "../firebase";
import {
  createBooking as apiCreateBooking,
  getMyBookings,
  cancelBooking as apiCancelBooking,
  getMyBookingRequests,
  respondToBooking,
} from "./api";

// Student creates a booking
export const createBooking = async (bookingData, studentId, studentName) => {
  try {
    const result = await apiCreateBooking({
      propertyId: bookingData.roomId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      message: bookingData.message || `Booking request from ${studentName}`,
    });
    console.log("Booking created with ID:", result.id);
    return result.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Get all bookings for a student
export const getStudentBookings = async (studentId) => {
  try {
    const bookings = await getMyBookings();
    return bookings;
  } catch (error) {
    console.error("Error getting student bookings:", error);
    return [];
  }
};

// Get all bookings for a landlord
export const getLandlordBookings = async (landlordId) => {
  try {
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
    await respondToBooking(bookingId, status);
    console.log("Booking status updated to:", status);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Student cancels their own pending booking
export const cancelBooking = async (bookingId) => {
  try {
    await apiCancelBooking(bookingId);
    console.log("Booking cancelled:", bookingId);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// Update payment status after eSewa/Khalti confirms
export const updatePaymentStatus = async (bookingId, paymentId) => {
  try {
    const { db } = await import("../firebase");
    const { doc, updateDoc } = await import("firebase/firestore");
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      paymentStatus: "paid",
      paymentId: paymentId,
    });
    console.log("Payment confirmed for booking:", bookingId);
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};