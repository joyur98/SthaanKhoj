import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, Users, Home, CalendarCheck, ShieldAlert, ArrowLeft, LogOut, Moon, Sun,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const NAV = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/properties", label: "Properties", icon: Home },
  { path: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { path: "/admin/fraud", label: "Fraud Alerts", icon: ShieldAlert },
]

function AdminLayout({ children, darkMode, toggleDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isActive = (path, end) => {
    if (end) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300">
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5">
            <div className="p-6 border-b border-gray-100 dark:border-white/5">
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#06D6A0] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">SthaanKhoj</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {NAV.map(({ path, label, icon: Icon, end }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive(path, end)
                      ? "bg-[#06D6A0]/10 text-[#04a878] dark:text-[#06D6A0]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
              <p className="px-4 text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile header */}
            <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</p>
                <button
                  onClick={() => navigate("/home")}
                  className="text-xs font-semibold text-[#06D6A0]"
                >
                  ← App
                </button>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {NAV.map(({ path, label, end }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive(path, end)
                        ? "bg-[#06D6A0] text-white"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </header>

            <main className="flex-1 p-6 md:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
