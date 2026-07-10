import { useEffect, useState } from "react"
import { Users, Home, CalendarCheck, ShieldAlert, AlertTriangle } from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import { PageHeader, LoadingState, ErrorBanner } from "../../components/admin/AdminUI"
import { getAdminStats } from "../../services/adminService"

function AdminDashboard({ darkMode, toggleDarkMode }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: "Students", value: stats.students, icon: Users, color: "bg-[#06D6A0]" },
    { label: "Landlords", value: stats.landlords, icon: Users, color: "bg-[#38bdf8]" },
    { label: "Active Listings", value: stats.properties, icon: Home, color: "bg-[#a78bfa]" },
    { label: "Bookings", value: stats.bookings, icon: CalendarCheck, color: "bg-[#f59e0b]" },
    { label: "Open Fraud Alerts", value: stats.openFraudAlerts, icon: ShieldAlert, color: "bg-[#FF6B47]" },
    { label: "Flagged Landlords", value: stats.flaggedLandlords, icon: AlertTriangle, color: "bg-red-500" },
  ] : []

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader
        title="Dashboard"
        description="Overview of your SthaanKhoj platform"
      />
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminDashboard
