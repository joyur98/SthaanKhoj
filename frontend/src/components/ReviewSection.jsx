import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createReview, getPropertyReviews } from "../services/reviewService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Edit2, 
  CheckCircle, 
  User, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Award,
  Clock,
  AlertCircle
} from "lucide-react";

function StarDisplay({ rating, size = "text-sm", className = "" }) {
  return (
    <span className={`${size} text-amber-400 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className="text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
          aria-label={`Rate ${n} stars`}
        >
          <span className={(hover || value) >= n ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
            ★
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function ReviewSection({ propertyId }) {
  const { user, role } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [isHovered, setIsHovered] = useState(false);
  
  const formRef = useRef(null);
  const submitButtonRef = useRef(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPropertyReviews(propertyId);
      setReviews(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showForm]);

  const alreadyReviewed = user && reviews.some((r) => r.studentId === user.uid);

  // Calculate rating statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[5 - r.rating]++;
      }
    });
    
    return {
      average,
      total,
      distribution: distribution.map(count => (count / total) * 100)
    };
  }, [reviews]);

  const avgRating = stats?.average || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await createReview({ propertyId, rating, comment });
      setSuccess(true);
      setRating(0);
      setComment("");
      setShowForm(false);
      await loadReviews();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Skeleton loader
  const ReviewSkeleton = () => (
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <motion.div 
          key={i} 
          className="bg-gray-100 dark:bg-white/5 rounded-2xl p-5 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="w-32 h-4 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="w-24 h-3 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="w-3/4 h-3 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div 
      className="text-center py-12 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-primary-500 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        No reviews yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Be the first to share your experience and help others make informed decisions.
      </p>
      {role === "student" && !alreadyReviewed && !showForm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35"
        >
          <Edit2 className="w-4 h-4" />
          Write Your Review
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <motion.div 
      className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header with rating summary */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Reviews</span>
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                ({reviews.length})
              </span>
            </h2>
            
            {reviews.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <StarDisplay rating={avgRating} size="text-lg" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stats?.total || 0} verified reviews
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {role === "student" && !alreadyReviewed && !showForm && (
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              Write a Review
            </motion.button>
          )}
        </div>

        {/* Rating distribution bars */}
        {stats && reviews.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stats.distribution[5 - stars] || 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[20px]">
                      {stars}★
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[30px] text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200/30 dark:border-amber-700/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <span>Excellent</span>
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Review submitted successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit} 
              className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/[0.03] dark:to-white/[0.01] rounded-2xl border border-gray-100 dark:border-white/5 space-y-4 backdrop-blur-sm"
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Your Rating
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setComment(e.target.value);
                    }
                  }}
                  rows={4}
                  placeholder="Share your experience with this room..."
                  className="w-full bg-white dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  maxLength={500}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{comment.length}/500 characters</span>
                  {comment.length > 450 && (
                    <span className="text-amber-500">Getting long!</span>
                  )}
                </div>
              </div>

              {submitError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-semibold text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {submitError}
                </motion.p>
              )}

              <div className="flex gap-2 flex-wrap">
                <motion.button
                  type="submit"
                  ref={submitButtonRef}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <ReviewSkeleton />
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-500 font-semibold">{error}</p>
          <button 
            onClick={loadReviews}
            className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {reviews.map((r, index) => {
            const isExpanded = expandedReviews.has(r.id);
            const shouldTruncate = r.comment && r.comment.length > 150;
            const displayComment = isExpanded || !shouldTruncate 
              ? r.comment 
              : `${r.comment.slice(0, 150)}...`;
            
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="group relative bg-white dark:bg-white/[0.02] rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {r.studentAvatar ? (
                      <img 
                        src={r.studentAvatar} 
                        alt={r.studentName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(r.studentName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {r.studentName}
                        </span>
                        {r.verified !== false && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={r.rating} />
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {displayComment}
                    </p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="mt-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
                      >
                        {isExpanded ? (
                          <>Read Less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Read More <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}

                    <div className="mt-3 flex items-center gap-4">
                      <button className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        Helpful
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Award className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default ReviewSection;