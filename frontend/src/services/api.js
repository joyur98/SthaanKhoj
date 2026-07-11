const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authRequest = async (endpoint, options = {}) => {
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken(true);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (body) =>
  authRequest("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const verifyToken = () =>
  authRequest("/auth/verify-token", { method: "POST" });

export const generateVerificationLink = () =>
  authRequest("/auth/generate-verification-link", { method: "POST" });

// ── Properties ────────────────────────────────────────────────────────────────
export const getProperties = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const data = await authRequest(`/properties?${query}`);
  
  // ✅ Ensure landlord data is included
  if (data.data && Array.isArray(data.data)) {
    data.data = data.data.map(room => ({
      ...room,
      landlordName: room.landlordName || room.landlord?.fullName || "Unknown Landlord",
      landlordPhone: room.landlordPhone || room.landlord?.phone || "Phone not provided",
    }));
  }
  
  return data;
};

export const getProperty = async (id) => {
  const data = await authRequest(`/properties/${id}`);
  
  // ✅ Ensure landlord data is included
  if (data) {
    data.landlordName = data.landlordName || data.landlord?.fullName || "Unknown Landlord";
    data.landlordPhone = data.landlordPhone || data.landlord?.phone || "Phone not provided";
  }
  
  return data;
};

export const createProperty = (body) =>
  authRequest("/properties", { method: "POST", body: JSON.stringify(body) });

export const updateProperty = (id, body) =>
  authRequest(`/properties/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteProperty = (id) =>
  authRequest(`/properties/${id}`, { method: "DELETE" });

// ── Students ──────────────────────────────────────────────────────────────────
export const getMyStudentProfile = () => authRequest("/students/me");

export const updateStudentProfile = (body) =>
  authRequest("/students/me", { method: "PUT", body: JSON.stringify(body) });

export const getSavedProperties = () => authRequest("/students/saved-properties");

export const getSavedPropertyIds = () => authRequest("/students/saved-properties/ids");

export const toggleSavedProperty = (propertyId) =>
  authRequest(`/students/saved-properties/${propertyId}`, { method: "POST" });

// ── Landlords ─────────────────────────────────────────────────────────────────
export const getMyLandlordProfile = () => authRequest("/landlords/me");

export const updateLandlordProfile = (body) =>
  authRequest("/landlords/me", { method: "PUT", body: JSON.stringify(body) });

export const getMyProperties = () => authRequest("/landlords/me/properties");

export const getMyBookingRequests = () => authRequest("/landlords/me/bookings");

export const respondToBooking = (bookingId, status) =>
  authRequest(`/landlords/me/bookings/${bookingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking = (body) =>
  authRequest("/bookings", { method: "POST", body: JSON.stringify(body) });

export const getMyBookings = () => authRequest("/bookings/my");

export const cancelBooking = (bookingId) =>
  authRequest(`/bookings/${bookingId}/cancel`, { method: "PATCH" });

export const googleSignIn = (body) =>
  authRequest("/auth/google-signin", { method: "POST", body: JSON.stringify(body) });

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatbotSearch = (filters) =>
  authRequest("/properties/chatbot-search", {
    method: "POST",
    body: JSON.stringify(filters),
  });