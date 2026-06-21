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

// Create a review (student only)
export const createReview = (body) =>
  authRequest("/reviews", { method: "POST", body: JSON.stringify(body) });

// Get all reviews for a property (public)
export const getPropertyReviews = (propertyId) =>
  authRequest(`/reviews/property/${propertyId}`);

// Get reviews written by the current student
export const getMyReviews = () => authRequest("/reviews/my");