import Navbar from "../components/Navbar"
import { useState } from "react"

const DUMMY_ROOMS = [
  {
    id: 1,
    title: "Spacious Single Room near KU Gate",
    location: "Dhulikhel (KU Gate)",
    price: "Rs. 6,500/mo",
    type: "Single Room",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Free Wi-Fi", "Attached Bathroom"]
  },
  {
    id: 2,
    title: "Cozy Shared Room in 28 Kilo",
    location: "28 Kilo",
    price: "Rs. 4,500/mo",
    type: "Shared Room",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Water 24/7", "Study Desk"]
  },
  {
    id: 3,
    title: "Premium Flat for 3 Students",
    location: "Shanti Ban",
    price: "Rs. 15,000/mo",
    type: "Flat / Apartment",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Kitchen Setup", "Balcony"]
  },
  {
    id: 4,
    title: "Budget Room near Bus Park",
    location: "Banepa",
    price: "Rs. 3,500/mo",
    type: "Single Room",
    rating: "4.2",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Affordable", "Close to Market"]
  },
  {
    id: 5,
    title: "Bright Room with Sunset View",
    location: "Dhulikhel (KU Gate)",
    price: "Rs. 7,000/mo",
    type: "Single Room",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Rooftop Access", "Quiet Area"]
  },
  {
    id: 6,
    title: "2-Bed Shared Room for Boys",
    location: "28 Kilo",
    price: "Rs. 5,000/mo",
    type: "Shared Room",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1598928506311-c55dd580e2cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    badges: ["Spacious", "Hot Water"]
  }
]

// ---------- localStorage helpers ----------
const STORAGE_KEY = "sthaankhoj_favorites"

const loadFavIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))
  } catch {
    return new Set()
  }
}

const saveFavIds = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

const saveFavRoom = (room) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY + "_rooms") || "[]")
  const updated = existing.filter(r => r.id !== room.id)
  updated.push(room)
  localStorage.setItem(STORAGE_KEY + "_rooms", JSON.stringify(updated))
}

const removeFavRoom = (id) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY + "_rooms") || "[]")
  localStorage.setItem(STORAGE_KEY + "_rooms", JSON.stringify(existing.filter(r => r.id !== id)))
}
// ------------------------------------------

function FindRooms({ darkMode, toggleDarkMode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("All Locations")
  const [favoritedIds, setFavoritedIds] = useState(loadFavIds)
  const [justAdded, setJustAdded] = useState(null) // for the pop animation

  const handleToggleFavorite = (room) => {
    const isFaved = favoritedIds.has(room.id)
    const next = new Set(favoritedIds)

    if (isFaved) {
      next.delete(room.id)
      removeFavRoom(room.id)
    } else {
      next.add(room.id)
      saveFavRoom(room)
      // trigger pop animation
      setJustAdded(room.id)
      setTimeout(() => setJustAdded(null), 400)
    }

    setFavoritedIds(next)
    saveFavIds(next)
  }

  const filteredRooms = DUMMY_ROOMS.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "All Locations" || room.location === locationFilter
    return matchesSearch && matchesLocation
  })

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} mesh-gradient-light dark:mesh-gradient`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="fixed top-[-10%] left-[-10%] w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">

        {/* Header Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100/50 dark:border-primary-900/30 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-ping"></span>
            <span className="text-xs font-bold text-primary-800 dark:text-primary-400 tracking-wide uppercase">
              Live Listings
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Explore <span className="bg-gradient-to-r from-primary-500 to-teal-400 bg-clip-text text-transparent">Available Rooms</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Find the perfect student accommodation near Kathmandu University that fits your budget and lifestyle.
          </p>
        </div>

        {/* Filters Section */}
        <div className="glass-card dark:glass-card-dark rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/10 mb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none transition focus:border-primary-500"
            />
          </div>
          <div className="md:w-64 space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">
              📍 Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none transition focus:border-primary-500"
            >
              <option>All Locations</option>
              <option>Dhulikhel (KU Gate)</option>
              <option>28 Kilo</option>
              <option>Shanti Ban</option>
              <option>Banepa</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map(room => {
              const isFaved = favoritedIds.has(room.id)
              const isPopping = justAdded === room.id
              return (
                <div key={room.id} className="group relative glass-card dark:glass-card-dark rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 border border-white/60 dark:border-white/10 hover:-translate-y-1">

                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    <img
                      src={room.image}
                      alt={room.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* ❤ Heart / Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(room)}
                      title={isFaved ? "Remove from favorites" : "Save to favorites"}
                      style={{
                        transform: isPopping ? "scale(1.35)" : isFaved ? "scale(1.1)" : "scale(1)",
                        transition: "transform 0.2s cubic-bezier(.36,.07,.19,.97), background 0.2s, border-color 0.2s"
                      }}
                      className={`absolute top-4 left-4 w-9 h-9 flex items-center justify-center backdrop-blur-md rounded-full shadow-md border z-10
                        ${isFaved
                          ? "bg-rose-500 border-rose-400/40 text-white hover:bg-rose-600"
                          : "bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-white/10 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isFaved ? "currentColor" : "none"}
                        stroke={isFaved ? "none" : "currentColor"}
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>

                    {/* Rating badge */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 border border-white/20 dark:border-white/5">
                      <span className="text-amber-500">★</span> {room.rating}
                    </div>

                    {/* Room type badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary-500/90 dark:bg-primary-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-primary-400/30">
                        {room.type}
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
                      {room.badges.map((badge, idx) => (
                        <span key={idx} className="text-[10px] font-semibold tracking-wide text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-white/5">
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Rent</p>
                        <p className="font-extrabold text-lg text-primary-600 dark:text-primary-400">{room.price}</p>
                      </div>
                      <button className="px-5 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-white bg-gray-100 hover:bg-primary-50 dark:bg-white/5 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 shadow-sm border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30 active:scale-95 cursor-pointer">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No rooms found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default FindRooms