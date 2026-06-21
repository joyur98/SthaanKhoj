import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProperty } from "../services/api"
import Navbar from "../components/Navbar"
import { ViewLocationMap } from "../components/RoomMap"
import { useAuth } from "../context/AuthContext"
import { getOrCreateChat } from "../services/chatService"

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

function RoomDetail({ darkMode, toggleDarkMode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImg, setActiveImg] = useState(0)
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    getProperty(id)
      .then((data) => setRoom(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleContactLandlord = async () => {
    if (!user || !room) return
    if (!room.landlordId) return

    try {
      setChatLoading(true)
      const chatId = await getOrCreateChat(
        user.uid,
        room.landlordId,
        id,
        room.title
      )
      navigate(`/chat/${chatId}`)
    } catch (err) {
      console.error("getOrCreateChat error:", err)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className="relative min-h-screen pt-8 pb-20 bg-[#fafbfc] dark:bg-[#0b1528] transition-colors duration-300">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>

        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <button
            onClick={() => navigate("/find-rooms")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Find Rooms
          </button>

          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-72 bg-gray-100 dark:bg-white/5 rounded-[28px]" />
              <div className="h-6 bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
              <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-1/3" />
            </div>
          )}

          {error && (
            <div className="px-5 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
              ⚠ {error}
            </div>
          )}

          {room && (
            <div className="space-y-8">

              <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                {room.images?.length > 0 ? (
                  <>
                    <img
                      src={room.images[activeImg]}
                      alt={room.title}
                      className="w-full h-72 md:h-96 object-cover"
                    />
                    {room.images.length > 1 && (
                      <div className="flex gap-2 p-4 overflow-x-auto">
                        {room.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            onClick={() => setActiveImg(i)}
                            className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                              activeImg === i
                                ? "border-primary-500"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-72 flex items-center justify-center text-6xl text-gray-200 dark:text-white/10">
                    🏠
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2 space-y-6">

                  <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {room.title}
                      </h1>
                      <span className="shrink-0 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full border border-primary-100/50 dark:border-primary-900/30 capitalize">
                        {room.roomType}
                      </span>
                    </div>

                    <p className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-2">
                      📍 {room.location}
                    </p>

                    {getDistanceFromKU(room.lat, room.lng) && (
                      <p className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-semibold mb-4">
                        🎓 {getDistanceFromKU(room.lat, room.lng)} km from KU Main Gate
                      </p>
                    )}

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  {room.amenities?.length > 0 && (
                    <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                        Amenities
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((a) => (
                          <span
                            key={a}
                            className="px-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full"
                          >
                            ✓ {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <ViewLocationMap
                    lat={room.lat}
                    lng={room.lng}
                    title={room.title}
                  />

                </div>

                <div className="space-y-4">
                  <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

                    <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                      NPR {room.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
                      per month
                    </p>

                    <div className="mt-6 space-y-3">
                      <button className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all duration-300">
                        Request Booking
                      </button>
                      <button
                        onClick={handleContactLandlord}
                        disabled={chatLoading}
                        className="w-full py-3 rounded-2xl text-sm font-bold text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200 disabled:opacity-50"
                      >
                        {chatLoading ? "Opening chat..." : "Contact Landlord"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default RoomDetail