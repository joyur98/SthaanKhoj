import { auth, db } from "../firebase/firebaseAdmin.js";

/**
 * Verifies the Firebase ID token in the Authorization header.
 * Attaches `req.user` (Firebase decoded token) and `req.userDoc` (Firestore user record).
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header." });
    }

    const token = header.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    // Attach decoded token (contains uid, email, custom claims like role)
    req.user = decoded;

    // Try the users/{uid} doc first (may hold role for some accounts)
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    if (userSnap.exists) {
      req.userDoc = userSnap.data();
    }

    // Fallback: resolve role from admins, students, or landlords collections if role is not found in token or userDoc.
    const currentRole = req.user.role || req.userDoc?.role;
    if (!currentRole) {
      const adminSnap = await db.collection("admins").doc(decoded.uid).get();
      if (adminSnap.exists) {
        req.resolvedRole = "admin";
      } else {
        const studentSnap = await db.collection("students").doc(decoded.uid).get();
        if (studentSnap.exists) {
          req.resolvedRole = studentSnap.data().role || "student";
        } else {
          const landlordSnap = await db.collection("landlords").doc(decoded.uid).get();
          if (landlordSnap.exists) {
            req.resolvedRole = landlordSnap.data().role || "landlord";
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Role-based access control factory.
 * Usage: requireRole('admin') or requireRole('landlord', 'admin')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated." });
    const userRole = req.user.role || req.userDoc?.role || req.resolvedRole;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "You do not have permission for this action." });
    }
    next();
  };
};

export const requireStudent  = requireRole("student");
export const requireLandlord = requireRole("landlord");
export const requireAdmin    = requireRole("admin");
export const requireLandlordOrAdmin = requireRole("landlord", "admin");
export const requireAnyRole  = requireRole("student", "landlord", "admin");