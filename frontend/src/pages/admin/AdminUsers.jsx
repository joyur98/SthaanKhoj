import { useEffect, useState } from "react"
import { 
  User, Mail, Calendar, Shield, UserCog, 
  UserCheck, UserX, Crown, Users as UsersIcon,
  Search, Filter
} from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import {
  PageHeader, LoadingState, ErrorBanner, SuccessBanner,
  DataTable, Badge, ActionButton, formatDate,
} from "../../components/admin/AdminUI"
import { getAdminUsers, disableAdminUser, setAdminUserRole } from "../../services/adminService"

const ROLE_VARIANT = { 
  student: "info", 
  landlord: "warning", 
  admin: "admin",
  moderator: "default"
}

const ROLE_ICONS = {
  student: <User className="w-3 h-3" />,
  landlord: <Shield className="w-3 h-3" />,
  admin: <Crown className="w-3 h-3" />,
}

function AdminUsers({ darkMode, toggleDarkMode }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState("all") // all, active, disabled, student, landlord, admin
  const [searchTerm, setSearchTerm] = useState("")

  const load = () => {
    setLoading(true)
    getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDisable = async (uid, disabled) => {
    setActionId(uid)
    setError("")
    setSuccess("")
    try {
      await disableAdminUser(uid, disabled)
      setSuccess(`User ${disabled ? "disabled" : "enabled"} successfully.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleRoleChange = async (uid, role) => {
    if (!window.confirm(`⚠️ Change this user's role to "${role}"?`)) return
    setActionId(uid)
    setError("")
    setSuccess("")
    try {
      await setAdminUserRole(uid, role)
      setSuccess(`Role updated to ${role}. User must re-login for changes to take effect.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    // Status filter
    if (filter === "active") return user.isActive !== false
    if (filter === "disabled") return user.isActive === false
    if (filter === "student") return user.role === "student"
    if (filter === "landlord") return user.role === "landlord"
    if (filter === "admin") return user.role === "admin"
    if (filter === "all") return true
    
    return true
  }).filter(user => {
    // Search filter
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    )
  })

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive !== false).length,
    disabled: users.filter(u => u.isActive === false).length,
    students: users.filter(u => u.role === "student").length,
    landlords: users.filter(u => u.role === "landlord").length,
    admins: users.filter(u => u.role === "admin").length,
  }

  const columns = [
    {
      key: "fullName",
      label: "User",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06D6A0] to-[#04a878] flex items-center justify-center text-white font-bold text-sm">
            {r.fullName ? r.fullName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {r.fullName || "Unnamed User"}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {r.email || "No email"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <Badge variant={ROLE_VARIANT[r.role] || "default"}>
          <span className="flex items-center gap-1">
            {ROLE_ICONS[r.role] || <User className="w-3 h-3" />}
            {r.role || "Unknown"}
          </span>
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={r.isActive !== false ? "success" : "danger"}>
          <span className="flex items-center gap-1">
            {r.isActive !== false ? (
              <UserCheck className="w-3 h-3" />
            ) : (
              <UserX className="w-3 h-3" />
            )}
            {r.isActive !== false ? "Active" : "Disabled"}
          </span>
        </Badge>
      ),
    },
    { 
      key: "createdAt", 
      label: "Joined", 
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-gray-700 dark:text-gray-300">{formatDate(r.createdAt)}</span>
          <span className="text-[10px] text-gray-400">registered</span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {/* Toggle Active/Disabled */}
          {r.isActive !== false ? (
            <button
              onClick={() => handleDisable(r.id, true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Disable User"
            >
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleDisable(r.id, false)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Enable User"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {/* Make Admin */}
          {r.role !== "admin" && (
            <button
              onClick={() => handleRoleChange(r.id, "admin")}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Make Admin"
            >
              <Crown className="w-4 h-4" />
            </button>
          )}

          {/* Demote from Admin (optional) */}
          {r.role === "admin" && (
            <button
              onClick={() => handleRoleChange(r.id, "student")}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Demote to Student"
            >
              <UserCog className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader 
        title="Users" 
        description="Manage all registered users on the platform" 
      />
      
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-green-600 dark:text-green-400">{stats.active}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-red-600 dark:text-red-400">{stats.disabled}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Disabled</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{stats.students}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.landlords}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Landlords</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300 text-center">
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{stats.admins}</p>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admins</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] transition-all"
          />
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "All", icon: UsersIcon },
            { key: "active", label: "Active", icon: UserCheck },
            { key: "disabled", label: "Disabled", icon: UserX },
            { key: "student", label: "Students", icon: User },
            { key: "landlord", label: "Landlords", icon: Shield },
            { key: "admin", label: "Admins", icon: Crown },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                filter === key
                  ? "bg-[#06D6A0] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <DataTable 
          columns={columns} 
          rows={filteredUsers} 
          emptyMessage={
            searchTerm 
              ? `No users found matching "${searchTerm}"` 
              : filter !== "all" 
                ? `No ${filter} users found.` 
                : "No users found."
          } 
        />
      )}
    </AdminLayout>
  )
}

export default AdminUsers