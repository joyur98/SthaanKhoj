import { Router } from "express";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate, requireStudent, requireAdmin } from "../middleware/auth.js";
import { bookingRules, validate } from "../middleware/validate.js";

const router = Router();
router.use(authenticate);

/**
 * POST /api/bookings
 * Student submits a booking request.
 */
router.post("/", requireStudent, bookingRules, validate, async (req, res, next) => {
  try {
    const { propertyId, startDate, endDate, message } = req.body;

    // Validate property exists and is available
    const propSnap = await db.collection("properties").doc(propertyId).get();
    if (!propSnap.exists || !propSnap.data().isAvailable) {
      return res.status(400).json({ error: "Property is not available." });
    }

    // Prevent duplicate pending bookings for the same student + property
    const existing = await db
      .collection("bookings")
      .where("studentId",  "==", req.user.uid)
      .where("propertyId", "==", propertyId)
      .where("status",     "==", "pending")
      .get();
    if (!existing.empty) {
      return res.status(409).json({ error: "You already have a pending booking for this property." });
    }

    const now = new Date().toISOString();
    const booking = {
      propertyId,
      studentId:  req.user.uid,
      landlordId: propSnap.data().landlordId,
      startDate,
      endDate,
      message:    message || "",
      status:     "pending",    // pending | accepted | rejected | cancelled
      createdAt:  now,
      updatedAt:  now,
    };

    const ref = await db.collection("bookings").add(booking);
    res.status(201).json({ id: ref.id, ...booking });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bookings/my
 * Current student's bookings.
 */
router.get("/my", requireStudent, async (req, res, next) => {
  try {
    const snap = await db
      .collection("bookings")
      .where("studentId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bookings/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const snap = await db.collection("bookings").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found." });

    const data       = snap.data();
    const callerRole = req.user.role || req.userDoc?.role;
    const isParty    = [data.studentId, data.landlordId].includes(req.user.uid);
    if (!isParty && callerRole !== "admin") {
      return res.status(403).json({ error: "Not authorised." });
    }
    res.json({ id: snap.id, ...data });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/bookings/:id/cancel
 * Student can cancel their own pending booking.
 */
router.patch("/:id/cancel", requireStudent, async (req, res, next) => {
  try {
    const ref  = db.collection("bookings").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found." });
    if (snap.data().studentId !== req.user.uid) {
      return res.status(403).json({ error: "Not your booking." });
    }
    if (snap.data().status !== "pending") {
      return res.status(400).json({ error: "Only pending bookings can be cancelled." });
    }
    await ref.update({ status: "cancelled", updatedAt: new Date().toISOString() });
    res.json({ message: "Booking cancelled." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bookings   (admin only)
 */
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const snap = await db.collection("bookings").orderBy("createdAt", "desc").limit(100).get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

export default router;