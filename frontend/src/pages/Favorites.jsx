import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import { getFavorites, removeFavorite } from "../services/favoriteService"

function Favorites({ darkMode, toggleDarkMode }) {
  const [favorites, setFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("All Locations")
  const [removingId, setRemovingId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      const data = await getFavorites()
      setFavorites(data)
      setLoading(false)
    }
    fetchFavorites()
  }, [])

  const handleRemoveFavorite = async (roomId) => {
    setRemovingId(roomId)
    try {
      await removeFavorite(roomId)
      setTimeout(() => {
        setFavorites(prev => prev.filter(room => room.roomId !== roomId))
        setRemovingId(null)
      }, 350)
    } catch (err) {
      console.error("Failed to remove favorite:", err)
      setRemovingId(null)
    }
  }

  const filteredFavorites = favorites.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "All Locations" || room.location === locationFilter
    return matchesSearch && matchesLocation
  })

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} mesh-gradient-light dark:mesh-gradient`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-rose-200/20 dark:bg-rose-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">

        {/* Header */}
        <div className="text-center space-y-6 mb-12">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 backdrop-blur-md shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-rose-500">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {favorites.length} room{favorites.length !== 1 ? "s" : ""} saved
              </span>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card dark:glass-card-dark rounded-[24px] overflow-hidden border border-white/60 dark:border-white/10 animate-pulse">
                <div className="h-56 bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2"></div>
                  <div className="flex gap-2 pt-1">
                    <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters — only show when there are favorites */}
        {!loading && favorites.length > 0 && (
          <div className="glass-card dark:glass-card-dark rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/10 mb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search saved rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none transition focus:border-rose-400"
              />
            </div>
            <div className="md:w-64 space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">
                📍 Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none transition focus:border-rose-400"
              >
                <option>All Locations</option>
                <option>Dhulikhel (KU Gate)</option>
                <option>28 Kilo</option>
                <option>Shanti Ban</option>
                <option>Banepa</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty state — no favorites at all */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-24 space-y-5">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-rose-100 dark:bg-rose-500/10 rounded-full"></div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-rose-400 relative z-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">No saved rooms yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Browse available rooms and tap the heart icon to save your favorites here.
            </p>
            <a
              href="/find-rooms"
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary-500 to-teal-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <span>Explore Rooms</span>
              <span>→</span>
            </a>
          </div>
        )}

        {/* Empty state — filters return nothing */}
        {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or location filter.</p>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map(room => (
              <div
                key={room.roomId}
                className="group relative glass-card dark:glass-card-dark rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 hover:-translate-y-1"
                style={{
                  transition: `opacity 0.35s ease, transform 0.35s ease, box-shadow 0.5s ease`,
                  opacity: removingId === room.roomId ? 0 : 1,
                  transform: removingId === room.roomId ? "scale(0.95)" : undefined,
                }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  <img
                    src={room.photos?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                    alt={room.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Remove heart button */}
                  <button
                    onClick={() => handleRemoveFavorite(room.roomId)}
                    disabled={removingId === room.roomId}
                    title="Remove from favorites"
                    className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center bg-rose-500 backdrop-blur-md rounded-full shadow-sm border border-rose-400/30 text-white hover:bg-rose-600 hover:scale-110 transition-all duration-200 active:scale-90 disabled:opacity-60"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </button>

                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 border border-white/20 dark:border-white/5">
                    <span className="text-amber-500">★</span> New
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary-500/90 dark:bg-primary-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-primary-400/30">
                      {room.roomType}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="text-primary-500">📍</span> {room.location}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.amenities?.map((amenity, idx) => (
                      <span key={idx} className="text-[10px] font-semibold tracking-wide text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-white/5">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Rent</p>
                      <p className="font-extrabold text-lg text-primary-600 dark:text-primary-400">Rs. {room.price}/mo</p>
                    </div>
                    <button className="px-5 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-white bg-gray-100 hover:bg-primary-50 dark:bg-white/5 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 shadow-sm border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30 active:scale-95 cursor-pointer">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Favorites