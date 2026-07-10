import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { createReview, getPropertyReviews } from "../services/reviewService"

function StarDisplay({ rating, size = "text-sm" }) {
  return (
    <span className={`${size} text-amber-400`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={(hover || value) >= n ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function ReviewSection({ propertyId }) {
  const { user, role } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getPropertyReviews(propertyId)
      setReviews(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const alreadyReviewed = user && reviews.some((r) => r.studentId === user.uid)

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setSubmitError("Please select a star rating.")
      return
    }
    setSubmitting(true)
    setSubmitError("")
    try {
      await createReview({ propertyId, rating, comment })
      setSuccess(true)
      setRating(0)
      setComment("")
      setShowForm(false)
      await loadReviews()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={avgRating} />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {role === "student" && !alreadyReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          ✅ Review submitted successfully!
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50/80 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
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
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience with this room..."
              className="w-full bg-white dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-red-500">{submitError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 font-semibold">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{r.studentName}</span>
                <StarDisplay rating={r.rating} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {new Date(r.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewSection