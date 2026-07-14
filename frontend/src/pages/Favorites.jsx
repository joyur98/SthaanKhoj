import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Search, MapPin, Home, Heart, X, Star, Filter } from "lucide-react"
import { getSavedProperties, toggleSavedProperty } from "../services/api"

function Favorites({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("All Locations")
  const [removingId, setRemovingId] = useState(null)

  // Load saved properties from Firestore on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const properties = await getSavedProperties()
        setFavorites(properties || [])
      } catch (err) {
        console.error("Could not load favorites:", err.message)
      } finally {
        setLoading(false)
      }
    }
    loadFavorites()
  }, [])

  const handleRemoveFavorite = async (roomId) => {
    setRemovingId(roomId)
    try {
      await toggleSavedProperty(roomId)
      setTimeout(() => {
        setFavorites((prev) => prev.filter((r) => r.id !== roomId))
        setRemovingId(null)
      }, 350)
    } catch (err) {
      console.error("Could not remove favorite:", err.message)
      setRemovingId(null)
    }
  }

  const filteredFavorites = favorites.filter((room) => {
    const matchesSearch = room.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation =
      locationFilter === "All Locations" || room.location === locationFilter
    return matchesSearch && matchesLocation
  })

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 relative">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6B47] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10 translate-x-1/4 -translate-y-1/4" />

        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center space-y-6 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 rounded-full border border-rose-100/50 dark:border-rose-900/30 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400 animate-ping"></span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 tracking-wide uppercase">
              Saved Rooms
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Your <span className="bg-gradient-to-r from-rose-500 to-primary-500 bg-clip-text text-transparent">Favorite Rooms</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Rooms you've saved for later. Compare and shortlist your top picks near Kathmandu University.
          </p>

          {!loading && favorites.length > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 backdrop-blur-md shadow-sm"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {favorites.length} room{favorites.length !== 1 ? "s" : ""} saved
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-[24px] overflow-hidden border border-white/60 dark:border-white/10 animate-pulse">
                <div className="h-56 bg-gray-100 dark:bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {!loading && favorites.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] mb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Search
              </label>
              <input
                type="text"
                placeholder="Search saved rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-black dark:text-white outline-none transition focus:border-rose-400"
              />
            </div>
            <div className="md:w-64 space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-black dark:text-white outline-none transition focus:border-rose-400"
              >
                <option>All Locations</option>
                <option>Dhulikhel (KU Gate)</option>
                <option>28 Kilo</option>
                <option>Shanti Ban</option>
                <option>Banepa</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Empty state — no favorites */}
        {!loading && favorites.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-24 space-y-5"
          >
            <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-rose-100 dark:bg-rose-500/10 rounded-full animate-pulse"></div>
              <Heart className="w-10 h-10 text-rose-400 relative z-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">No saved rooms yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Browse available rooms and tap the heart icon to save your favorites here.
            </p>
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.05 } : {}}
              whileTap={!reduceMotion ? { scale: 0.95 } : {}}
              onClick={() => navigate("/find-rooms")}
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary-500 to-teal-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <span>Explore Rooms</span>
              <span>→</span>
            </motion.button>
          </motion.div>
        )}

        {/* Empty state — filters return nothing */}
        {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or location filter.</p>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredFavorites.map((room) => (
                <motion.div
                  key={room.id}
                  variants={fadeInUp}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={!reduceMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
                  className="group relative bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  style={{
                    opacity: removingId === room.id ? 0 : 1,
                    transform: removingId === room.id ? "scale(0.95)" : undefined,
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    {room.images?.[0] ? (
                      <img
                        src={room.images[0]}
                        alt={room.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/10">
                        <Home className="w-12 h-12" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Remove heart button */}
                    <motion.button
                      whileHover={!reduceMotion ? { scale: 1.1 } : {}}
                      whileTap={!reduceMotion ? { scale: 0.9 } : {}}
                      onClick={() => handleRemoveFavorite(room.id)}
                      disabled={removingId === room.id}
                      title="Remove from favorites"
                      className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center bg-rose-500 backdrop-blur-md rounded-full shadow-sm border border-rose-400/30 text-white hover:bg-rose-600 transition-all duration-200 disabled:opacity-60 z-10"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>

                    {/* Rating badge */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 border border-white/20 dark:border-white/5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{room.rating ?? "New"}</span>
                    </div>

                    {/* Room type badge */}
                    {room.roomType && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-primary-500/90 dark:bg-primary-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-primary-400/30 capitalize">
                          {room.roomType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {room.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" /> {room.location}
                      </p>
                    </div>

                    {/* Amenities */}
                    {room.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((badge, idx) => (
                          <span key={idx} className="text-[10px] font-semibold tracking-wide text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-white/5">
                            {badge}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 px-1 py-1">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price and Details button */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Rent</p>
                        <p className="font-extrabold text-lg text-primary-600 dark:text-primary-400">
                          NPR {room.price?.toLocaleString()}
                          <span className="text-gray-400 font-normal text-xs"> /month</span>
                        </p>
                      </div>
                      <motion.button
                        whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                        whileTap={!reduceMotion ? { scale: 0.95 } : {}}
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-white bg-gray-100 hover:bg-primary-50 dark:bg-white/5 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 shadow-sm border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30 active:scale-95 cursor-pointer"
                      >
                        Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Favorites