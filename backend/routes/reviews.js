import { Router } from "express";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate, requireStudent } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = Router();

const reviewRules = [
  body("propertyId").trim().notEmpty(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5."),
  body("comment").trim().isLength({ min: 5, max: 1000 }).withMessage("Comment must be 5-1000 characters."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

/**
 * POST /api/reviews
 * Student submits a review for a property they booked.
 */
router.post("/", authenticate, requireStudent, reviewRules, validate, async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const studentId = req.user.uid;

    // Verify property exists
    const propSnap = await db.collection("properties").doc(propertyId).get();
    if (!propSnap.exists) {
      return res.status(404).json({ error: "Property not found." });
    }
    const landlordId = propSnap.data().landlordId;

    // Prevent duplicate reviews from same student on same property
    const existing = await db
      .collection("reviews")
      .where("propertyId", "==", propertyId)
      .where("studentId", "==", studentId)
      .get();
    if (!existing.empty) {
      return res.status(409).json({ error: "You have already reviewed this property." });
    }

    // Get student name
    const studentDoc = await db.collection("users").doc(studentId).get();
    const studentName = studentDoc.exists ? studentDoc.data().fullName : "Anonymous";

    const now = new Date().toISOString();
    const review = {
      propertyId,
      studentId,
      landlordId,
      rating: parseInt(rating),
      comment,
      studentName,
      createdAt: now,
    };

    const ref = await db.collection("reviews").add(review);

    // Recalculate property average rating
    const propReviews = await db.collection("reviews").where("propertyId", "==", propertyId).get();
    const propRatings = propReviews.docs.map((d) => d.data().rating);
    const propAvg = propRatings.reduce((a, b) => a + b, 0) / propRatings.length;

    await propSnap.ref.update({
      avgRating: Math.round(propAvg * 10) / 10,
      reviewCount: propRatings.length,
    });

    // Recalculate landlord average rating (across all their properties)
    const landlordReviews = await db.collection("reviews").where("landlordId", "==", landlordId).get();
    const landlordRatings = landlordReviews.docs.map((d) => d.data().rating);
    const landlordAvg = landlordRatings.reduce((a, b) => a + b, 0) / landlordRatings.length;

    await db.collection("landlords").doc(landlordId).update({
      avgRating: Math.round(landlordAvg * 10) / 10,
      totalReviews: landlordRatings.length,
    });

    res.status(201).json({ id: ref.id, ...review });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reviews/property/:propertyId
 * Get all reviews for a property.
 */
router.get("/property/:propertyId", async (req, res, next) => {
  try {
    const snap = await db
      .collection("reviews")
      .where("propertyId", "==", req.params.propertyId)
      .orderBy("createdAt", "desc")
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reviews/my
 * Get reviews written by the current student.
 */
router.get("/my", authenticate, requireStudent, async (req, res, next) => {
  try {
    const snap = await db
      .collection("reviews")
      .where("studentId", "==", req.user.uid)
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

export default router;