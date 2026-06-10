/**
 * SthaanKhoj Chatbot NLP Engine
 * Parses natural language queries to extract room search filters.
 */

// ── Known Data ────────────────────────────────────────────────────────────────
const KNOWN_LOCATIONS = [
  "dhulikhel", "kavre", "banepa", "panauti", "vandol", "kushadevi",
  "hokse", "kattike", "phulbari", "sankhu", "nagarkot",
  "bhaktapur", "kathmandu", "lalitpur", "kirtipur",
  "ku", "kathmandu university", "ku gate", "ku main gate",
];

const AMENITIES_MAP = {
  wifi: "WiFi",
  "wi-fi": "WiFi",
  "wi fi": "WiFi",
  internet: "WiFi",
  parking: "Parking",
  water: "Water Included",
  "water included": "Water Included",
  electricity: "Electricity Included",
  "electricity included": "Electricity Included",
  furnished: "Furnished",
  furniture: "Furnished",
  kitchen: "Kitchen",
  cook: "Kitchen",
  cooking: "Kitchen",
  laundry: "Laundry",
  washing: "Laundry",
  security: "Security",
  guard: "Security",
  "hot water": "Hot Water",
  geyser: "Hot Water",
  heater: "Hot Water",
  balcony: "Balcony",
  terrace: "Balcony",
  rooftop: "Balcony",
};

const ROOM_TYPE_MAP = {
  room: "room",
  rooms: "room",
  flat: "flat",
  flats: "flat",
  apartment: "flat",
  apartments: "flat",
  studio: "studio",
  studios: "studio",
  house: "house",
  houses: "house",
  pg: "pg",
  "paying guest": "pg",
};

const PRICE_KEYWORDS = {
  cheap: { max: 8000 },
  budget: { max: 8000 },
  affordable: { max: 10000 },
  "low cost": { max: 8000 },
  "low price": { max: 8000 },
  moderate: { min: 8000, max: 15000 },
  mid: { min: 8000, max: 15000 },
  "mid range": { min: 8000, max: 15000 },
  expensive: { min: 15000 },
  premium: { min: 15000 },
  luxury: { min: 20000 },
};

// ── Intent Detection ──────────────────────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|namaste|yo|sup|hola|howdy)\b/i,
  /^good\s*(morning|afternoon|evening|day)/i,
  /^what'?s\s*up/i,
];

const HELP_PATTERNS = [
  /\b(help|how|what can you|what do you|guide)\b/i,
  /\b(assist|support)\b/i,
];

const THANKS_PATTERNS = [
  /\b(thanks?|thank\s*you|thx|ty|dhanyabad|dhanyabaad)\b/i,
];

// ── Core Parser ───────────────────────────────────────────────────────────────
export function parseMessage(message) {
  const lower = message.toLowerCase().trim();

  // Detect intent
  if (GREETING_PATTERNS.some((p) => p.test(lower))) {
    return { intent: "greet", filters: null };
  }
  if (THANKS_PATTERNS.some((p) => p.test(lower))) {
    return { intent: "thanks", filters: null };
  }
  if (HELP_PATTERNS.some((p) => p.test(lower)) && lower.length < 60) {
    return { intent: "help", filters: null };
  }
  if (/\b(different location|change location|where else)\b/i.test(lower)) {
    return { intent: "ask_location", filters: null };
  }
  if (/\b(refine search|try again)\b/i.test(lower)) {
    return { intent: "help", filters: null };
  }

  // Search intent – extract filters
  const filters = {};

  // ── Extract location ──
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) {
      // Capitalize first letter of each word
      filters.location = loc
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      break;
    }
  }

  // ── Extract price range ──
  // Pattern: "under/below/less than X", "above/over/more than X"
  // Pattern: "between X and Y", "X-Y", "X to Y"
  // Pattern: "Xk" = X * 1000
  const normalizePrice = (str) => {
    let num = str.replace(/,/g, "").trim();
    if (/k$/i.test(num)) {
      num = parseFloat(num) * 1000;
    } else {
      num = parseFloat(num);
    }
    return isNaN(num) ? null : num;
  };

  // "between X and Y" or "X to Y" or "X-Y"
  const rangeMatch = lower.match(
    /(?:between|from)\s+([\d,]+k?)\s*(?:and|to|-)\s*([\d,]+k?)/i
  ) || lower.match(/([\d,]+k?)\s*(?:to|-)\s*([\d,]+k?)/i);

  if (rangeMatch) {
    const min = normalizePrice(rangeMatch[1]);
    const max = normalizePrice(rangeMatch[2]);
    if (min !== null) filters.minPrice = min;
    if (max !== null) filters.maxPrice = max;
  } else {
    // "under/below/less than X" or "max X"
    const underMatch = lower.match(
      /(?:under|below|less\s*than|max|upto|up\s*to|within|at\s*most)\s*([\d,]+k?)/i
    );
    if (underMatch) {
      const val = normalizePrice(underMatch[1]);
      if (val !== null) filters.maxPrice = val;
    }

    // "above/over/more than X" or "min X" or "at least X"
    const overMatch = lower.match(
      /(?:above|over|more\s*than|min|at\s*least|starting\s*from|from)\s*([\d,]+k?)/i
    );
    if (overMatch) {
      const val = normalizePrice(overMatch[1]);
      if (val !== null) filters.minPrice = val;
    }
  }

  // Price keywords (cheap, budget, etc.)
  if (!filters.minPrice && !filters.maxPrice) {
    for (const [keyword, range] of Object.entries(PRICE_KEYWORDS)) {
      if (lower.includes(keyword)) {
        if (range.min) filters.minPrice = range.min;
        if (range.max) filters.maxPrice = range.max;
        break;
      }
    }
  }

  // ── Extract amenities ──
  const amenities = new Set();
  // Sort by length descending so "hot water" matches before "water"
  const sortedAmenityKeys = Object.keys(AMENITIES_MAP).sort(
    (a, b) => b.length - a.length
  );
  for (const keyword of sortedAmenityKeys) {
    if (lower.includes(keyword)) {
      amenities.add(AMENITIES_MAP[keyword]);
    }
  }
  if (amenities.size > 0) {
    filters.amenities = [...amenities];
  }

  // ── Extract room type ──
  for (const [keyword, type] of Object.entries(ROOM_TYPE_MAP)) {
    // Use word boundary to avoid false matches
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(lower)) {
      filters.roomType = type;
      break;
    }
  }

  // ── Extract availability ──
  if (
    /\b(available\s*now|immediately|right\s*now|today|instant)\b/i.test(lower)
  ) {
    filters.available = "true";
  }

  // If no filters extracted at all, check if it smells like a search
  const hasFilters = Object.keys(filters).length > 0;
  if (!hasFilters) {
    // Check for generic search keywords
    if (/\b(find|search|show|list|get|look|need|want|any|browse)\b/i.test(lower)) {
      return { intent: "search", filters: {} };
    }
    return { intent: "unknown", filters: null };
  }

  return { intent: "search", filters };
}

// ── Response Generator ────────────────────────────────────────────────────────
const GREETINGS = [
  "Namaste! 🙏 I'm **SthaanBot**, your room-finding assistant. Tell me what you're looking for — location, budget, amenities — and I'll search for you!",
  "Hello! 👋 I can help you find the perfect room near KU. Just describe what you need — like *\"room in Dhulikhel under 10K with WiFi\"*",
  "Hey there! 🏠 Ready to find your ideal room? Tell me your preferences and I'll search our listings for you!",
];

const THANKS_RESPONSES = [
  "You're welcome! 😊 Let me know if you need anything else.",
  "Happy to help! 🙌 Feel free to ask anytime.",
  "Glad I could help! 🏠 Good luck with your room search!",
];

const HELP_TEXT = `Here's what I can help with! 🤖

**Search by location:**
• *"rooms in Dhulikhel"*
• *"near KU gate"*

**Search by budget:**
• *"under 10000"* or *"below 10k"*
• *"between 5k and 15k"*
• *"cheap rooms"*

**Search by amenities:**
• *"with WiFi and parking"*
• *"furnished with hot water"*

**Combine everything:**
• *"Find a furnished room in Dhulikhel under 12k with WiFi"*

Just type naturally and I'll understand! 💬`;

const NO_RESULTS_RESPONSES = [
  "I couldn't find any rooms matching those criteria 😕. Try broadening your search — maybe adjust the budget or remove some amenity filters?",
  "No listings found for that search 🔍. You could try a different location or a wider price range!",
];

const UNKNOWN_RESPONSES = [
  "I'm not sure I understood that 🤔. Try asking me to find rooms — like *\"rooms in Dhulikhel under 10K\"*. Type **help** for more examples!",
  "Hmm, I didn't quite catch that. I'm best at finding rooms! Try something like *\"furnished room with WiFi near KU\"*",
];

export function generateResponse(intent, filters, results) {
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  switch (intent) {
    case "greet":
      return {
        text: random(GREETINGS),
        suggestions: [
          "Rooms in Dhulikhel",
          "Under 10K",
          "Furnished with WiFi",
          "Show all rooms",
        ],
      };

    case "thanks":
      return { text: random(THANKS_RESPONSES), suggestions: [] };

    case "ask_location":
      return {
        text: "Where would you like to search? 📍 Try naming a place like **Dhulikhel**, **Banepa**, or **Kathmandu University**.",
        suggestions: ["Rooms in Dhulikhel", "Rooms in Banepa", "Near KU gate"],
      };

    case "help":
      return {
        text: HELP_TEXT,
        suggestions: [
          "Cheap rooms in Dhulikhel",
          "Furnished flat with WiFi",
          "Rooms under 8000",
          "Available now",
        ],
      };

    case "search": {
      if (!results || results.length === 0) {
        return {
          text: random(NO_RESULTS_RESPONSES),
          suggestions: [
            "Show all rooms",
            "Rooms under 15K",
            "Rooms in Dhulikhel",
            "Help",
          ],
        };
      }

      // Build a descriptive summary
      const parts = [];
      if (filters?.location) parts.push(`in **${filters.location}**`);
      if (filters?.maxPrice)
        parts.push(`under **NPR ${filters.maxPrice.toLocaleString()}**`);
      if (filters?.minPrice)
        parts.push(`above **NPR ${filters.minPrice.toLocaleString()}**`);
      if (filters?.amenities?.length)
        parts.push(`with **${filters.amenities.join(", ")}**`);
      if (filters?.roomType)
        parts.push(`(type: **${filters.roomType}**)`);

      const filterDesc =
        parts.length > 0
          ? ` ${parts.join(" ")}`
          : "";

      const text =
        results.length === 1
          ? `Found **1 room**${filterDesc}! Here it is:`
          : `Found **${results.length} rooms**${filterDesc}! Here are the results:`;

      return {
        text,
        results,
        suggestions: [
          "Refine search",
          "Show cheaper",
          "Different location",
          "Help",
        ],
      };
    }

    case "unknown":
    default:
      return {
        text: random(UNKNOWN_RESPONSES),
        suggestions: [
          "Help",
          "Show all rooms",
          "Rooms in Dhulikhel",
          "Under 10K with WiFi",
        ],
      };
  }
}
