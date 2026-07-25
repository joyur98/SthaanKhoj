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

export const getAdminStats = () => authRequest("/admin/stats");
export const getAdminUsers = () => authRequest("/admin/users");
export const disableAdminUser = (uid, disabled) =>
  authRequest(`/admin/users/${uid}/disable`, {
    method: "PATCH",
    body: JSON.stringify({ disabled }),
  });
export const setAdminUserRole = (uid, role) =>
  authRequest(`/admin/users/${uid}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const getAdminProperties = () => authRequest("/admin/properties");
export const updateAdminProperty = (id, body) =>
  authRequest(`/admin/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const deleteAdminProperty = (id) =>
  authRequest(`/admin/properties/${id}`, { method: "DELETE" });

export const getAdminBookings = () => authRequest("/admin/bookings");
export const updateAdminBookingStatus = (id, status) =>
  authRequest(`/admin/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getAdminLandlords = () => authRequest("/admin/landlords");
export const verifyAdminLandlord = (id) =>
  authRequest(`/admin/landlords/${id}/verify`, { method: "PATCH" });
export const unflagAdminLandlord = (id) =>
  authRequest(`/admin/landlords/${id}/unflag`, { method: "PATCH" });

export const getAdminFraudAlerts = () => authRequest("/admin/fraud-alerts");
export const resolveAdminFraudAlert = (id) =>
  authRequest(`/admin/fraud-alerts/${id}/resolve`, { method: "PATCH" });
