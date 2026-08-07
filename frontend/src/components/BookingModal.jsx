import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyStudentProfile } from "../services/api";
import { 
  X, 
  Calendar, 
  MessageSquare, 
  User, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";

export default function BookingModal({ room, onClose, onSubmit }) {
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const modalRef = useRef(null);
  const startDateRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    getMyStudentProfile()
      .then((data) => setProfile(data))
      .catch((err) => setProfileError(err.message || "Could not load your profile."))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!startDate) {
      setError("Please select a start date.");
      startDateRef.current?.focus();
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ startDate, endDate: null, message });
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to submit booking request.");
    } finally {
      setSubmitting(false);
    }
  };

  const profileIncomplete =
    !profileLoading && !profileError && (!profile?.fullName || !profile?.phone);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format price in Nepali Rupees
  const formatNepaliPrice = (price) => {
    if (!price) return null;
    // Format with commas for thousands in Nepali style
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(price);
    return `Rs. ${formatted}`;
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white dark:bg-dark-900/95 border border-gray-100/70 dark:border-white/5 rounded-[32px] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 
                id="booking-modal-title"
                className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-primary-500" />
                Request Booking
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                {room?.title}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Room details summary */}
          {room && (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-primary-50/50 to-teal-50/50 dark:from-primary-900/10 dark:to-teal-900/10 border border-primary-100/50 dark:border-primary-800/20">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {room.title}
                  </p>
                  {room.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {room.location}
                    </p>
                  )}
                </div>
                {room.price && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatNepaliPrice(room.price)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">per month</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student info block */}
          <div className="mb-5 px-4 py-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 backdrop-blur-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Booking as
            </p>

            {profileLoading && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-3 bg-gray-200 dark:bg-white/10 animate-pulse rounded" />
                  <div className="w-24 h-2 bg-gray-200 dark:bg-white/10 animate-pulse rounded" />
                </div>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-semibold">{profileError}</p>
              </div>
            )}

            {!profileLoading && !profileError && profile && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(profile.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {profile.fullName || "Name not set"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <Phone className="w-3 h-3" />
                    {profile.phone || "Phone not set"}
                  </p>
                </div>
              </div>
            )}

            {profileIncomplete && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Your profile is missing some info. Consider updating it so landlords can reach you.
                </p>
              </motion.div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Move-in Date
              </label>
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
                aria-describedby="date-help"
              />
              {startDate && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium"
                >
                  📅 Moving in on {formatDate(startDate)}
                </motion.p>
              )}
              <p id="date-help" className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Open-ended stay — you can cancel anytime from your bookings page.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Message <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMessage(e.target.value);
                  }
                }}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell the landlord anything relevant about yourself or your stay..."
                aria-label="Message to landlord"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{message.length}/500 characters</span>
                {message.length > 450 && (
                  <span className="text-amber-500">Getting long!</span>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Request submitted successfully!
                </p>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={submitting || submitSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submitted!
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
              By submitting, you agree to our booking terms and conditions.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}