import { useState, useEffect } from "react"
import { getMyStudentProfile } from "../services/api"

export default function BookingModal({ room, onClose, onSubmit }) {
  const [startDate, setStartDate] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState("")

  useEffect(() => {
    getMyStudentProfile()
      .then((data) => setProfile(data))
      .catch((err) => setProfileError(err.message || "Could not load your profile."))
      .finally(() => setProfileLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!startDate) {
      setError("Please select a start date.")
      return
    }

    try {
      setSubmitting(true)
      await onSubmit({ startDate, endDate: null, message })
    } catch (err) {
      setError(err.message || "Failed to submit booking request.")
    } finally {
      setSubmitting(false)
    }
  }

  const profileIncomplete =
    !profileLoading && !profileError && (!profile?.fullName || !profile?.phone)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Request Booking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {room?.title}
        </p>

        {/* Student info block */}
        <div className="mb-5 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
            Booking as
          </p>

          {profileLoading && (
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading your profile...</p>
          )}

          {profileError && (
            <p className="text-sm text-red-500 font-semibold">{profileError}</p>
          )}

          {!profileLoading && !profileError && profile && (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {profile.fullName || "Name not set"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile.phone || "Phone not set"}
              </p>
            </div>
          )}

          {profileIncomplete && (
            <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Your profile is missing some info. Consider updating it so landlords
              can reach you — this won't block your request.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
              Move-in Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 italic">
              Open-ended stay — you can cancel anytime from your bookings page.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Tell the landlord anything relevant..."
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}//BookingModal.jsx