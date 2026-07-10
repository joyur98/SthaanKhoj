import { Router } from "express";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate, requireLandlord, requireAdmin, requireLandlordOrAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

/**
 * GET /api/landlords/me
 */
router.get("/me", requireLandlord, async (req, res, next) => {
  try {
    const snap = await db.collection("landlords").doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "Landlord profile not found." });
    res.json(snap.data());
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/landlords/me
 */
router.put("/me", requireLandlord, async (req, res, next) => {
  try {
    const allowed = ["fullName", "phone", "bio", "businessName", "address"];
    const update  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    update.updatedAt = new Date().toISOString();
    await db.collection("landlords").doc(req.user.uid).update(update);
    await db.collection("users").doc(req.user.uid).update(update);
    res.json({ message: "Profile updated.", ...update });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/landlords/me/properties
 * List all properties belonging to the authenticated landlord.
 */
router.get("/me/properties", requireLandlord, async (req, res, next) => {
  try {
    const snap = await db
      .collection("properties")
      .where("landlordId", "==", req.user.uid)
      .get();
    const properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort in memory to bypass composite index requirement
    properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(properties);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/landlords/me/bookings
 * All booking requests for the landlord's properties.
 */
router.get("/me/bookings", requireLandlord, async (req, res, next) => {
  try {
    const snap = await db
      .collection("bookings")
      .where("landlordId", "==", req.user.uid)
      .get();
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort in memory to bypass composite index requirement
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/landlords/me/bookings/:bookingId
 * Accept or reject a booking.
 */
router.patch("/me/bookings/:bookingId", requireLandlord, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'." });
    }

    const ref  = db.collection("bookings").doc(req.params.bookingId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found." });
    if (snap.data().landlordId !== req.user.uid) {
      return res.status(403).json({ error: "Not your booking." });
    }

    await ref.update({ status, updatedAt: new Date().toISOString() });

    // If accepted, mark the corresponding property as booked (unavailable)
    if (status === "accepted" && snap.data().propertyId) {
      await db.collection("properties").doc(snap.data().propertyId).update({
        isAvailable: false,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: `Booking ${status}.` });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/landlords/:id   (admin only)
 */
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const snap = await db.collection("landlords").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Landlord not found." });
    res.json(snap.data());
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/landlords/:id/verify   (admin only)
 * Mark a landlord as verified.
 */
router.patch("/:id/verify", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("landlords").doc(req.params.id).update({
      verified:   true,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: "Landlord verified." });
  } catch (err) {
    next(err);
  }
});

export default router;
//landlords.js