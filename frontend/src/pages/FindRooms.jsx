import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Home, Phone, User, Mail } from "lucide-react"
import { getProperties, toggleSavedProperty, getSavedProperties } from "../services/api"
import Navbar from "../components/Navbar"

const ROOM_TYPE_LABELS = {
  room: "Room", flat: "Flat", studio: "Studio", house: "House", pg: "PG",
}

// KU Main Gate coordinates
const KU_LAT = 27.6193
const KU_LNG = 85.5387

const getDistanceFromKU = (lat, lng) => {
  if (!lat || !lng) return null
  const R = 6371
  const dLat = ((lat - KU_LAT) * Math.PI) / 180
  const dLng = ((lng - KU_LNG) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((KU_LAT * Math.PI) / 180) *
    Math.cos((lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2)
}

function FindRooms({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(new Set())
  const [togglingId, setTogglingId] = useState(null)
  const [filters, setFilters] = useState({
    minPrice: "", maxPrice: "", location: "", available: "",
  })
  const [applied, setApplied] = useState({})

  const fetchRooms = useCallback(async (params) => {
    setLoading(true)
    setError("")
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "")
      )
      const res = await getProperties(clean)
      setRooms(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms(applied)
  }, [applied, fetchRooms])

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const properties = await getSavedProperties()
        const ids = new Set((properties || []).map((p) => p.id))
        setSaved(ids)
      } catch (err) {
        console.error("Could not load saved properties:", err.message)
      }
    }
    loadSaved()
  }, [])

  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }))

  const applyFilters = () => setApplied({ ...filters })

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", location: "", available: "" })
    setApplied({})
  }

  const handleToggleSave = async (room) => {
    if (togglingId === room.id) return
    setTogglingId(room.id)
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(room.id) ? next.delete(room.id) : next.add(room.id)
      return next
    })
    try {
      await toggleSavedProperty(room.id)
    } catch (err) {
      setSaved((prev) => {
        const next = new Set(prev)
        next.has(room.id) ? next.delete(room.id) : next.add(room.id)
        return next
      })
      console.error("Could not save:", err.message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className="relative overflow-hidden min-h-screen pt-28 pb-20 bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9feadd] rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 translate-x-1/3 -translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="sk-badge-teal">Live Listings</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4">
              Find your{" "}
              <span className="bg-[#06D6A0] text-white px-2 py-0.5 rounded-lg">perfect room</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              Browse verified student accommodations near Kathmandu University, Dhulikhel.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] p-5 md:p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Price</label>
                <input
                  name="minPrice" type="number" value={filters.minPrice}
                  onChange={handleFilterChange} placeholder="NPR"
                  className="w-28 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Price</label>
                <input
                  name="maxPrice" type="number" value={filters.maxPrice}
                  onChange={handleFilterChange} placeholder="NPR"
                  className="w-28 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</label>
                <input
                  name="location" value={filters.location}
                  onChange={handleFilterChange} placeholder="e.g. Dhulikhel"
                  className="w-36 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Availability</label>
                <select
                  name="available" value={filters.available}
                  onChange={handleFilterChange}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50 transition-all cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="true">Available Now</option>
                </select>
              </div>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-[0_4px_14px_rgba(6,214,160,0.25)] hover:shadow-[0_6px_20px_rgba(6,214,160,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
              <AlertTriangle className="w-5 h-5" /> {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-[20px] overflow-hidden animate-pulse shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                  <div className="h-48 bg-gray-100 dark:bg-gray-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-1/2" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>

          ) : rooms.length === 0 ? (
            <div className="text-center py-24 space-y-3 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <Home className="w-10 h-10" />
              </div>
              <p className="text-xl font-bold text-gray-700 dark:text-white">No rooms found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters or check back later.</p>
            </div>

          ) : (
            <>
              <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-5">
                {rooms.length} listing{rooms.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => {
                  const isSaved = saved.has(room.id)
                  const isToggling = togglingId === room.id
                  const distance = getDistanceFromKU(room.lat, room.lng)
                  return (
                    <div
                      key={room.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden"
                    >

                      <div className="relative h-48 bg-gray-100 dark:bg-white/5 overflow-hidden">
                        {room.images?.[0] ? (
                          <img
                            src={room.images[0]} alt={room.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/10">
                            <Home className="w-12 h-12" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-white/90 dark:bg-dark-900/90 px-3 py-1 rounded-full text-xs font-extrabold text-black dark:text-white border border-gray-200/50 dark:border-white/10 backdrop-blur-md shadow-sm">
                          {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
                        </span>

                        {distance && (
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                            🎓 {distance} km from KU
                          </span>
                        )}

                        <button
                          onClick={() => handleToggleSave(room)}
                          disabled={isToggling}
                          className={`absolute top-3 right-3 p-2 bg-white/90 dark:bg-dark-900/90 rounded-full border border-gray-200/50 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-60 ${
                            isSaved ? "ring-2 ring-rose-400/40" : ""
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            strokeWidth={2} stroke="currentColor"
                            className={`w-4 h-4 transition-all duration-200 ${
                              isSaved
                                ? "fill-rose-500 stroke-rose-500 scale-110"
                                : "fill-none stroke-gray-500 dark:stroke-gray-300"
                            }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h2 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                            {room.title}
                          </h2>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {room.location}
                          </p>
                        </div>

                        <p className="text-primary-600 dark:text-primary-400 font-extrabold text-lg leading-none">
                          NPR {room.price?.toLocaleString()}
                          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs"> /month</span>
                        </p>

                        {/* ✅ LANDLORD INFO - ADDED HERE */}
                        <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {room.landlordName || "Unknown Landlord"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {room.landlordPhone || "Phone not provided"}
                            </span>
                          </div>
                        </div>

                        {room.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.slice(0, 3).map((a) => (
                              <span key={a} className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                                {a}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold px-1 py-1">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {room.availableFrom && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                            Available from{" "}
                            {new Date(room.availableFrom).toLocaleDateString("en-NP", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        )}

                        <button
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="w-full mt-1 py-2.5 rounded-full text-xs font-bold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-[0_4px_12px_rgba(6,214,160,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default FindRooms