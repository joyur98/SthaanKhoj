import { validationResult, body, param, query } from "express-validator";

/** Run after validation rules; returns 422 if any errors exist. */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// ── Reusable rule sets ────────────────────────────────────────────────────────

export const registerRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("role").isIn(["student", "landlord"]).withMessage("Role must be student or landlord."),
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
];

export const propertyRules = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("location").trim().notEmpty(),
  body("availableFrom").isISO8601().withMessage("availableFrom must be a valid date."),
];

export const bookingRules = [
  body("propertyId").trim().notEmpty(),
  body("startDate").isISO8601(),
  body("endDate").isISO8601(),
];

export const paginationRules = [
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("page").optional().isInt({ min: 1 }),
];