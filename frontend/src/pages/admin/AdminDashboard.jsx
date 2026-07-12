import { useEffect, useState } from "react"
import { 
  Users, Home, CalendarCheck, ShieldAlert, AlertTriangle, 
  TrendingUp, TrendingDown, Activity, Bell, Clock,
  UserPlus, Building, DollarSign, Star
} from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import { PageHeader, LoadingState, ErrorBanner } from "../../components/admin/AdminUI"
import { getAdminStats } from "../../services/adminService"

function AdminDashboard({ darkMode, toggleDarkMode }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

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
      description: "Active students"
    },
    { 
      label: "Landlords", 
      value: stats.landlords, 
      icon: Building, 
      color: "from-[#38bdf8] to-[#0ea5e9]",
      bgColor: "bg-[#38bdf8]/10",
      trend: trends.landlords,
      description: "Registered landlords"
    },
    { 
      label: "Active Listings", 
      value: stats.properties, 
      icon: Home, 
      color: "from-[#a78bfa] to-[#8b5cf6]",
      bgColor: "bg-[#a78bfa]/10",
      trend: trends.properties,
      description: "Available properties"
    },
    { 
      label: "Total Bookings", 
      value: stats.bookings, 
      icon: CalendarCheck, 
      color: "from-[#f59e0b] to-[#d97706]",
      bgColor: "bg-[#f59e0b]/10",
      trend: trends.bookings,
      description: "All time bookings"
    },
    { 
      label: "Open Fraud Alerts", 
      value: stats.openFraudAlerts, 
      icon: ShieldAlert, 
      color: "from-[#FF6B47] to-[#e05a3a]",
      bgColor: "bg-[#FF6B47]/10",
      trend: null,
      description: "Requires attention"
    },
    { 
      label: "Flagged Landlords", 
      value: stats.flaggedLandlords, 
      icon: AlertTriangle, 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      trend: null,
      description: "Suspicious accounts"
    },
  ] : []

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {/* Welcome Section - Nepali */}
      <div className="mb-8 bg-gradient-to-r from-[#06D6A0]/10 via-[#06D6A0]/5 to-transparent dark:from-[#06D6A0]/5 rounded-2xl p-6 border border-[#06D6A0]/20 dark:border-[#06D6A0]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              स्वागतम्!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              SthaanKhoj प्लेटफर्मको अवस्था यहाँ हेर्नुहोस्
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-100 dark:border-white/5">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formattedTime}</p>
              <p className="text-[10px] text-gray-400">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Dashboard"
        description="Overview of your SthaanKhoj platform"
      />
      
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ label, value, icon: Icon, color, bgColor, trend, description }) => (
              <div
                key={label}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${trend.isUp ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.change}%
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions / Recent Activity Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick Actions */}
            <div className="lg:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06D6A0]" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-xl bg-[#06D6A0]/10 text-[#06D6A0] hover:bg-[#06D6A0]/20 transition-all text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Admin
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 transition-all text-sm font-semibold flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Manage Properties
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-all text-sm font-semibold flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  View All Bookings
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B47]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">New student registered</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">New booking request</p>
                    <p className="text-xs text-gray-400">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Fraud alert detected</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">New property listed</p>
                    <p className="text-xs text-gray-400">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard