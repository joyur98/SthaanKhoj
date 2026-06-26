import { db } from "../firebase/firebaseAdmin.js";

const MAX_LISTINGS_PER_LANDLORD = 10;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.8;
const SAME_PRICE_DUPLICATE_COUNT = 3;
const RECENT_POST_WINDOW_HOURS = 24;
const MAX_POSTS_IN_WINDOW = 5;

function stringSimilarity(a = "", b = "") {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) bigrams.add(str[i] + str[i + 1]);
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  let intersection = 0;
  bg1.forEach((bg) => { if (bg2.has(bg)) intersection++; });
  return (2 * intersection) / (bg1.size + bg2.size);
}

async function saveFraudAlert({ landlordId, propertyId = null, type, reason, severity }) {
  try {
    await db.collection("fraudAlerts").add({
      landlordId,
      propertyId,
      type,
      reason,
      severity,
      resolved: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[FraudDetection] Failed to save alert:", err.message);
  }
}

async function flagLandlord(landlordId, reason) {
  try {
    const ref = db.collection("landlords").doc(landlordId);
    const snap = await ref.get();
    if (!snap.exists) return;

    const existing = snap.data().fraudFlags || [];
    await ref.update({
      isFlagged: true,
      fraudFlags: [...existing, { reason, flaggedAt: new Date().toISOString() }],
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[FraudDetection] Failed to flag landlord:", err.message);
  }
}

export async function detectFraud(landlordId, newProperty) {
  try {
    const snap = await db
      .collection("properties")
      .where("landlordId", "==", landlordId)
      .where("isActive", "==", true)
      .get();

    const existingListings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Check 1: Total listings cap
    if (existingListings.length >= MAX_LISTINGS_PER_LANDLORD) {
      await saveFraudAlert({
        landlordId,
        type: "SUSPICIOUS_PATTERN",
        reason: `Landlord has ${existingListings.length} active listings — exceeds limit of ${MAX_LISTINGS_PER_LANDLORD}.`,
        severity: "MEDIUM",
      });
      await flagLandlord(landlordId, `Exceeded listing cap (${existingListings.length} listings)`);
    }

    // Check 2: Spam posting in last 24 hours — HARD BLOCK
    const windowStart = new Date(Date.now() - RECENT_POST_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const recentPosts = existingListings.filter((p) => p.createdAt >= windowStart);

    if (recentPosts.length >= MAX_POSTS_IN_WINDOW) {
      await saveFraudAlert({
        landlordId,
        type: "SPAM_POSTING",
        reason: `Landlord posted ${recentPosts.length} listings in the last ${RECENT_POST_WINDOW_HOURS} hours.`,
        severity: "HIGH",
      });
      await flagLandlord(landlordId, `Rapid spam posting: ${recentPosts.length} posts in 24h`);

      return {
        passed: false,
        reason: `You have posted ${recentPosts.length} listings in the last 24 hours. Please wait before posting more.`,
      };
    }

    // Check 3: Duplicate title — HARD BLOCK
    const duplicates = existingListings.filter((p) => {
      const similarity = stringSimilarity(p.title, newProperty.title);
      return similarity >= DUPLICATE_SIMILARITY_THRESHOLD;
    });

    if (duplicates.length > 0) {
      await saveFraudAlert({
        landlordId,
        propertyId: duplicates[0].id,
        type: "DUPLICATE_LISTING",
        reason: `New listing "${newProperty.title}" is ${Math.round(stringSimilarity(duplicates[0].title, newProperty.title) * 100)}% similar to existing listing "${duplicates[0].title}".`,
        severity: "HIGH",
      });
      await flagLandlord(landlordId, `Duplicate listing detected: "${newProperty.title}"`);

      return {
        passed: false,
        reason: "A very similar listing already exists. Please edit your existing listing instead of posting a duplicate.",
      };
    }

    // Check 4: Same price + same location pattern
    const samePriceLocation = existingListings.filter(
      (p) =>
        p.price === parseFloat(newProperty.price) &&
        p.location?.toLowerCase() === newProperty.location?.toLowerCase()
    );

    if (samePriceLocation.length >= SAME_PRICE_DUPLICATE_COUNT) {
      await saveFraudAlert({
        landlordId,
        type: "SUSPICIOUS_PATTERN",
        reason: `Landlord has ${samePriceLocation.length} listings at Rs.${newProperty.price} in "${newProperty.location}".`,
        severity: "MEDIUM",
      });
      await flagLandlord(landlordId, `Multiple identical price+location listings in ${newProperty.location}`);
    }

    return { passed: true };

  } catch (err) {
    console.error("[FraudDetection] Error during fraud check:", err.message);
    return { passed: true };
  }
}