import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { 
  User, Mail, Calendar, Shield, UserCog, 
  UserCheck, UserX, Crown, Users as UsersIcon,
  Search, Filter, TrendingUp, TrendingDown
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
  const reduceMotion = useReducedMotion()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

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
    if (filter === "active") return user.isActive !== false
    if (filter === "disabled") return user.isActive === false
    if (filter === "student") return user.role === "student"
    if (filter === "landlord") return user.role === "landlord"
    if (filter === "admin") return user.role === "admin"
    if (filter === "all") return true
    return true
  }).filter(user => {
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
          <motion.div 
            whileHover={!reduceMotion ? { scale: 1.05, rotate: -5 } : {}}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06D6A0] to-[#04a878] flex items-center justify-center text-white font-bold text-sm"
          >
            {r.fullName ? r.fullName.charAt(0).toUpperCase() : "?"}
          </motion.div>
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
        <motion.div
          initial={!reduceMotion ? { scale: 0.8 } : {}}
          animate={!reduceMotion ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Badge variant={ROLE_VARIANT[r.role] || "default"}>
            <span className="flex items-center gap-1">
              {ROLE_ICONS[r.role] || <User className="w-3 h-3" />}
              {r.role || "Unknown"}
            </span>
          </Badge>
        </motion.div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <motion.div
          initial={!reduceMotion ? { scale: 0.8 } : {}}
          animate={!reduceMotion ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
        >
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
        </motion.div>
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
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleDisable(r.id, true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
              title="Disable User"
            >
              <UserX className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleDisable(r.id, false)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all disabled:opacity-50"
              title="Enable User"
            >
              <UserCheck className="w-4 h-4" />
            </motion.button>
          )}

          {/* Make Admin */}
          {r.role !== "admin" && (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleRoleChange(r.id, "admin")}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50"
              title="Make Admin"
            >
              <Crown className="w-4 h-4" />
            </motion.button>
          )}

          {/* Demote from Admin */}
          {r.role === "admin" && (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleRoleChange(r.id, "student")}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50"
              title="Demote to Student"
            >
              <UserCog className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <PageHeader 
          title="Users" 
          description="Manage all registered users on the platform" 
        />
      </motion.div>
      
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6"
      >
        {[
          { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white", icon: UsersIcon },
          { label: "Active", value: stats.active, color: "text-green-600 dark:text-green-400", icon: UserCheck },
          { label: "Disabled", value: stats.disabled, color: "text-red-600 dark:text-red-400", icon: UserX },
          { label: "Students", value: stats.students, color: "text-blue-600 dark:text-blue-400", icon: User },
          { label: "Landlords", value: stats.landlords, color: "text-amber-600 dark:text-amber-400", icon: Shield },
          { label: "Admins", value: stats.admins, color: "text-purple-600 dark:text-purple-400", icon: Crown },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 shadow-sm text-center hover:shadow-lg transition-all duration-300"
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <motion.div
            animate={!reduceMotion ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </motion.div>
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
            <motion.button
              key={key}
              whileHover={!reduceMotion ? { scale: 1.03 } : {}}
              whileTap={!reduceMotion ? { scale: 0.97 } : {}}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                filter === key
                  ? "bg-gradient-to-r from-[#06D6A0] to-teal-500 text-white shadow-lg shadow-[#06D6A0]/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <LoadingState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter + searchTerm}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
          >
            <DataTable 
              columns={columns} 
              rows={filteredUsers} 
              emptyMessage={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? `No users found matching "${searchTerm}"` 
                      : filter !== "all" 
                        ? `No ${filter} users found.` 
                        : "No users found."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {searchTerm 
                      ? "Try adjusting your search term." 
                      : filter !== "all" 
                        ? `No users with role "${filter}" found.` 
                        : "Users will appear here once they register."}
                  </p>
                </motion.div>
              }
            />
          </motion.div>
        </AnimatePresence>
      )}
    </AdminLayout>
  )
}

export default AdminUsers