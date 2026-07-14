import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { 
  Users, Home, CalendarCheck, ShieldAlert, AlertTriangle, 
  TrendingUp, TrendingDown, Activity, Bell, Clock,
  UserPlus, Building, DollarSign, Star, Sparkles
} from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import { PageHeader, LoadingState, ErrorBanner } from "../../components/admin/AdminUI"
import { getAdminStats } from "../../services/adminService"

function AdminDashboard({ darkMode, toggleDarkMode }) {
  const reduceMotion = useReducedMotion()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

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
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const scaleOnHover = {
    whileHover: !reduceMotion ? { scale: 1.03, transition: { duration: 0.2 } } : {}
  }

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Format time
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  // Calculate trends (mock data - replace with real trend data from API)
  const trends = {
    students: { change: 12, isUp: true },
    landlords: { change: 8, isUp: true },
    properties: { change: -3, isUp: false },
    bookings: { change: 25, isUp: true },
  }

  const cards = stats ? [
    { 
      label: "Students", 
      value: stats.students, 
      icon: Users, 
      color: "from-[#06D6A0] to-[#04a878]",
      bgColor: "bg-[#06D6A0]/10",
      trend: trends.students,
      description: "Active students",
      delay: 0
    },
    { 
      label: "Landlords", 
      value: stats.landlords, 
      icon: Building, 
      color: "from-[#38bdf8] to-[#0ea5e9]",
      bgColor: "bg-[#38bdf8]/10",
      trend: trends.landlords,
      description: "Registered landlords",
      delay: 0.05
    },
    { 
      label: "Active Listings", 
      value: stats.properties, 
      icon: Home, 
      color: "from-[#a78bfa] to-[#8b5cf6]",
      bgColor: "bg-[#a78bfa]/10",
      trend: trends.properties,
      description: "Available properties",
      delay: 0.1
    },
    { 
      label: "Total Bookings", 
      value: stats.bookings, 
      icon: CalendarCheck, 
      color: "from-[#f59e0b] to-[#d97706]",
      bgColor: "bg-[#f59e0b]/10",
      trend: trends.bookings,
      description: "All time bookings",
      delay: 0.15
    },
    { 
      label: "Open Fraud Alerts", 
      value: stats.openFraudAlerts, 
      icon: ShieldAlert, 
      color: "from-[#FF6B47] to-[#e05a3a]",
      bgColor: "bg-[#FF6B47]/10",
      trend: null,
      description: "Requires attention",
      delay: 0.2
    },
    { 
      label: "Flagged Landlords", 
      value: stats.flaggedLandlords, 
      icon: AlertTriangle, 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      trend: null,
      description: "Suspicious accounts",
      delay: 0.25
    },
  ] : []

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      
      {/* Welcome Section - Nepali */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-8 bg-gradient-to-r from-[#06D6A0]/10 via-[#06D6A0]/5 to-transparent dark:from-[#06D6A0]/5 rounded-2xl p-6 border border-[#06D6A0]/20 dark:border-[#06D6A0]/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              स्वागतम्!
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              SthaanKhoj प्लेटफर्मको अवस्था यहाँ हेर्नुहोस्
            </motion.p>
          </div>
          <motion.div 
            variants={fadeInUp}
            whileHover={!reduceMotion ? { scale: 1.02 } : {}}
            className="flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-100 dark:border-white/5"
          >
            <motion.div
              animate={!reduceMotion ? { rotate: 360 } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-4 h-4 text-gray-400" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formattedTime}</p>
              <p className="text-[10px] text-gray-400">{formattedDate}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <PageHeader
          title="Dashboard"
          description="Overview of your SthaanKhoj platform"
        />
      </motion.div>
      
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cards.map(({ label, value, icon: Icon, color, bgColor, trend, description, delay }) => (
              <motion.div
                key={label}
                variants={fadeInUp}
                whileHover={!reduceMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300"
                transition={{ delay }}
              >
                <div className="flex items-start justify-between">
                  <motion.div 
                    whileHover={!reduceMotion ? { scale: 1.1, rotate: -5 } : {}}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  {trend && (
                    <motion.div 
                      initial={!reduceMotion ? { scale: 0 } : {}}
                      animate={!reduceMotion ? { scale: 1 } : {}}
                      transition={{ type: "spring", stiffness: 300, delay: delay + 0.3 }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${trend.isUp ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}
                    >
                      {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.change}%
                    </motion.div>
                  )}
                </div>
                <div className="mt-4">
                  <motion.p 
                    initial={!reduceMotion ? { scale: 0.8, opacity: 0 } : {}}
                    animate={!reduceMotion ? { scale: 1, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 300, delay: delay + 0.2 }}
                    className="text-2xl font-extrabold text-gray-900 dark:text-white"
                  >
                    {value}
                  </motion.p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions / Recent Activity Section */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* Quick Actions */}
            <motion.div 
              variants={fadeInUp}
              whileHover={!reduceMotion ? { y: -2 } : {}}
              className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <motion.div
                  animate={!reduceMotion ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Activity className="w-4 h-4 text-[#06D6A0]" />
                </motion.div>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { icon: UserPlus, label: "Add New Admin", color: "[#06D6A0]" },
                  { icon: Building, label: "Manage Properties", color: "[#38bdf8]" },
                  { icon: CalendarCheck, label: "View All Bookings", color: "[#f59e0b]" },
                ].map((action, idx) => (
                  <motion.button
                    key={idx}
                    variants={fadeInUp}
                    whileHover={!reduceMotion ? { scale: 1.02, x: 4 } : {}}
                    whileTap={!reduceMotion ? { scale: 0.98 } : {}}
                    className={`w-full text-left px-4 py-2 rounded-xl bg-${action.color}/10 text-${action.color} hover:bg-${action.color}/20 transition-all text-sm font-semibold flex items-center gap-2`}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              variants={fadeInUp}
              whileHover={!reduceMotion ? { y: -2 } : {}}
              className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <motion.div
                  animate={!reduceMotion ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-4 h-4 text-[#FF6B47]" />
                </motion.div>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { color: "bg-green-500", text: "New student registered", time: "2 minutes ago" },
                  { color: "bg-amber-500", text: "New booking request", time: "15 minutes ago" },
                  { color: "bg-red-500", text: "Fraud alert detected", time: "1 hour ago" },
                  { color: "bg-blue-500", text: "New property listed", time: "3 hours ago" },
                ].map((activity, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    whileHover={!reduceMotion ? { x: 4, transition: { duration: 0.2 } } : {}}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <motion.div 
                      className={`w-2 h-2 mt-1.5 rounded-full ${activity.color}`}
                      animate={!reduceMotion ? { scale: [1, 1.5, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                    />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard