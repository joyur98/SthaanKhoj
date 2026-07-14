import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Navbar from "../components/Navbar"
import { getMyStudentProfile, updateStudentProfile, getSavedProperties } from "../services/api"

function StudentProfile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [profile, setProfile] = useState(null)
  const [savedRooms, setSavedRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState("")
  const [saveMsg, setSaveMsg] = useState("")

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
    }
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

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, rooms] = await Promise.all([getMyStudentProfile(), getSavedProperties()])
        setProfile(prof)
        setPhone(prof.phone || "")
        setSavedRooms(rooms || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSavePhone = async () => {
    setSaving(true)
    setSaveMsg("")
    try {
      await updateStudentProfile({ phone })
      setSaveMsg("Saved!")
      setTimeout(() => setSaveMsg(""), 2500)
    } catch (err) {
      setSaveMsg("Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} bg-[#fafbfc] dark:bg-[#0b1528]`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} bg-[#fafbfc] dark:bg-[#0b1528]`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="fixed top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[350px] h-[350px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-8">

        {/* Profile Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl p-8 shadow-sm"
        >
          <motion.div 
            variants={fadeInUp}
            className="flex items-center gap-5 mb-8"
          >
            <motion.div 
              whileHover={!reduceMotion ? { scale: 1.05, rotate: -5 } : {}}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-primary-500/20"
            >
              {profile?.fullName?.[0]?.toUpperCase() || "S"}
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile?.fullName || "Student"}</h1>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-900/40">
                Student
              </span>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <motion.div variants={fadeInUp} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</label>
              <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {profile?.email || "—"}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98XXXXXXXX"
                  className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                />
                <motion.button
                  whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                  whileTap={!reduceMotion ? { scale: 0.95 } : {}}
                  onClick={handleSavePhone}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-sm disabled:opacity-60 transition-all active:scale-95"
                >
                  {saving ? "..." : "Save"}
                </motion.button>
              </div>
              {saveMsg && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-semibold ${saveMsg === "Saved!" ? "text-green-500" : "text-red-500"}`}
                >
                  {saveMsg}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Saved Rooms */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-500">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              Saved Rooms
              <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                {savedRooms.length}
              </span>
            </h2>
            {savedRooms.length > 0 && (
              <motion.button
                whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                onClick={() => navigate("/favorites")}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View All →
              </motion.button>
            )}
          </div>

          {savedRooms.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-3xl"
            >
              <p className="text-3xl mb-3">🏠</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No saved rooms yet.</p>
              <motion.button
                whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                onClick={() => navigate("/find-rooms")}
                className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Browse Rooms →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {savedRooms.slice(0, 4).map((room) => (
                  <motion.div
                    key={room.id}
                    variants={fadeInUp}
                    layout
                    whileHover={!reduceMotion ? { y: -4 } : {}}
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="group flex gap-4 bg-white dark:bg-dark-900/60 border border-gray-100 dark:border-white/10 rounded-2xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
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
                      <p className="text-primary-600 dark:text-primary-400 font-extrabold text-sm mt-2">
                        NPR {room.price?.toLocaleString()}<span className="text-gray-400 font-normal text-xs"> /mo</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

      </main>
    </div>
  )
}

export default StudentProfile