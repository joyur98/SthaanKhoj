import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getMyLandlordProfile, updateLandlordProfile, getMyProperties } from "../services/api"
import { getLandlordBookings, updateBookingStatus } from "../services/bookingService"

function LandlordProfile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [respondingId, setRespondingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState("")
  const [saveMsg, setSaveMsg] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, props] = await Promise.all([getMyLandlordProfile(), getMyProperties()])
        setProfile(prof)
        setPhone(prof.phone || "")
        setProperties(props || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getLandlordBookings()
        setBookings(data || [])
      } catch (err) {
        console.error("Failed to load booking requests:", err)
      } finally {
        setBookingsLoading(false)
      }
    }
    loadBookings()
  }, [])

  const handleRespond = async (bookingId, status) => {
    setRespondingId(bookingId)
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      )
    } catch (err) {
      console.error("Failed to update booking:", err)
    } finally {
      setRespondingId(null)
    }
  }

  const handleSavePhone = async () => {
    setSaving(true)
    setSaveMsg("")
    try {
      await updateLandlordProfile({ phone })
      setSaveMsg("Saved!")
      setTimeout(() => setSaveMsg(""), 2500)
    } catch (err) {
      setSaveMsg("Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const otherBookings = bookings.filter((b) => b.status !== "pending")

  if (loading) return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} bg-[#fafbfc] dark:bg-[#0b1528]`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} bg-[#fafbfc] dark:bg-[#0b1528]`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-8">

        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-primary-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-teal-500/20">
                {profile?.fullName?.[0]?.toUpperCase() || "L"}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile?.fullName || "Landlord"}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-900/40">
                    Landlord
                  </span>
                  {profile?.verified ? (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-3 py-1 rounded-full border border-green-100 dark:border-green-900/40 flex items-center gap-1">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/40">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/post-room")}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
            >
              + Post a Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email — read only */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</label>
              <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {profile?.email || "—"}
              </div>
            </div>

            {/* Phone — editable */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98XXXXXXXX"
                  className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                />
                <button
                  onClick={handleSavePhone}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-sm disabled:opacity-60 transition-all active:scale-95"
                >
                  {saving ? "..." : "Save"}
                </button>
              </div>
              {saveMsg && (
                <p className={`text-xs font-semibold ${saveMsg === "Saved!" ? "text-green-500" : "text-red-500"}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Requests */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Booking Requests
              {pendingBookings.length > 0 && (
                <span className="text-xs font-bold text-white bg-[#FF6B47] px-2.5 py-1 rounded-full">
                  {pendingBookings.length} new
                </span>
              )}
            </h2>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-10 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No booking requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...pendingBookings, ...otherBookings].map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          booking.status === "pending"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
                            : booking.status === "accepted"
                            ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                            : "bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-100 dark:border-red-900/30"
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          Move-in: {booking.startDate}
                        </span>
                      </div>
                      {booking.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          "{booking.message}"
                        </p>
                      )}
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleRespond(booking.id, "rejected")}
                          disabled={respondingId === booking.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleRespond(booking.id, "accepted")}
                          disabled={respondingId === booking.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-sm transition-all disabled:opacity-50"
                        >
                          {respondingId === booking.id ? "..." : "Accept"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posted Rooms */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Your Listings
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                {properties.length}
              </span>
            </h2>
            <button
              onClick={() => navigate("/post-room")}
              className="md:hidden text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              + Post Room
            </button>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl">
              <p className="text-3xl mb-3">🏠</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No listings yet.</p>
              <button
                onClick={() => navigate("/post-room")}
                className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Post your first room →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {properties.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="group flex gap-4 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
                    {room.images?.[0] ? (
                      <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <span className="text-primary-500">📍</span>{room.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-primary-600 dark:text-primary-400 font-extrabold text-sm">
                        NPR {room.price?.toLocaleString()}<span className="text-gray-400 font-normal text-xs"> /mo</span>
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        room.available
                          ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/5"
                      }`}>
                        {room.available ? "Available" : "Occupied"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default LandlordProfile