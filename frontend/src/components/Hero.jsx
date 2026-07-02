import { useEffect, useState } from "react"
import { BadgeCheck, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getProperties } from "../services/api"
import heroImg from "../assets/hero.png"

function Hero() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    let isMounted = true

    const fetchFeatured = async () => {
      try {
        const res = await getProperties({})
        if (!isMounted) return
        // Only keep listings that actually have a photo, take the first 3
        const withImages = (res.data || []).filter((r) => r.images?.[0])
        setRooms(withImages.slice(0, 3))
      } catch (err) {
        console.error("Could not load featured rooms:", err.message)
      }
    }

    fetchFeatured()
    return () => {
      isMounted = false
    }
  }, [])

  // Fall back to the static image if we don't have a real photo for that slot yet
  const img1 = rooms[0]?.images?.[0] || heroImg
  const img2 = rooms[1]?.images?.[0] || heroImg
  const img3 = rooms[2]?.images?.[0] || heroImg

  // Use the first featured room's rating/id for the badge + click-through, if available
  const featuredRoom = rooms[0]

  return (
    <section className="bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300 pt-32 pb-0 lg:pt-40 lg:pb-0">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left Column: Copy ──────────────────────────────────── */}
          <div className="space-y-8">

            {/* Flat teal pill badge */}
            <div>
              <span className="sk-badge-teal">
                Now Serving Dhulikhel &amp; KU Area
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-gray-900 dark:text-white">
                Find your{" "}
                <span className="inline-block relative">
                  <span className="bg-[#06D6A0] text-white px-3 pb-1">
                    perfect room
                  </span>
                </span>{" "}
                <br className="hidden sm:block" />
                near KU campus.
              </h1>

              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg font-normal">
                Safe, verified, and budget-friendly student accommodations in
                Dhulikhel — specifically vetted for Kathmandu University students.
              </p>
            </div>

            {/* Three trust badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <span className="bg-[#e6fdf6] text-[#037a57] text-sm font-bold px-4 py-2 rounded-lg -rotate-3 shadow-sm border border-[#b3f7e6] flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> Zero Commission</span>
              <span className="bg-[#e6fdf6] text-[#037a57] text-sm font-bold px-4 py-2 rounded-lg rotate-2 shadow-sm border border-[#b3f7e6] flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> KU Alumni Vetted</span>
              <span className="bg-[#e6fdf6] text-[#037a57] text-sm font-bold px-4 py-2 rounded-lg -rotate-2 shadow-sm border border-[#b3f7e6] flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> Direct Landlord Chat</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/find-rooms"
                className="px-7 py-3.5 rounded-full text-sm font-bold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-[0_6px_20px_rgba(6,214,160,0.35)] hover:shadow-[0_8px_28px_rgba(6,214,160,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Browse Rooms
              </a>
              <a
                href="/about"
                className="px-7 py-3.5 rounded-full text-sm font-bold text-gray-700 dark:text-white bg-white dark:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* ── Right Column: Scrapbook Photo Layout ──────────────────────── */}
          <div className="relative w-full h-[500px] hidden lg:block">

            {/* Large teal blob background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#9feadd] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] -z-10" />

            {/* Left large polaroid */}
            <div
              onClick={() => featuredRoom && navigate(`/rooms/${featuredRoom.id}`)}
              className={`absolute top-1/2 left-0 -translate-y-1/2 w-[260px] h-[340px] bg-white p-3 pb-10 rounded-xl shadow-xl -rotate-6 z-10 transition-transform hover:rotate-0 hover:z-50 duration-300 ${featuredRoom ? "cursor-pointer" : ""}`}
            >
              <img
                src={img1}
                alt={rooms[0]?.title || "Cozy bedroom"}
                className="w-full h-full object-cover rounded-md"
              />
              {/* Coral Rating Badge overlapping the polaroid */}
              <div className="absolute -bottom-4 -left-4 bg-[#FF6B47] text-white rounded-xl px-4 py-2 shadow-lg -rotate-12 flex flex-col items-center justify-center">
                <span className="font-black text-xl leading-none flex items-center gap-1">4.9 <Star className="w-4 h-4 fill-white" /></span>
                <span className="text-[10px] font-semibold mt-1">Rated</span>
              </div>
            </div>

            {/* Top right polaroid */}
            <div
              onClick={() => rooms[1] && navigate(`/rooms/${rooms[1].id}`)}
              className={`absolute top-4 right-0 w-[240px] h-[220px] bg-white p-3 pb-10 rounded-xl shadow-xl rotate-6 z-20 transition-transform hover:rotate-0 hover:z-50 duration-300 ${rooms[1] ? "cursor-pointer" : ""}`}
            >
              <img
                src={img2}
                alt={rooms[1]?.title || "Study area"}
                className="w-full h-full object-cover rounded-md object-center"
                style={{ objectPosition: "50% 30%" }}
              />
            </div>

            {/* Bottom right polaroid */}
            <div
              onClick={() => rooms[2] && navigate(`/rooms/${rooms[2].id}`)}
              className={`absolute bottom-4 right-4 w-[260px] h-[200px] bg-white p-3 pb-10 rounded-xl shadow-xl -rotate-2 z-30 transition-transform hover:rotate-0 hover:z-50 duration-300 ${rooms[2] ? "cursor-pointer" : ""}`}
            >
              <img
                src={img3}
                alt={rooms[2]?.title || "Living space"}
                className="w-full h-full object-cover rounded-md"
                style={{ objectPosition: "50% 70%" }}
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero
