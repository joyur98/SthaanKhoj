/**
 * Centralised error handler.
 * Express recognises this as an error handler because it has 4 params.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  // Firebase / custom operational errors
  if (err.code) {
    const firebaseErrors = {
      "auth/id-token-expired":  [401, "Token expired. Please sign in again."],
      "auth/argument-error":    [400, "Invalid token."],
      "not-found":              [404, "Resource not found."],
      "already-exists":         [409, "Resource already exists."],
      "permission-denied":      [403, "Permission denied."],
    };
    const mapped = firebaseErrors[err.code];
    if (mapped) return res.status(mapped[0]).json({ error: mapped[1] });
  }

  const status  = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : "Internal server error.";
  res.status(status).json({ error: message });
};

/** Creates a structured operational error (safe to expose to client) */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode   = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}