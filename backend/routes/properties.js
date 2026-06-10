import { Router } from "express";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate, requireLandlord, requireAdmin, requireLandlordOrAdmin } from "../middleware/auth.js";
import { propertyRules, paginationRules, validate } from "../middleware/validate.js";

const router = Router();

/**
 * GET /api/properties
 * Public listing with optional filters.
 * query params: page, limit, minPrice, maxPrice, location, available
 */
router.get("/", paginationRules, validate, async (req, res, next) => {
  try {
    const { minPrice, maxPrice, location, available } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    let query = db.collection("properties").where("isActive", "==", true);

    if (available === "true") query = query.where("isAvailable", "==", true);

    // Always order by createdAt to use the existing working Firebase index
    query = query.orderBy("createdAt", "desc").limit(limit);

    // Cursor-based pagination
    if (req.query.startAfter) {
      const cursor = await db.collection("properties").doc(req.query.startAfter).get();
      if (cursor.exists) query = query.startAfter(cursor);
    }

    const snap = await query.get();
    let properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // --- Client-side (In-Memory) Filtering to avoid Firebase Index errors ---

    // 1. Price filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      properties = properties.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      properties = properties.filter((p) => p.price <= max);
    }

    // Client-side location filter (Firestore can't do substring search natively)
    if (location) {
      const loc = location.toLowerCase();
      properties = properties.filter((p) => p.location?.toLowerCase().includes(loc));
    }

    const lastDoc = snap.docs[snap.docs.length - 1];
    res.json({
      data: properties,
      pagination: {
        count:     properties.length,
        nextCursor: lastDoc ? lastDoc.id : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/properties/chatbot-search
 * Smart search endpoint for the AI chatbot.
 * Supports amenity filtering, price range, location, room type.
 */
router.post("/chatbot-search", async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, amenities, roomType, available } = req.body;
    const limit = 50;

    let query = db.collection("properties").where("isActive", "==", true);

    if (available === "true") query = query.where("isAvailable", "==", true);

    // Always order by createdAt to use the existing working Firebase index
    query = query.orderBy("createdAt", "desc").limit(limit);

    const snap = await query.get();
    let properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // --- Client-side (In-Memory) Filtering to avoid Firebase Index errors ---

    // 1. Price filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      properties = properties.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      properties = properties.filter((p) => p.price <= max);
    }

    // 2. Location filter (Firestore limitation)
    if (location) {
      const loc = location.toLowerCase();
      properties = properties.filter((p) => p.location?.toLowerCase().includes(loc));
    }

    // 3. Room type filter
    if (roomType) {
      properties = properties.filter((p) => p.roomType === roomType);
    }

    // Client-side amenities filter — property must have ALL requested amenities
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      properties = properties.filter((p) => {
        const propAmenities = (p.amenities || []).map((a) => a.toLowerCase());
        return amenities.every((a) => propAmenities.includes(a.toLowerCase()));
      });
    }

    // Also collect unique locations for suggestions
    const allSnap = await db.collection("properties")
      .where("isActive", "==", true)
      .select("location")
      .limit(200)
      .get();
    const locations = [...new Set(
      allSnap.docs.map((d) => d.data().location).filter(Boolean)
    )];

    res.json({
      data: properties,
      meta: {
        count: properties.length,
        locations,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/properties/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const snap = await db.collection("properties").doc(req.params.id).get();
    if (!snap.exists || !snap.data().isActive) {
      return res.status(404).json({ error: "Property not found." });
    }
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/properties
 * Landlords only.
 */
router.post("/", authenticate, requireLandlord, propertyRules, validate, async (req, res, next) => {
  try {
    const { title, description, price, location, availableFrom, amenities, images, roomType } = req.body;
    const now = new Date().toISOString();

    const property = {
      title,
      description,
      price:         parseFloat(price),
      location,
      availableFrom,
      amenities:     amenities || [],
      images:        images    || [],
      roomType:      roomType  || "room",
      landlordId:    req.user.uid,
      isActive:      true,
      isAvailable:   true,
      createdAt:     now,
      updatedAt:     now,
    };

    const ref = await db.collection("properties").add(property);

    // Add to landlord's property list
    const landlordRef = db.collection("landlords").doc(req.user.uid);
    const landlordSnap = await landlordRef.get();
    const existing = landlordSnap.data()?.properties || [];
    await landlordRef.update({ properties: [...existing, ref.id], updatedAt: now });

    res.status(201).json({ id: ref.id, ...property });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/properties/:id
 * Owner landlord or admin.
 */
router.put("/:id", authenticate, requireLandlordOrAdmin, propertyRules, validate, async (req, res, next) => {
  try {
    const ref  = db.collection("properties").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Property not found." });

    const callerRole = req.user.role || req.userDoc?.role;
    if (callerRole !== "admin" && snap.data().landlordId !== req.user.uid) {
      return res.status(403).json({ error: "You can only edit your own properties." });
    }

    const allowed = ["title", "description", "price", "location", "availableFrom", "amenities", "images", "roomType", "isAvailable"];
    const update  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    update.updatedAt = new Date().toISOString();

    await ref.update(update);
    res.json({ id: req.params.id, ...update });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/properties/:id
 * Soft-delete: sets isActive = false.
 */
router.delete("/:id", authenticate, requireLandlordOrAdmin, async (req, res, next) => {
  try {
    const ref  = db.collection("properties").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Property not found." });

    const callerRole = req.user.role || req.userDoc?.role;
    if (callerRole !== "admin" && snap.data().landlordId !== req.user.uid) {
      return res.status(403).json({ error: "You can only delete your own properties." });
    }

    await ref.update({ isActive: false, updatedAt: new Date().toISOString() });
    res.json({ message: "Property removed." });
  } catch (err) {
    next(err);
  }
});

export default router;