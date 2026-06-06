    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    // Gets the Firebase token from the current user and makes an authenticated request
    const authRequest = async (endpoint, options = {}) => {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

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

    // ── Properties ────────────────────────────────────────────────────────────────
    export const getProperties = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authRequest(`/properties?${query}`);
    };

    export const getProperty = (id) => authRequest(`/properties/${id}`);

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
        body: JSON.stringify({ status }), // "accepted" or "rejected"
    });

    // ── Bookings ──────────────────────────────────────────────────────────────────
    export const createBooking = (body) =>
    authRequest("/bookings", { method: "POST", body: JSON.stringify(body) });

    export const getMyBookings = () => authRequest("/bookings/my");

    export const cancelBooking = (bookingId) =>
    authRequest(`/bookings/${bookingId}/cancel`, { method: "PATCH" });

    export const googleSignIn = (body) =>
  authRequest("/auth/google-signin", { method: "POST", body: JSON.stringify(body) });