import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { 
  Home, MapPin, Calendar, DollarSign, Eye, Edit, Trash2, 
  Power, PowerOff, CheckCircle, XCircle, Building, 
  TrendingUp, TrendingDown, Filter, Search
} from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import {
  PageHeader, LoadingState, ErrorBanner, SuccessBanner,
  DataTable, Badge, ActionButton, formatDate,
} from "../../components/admin/AdminUI"
import {
  getAdminProperties, updateAdminProperty, deleteAdminProperty,
} from "../../services/adminService"

function AdminProperties({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState("all")

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
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const load = () => {
    setLoading(true)
    getAdminProperties()
      .then(setProperties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id, field, value) => {
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await updateAdminProperty(id, { [field]: value })
      setSuccess(`Property ${field === 'isActive' ? (value ? 'activated' : 'deactivated') : 'marked as available'} successfully.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`⚠️ Permanently delete "${title}"? This action cannot be undone!`)) return
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await deleteAdminProperty(id)
      setSuccess(`"${title}" deleted successfully.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    if (filter === "all") return true
    if (filter === "active") return prop.isActive !== false
    if (filter === "inactive") return prop.isActive === false
    if (filter === "available") return prop.isAvailable !== false
    if (filter === "unavailable") return prop.isAvailable === false
    return true
  })

  // Stats
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.isActive !== false).length,
    available: properties.filter(p => p.isAvailable !== false).length,
    inactive: properties.filter(p => p.isActive === false).length,
  }

  const columns = [
    {
      key: "title",
      label: "Property",
      render: (r) => (
        <div className="flex flex-col">
          <button
            onClick={() => navigate(`/rooms/${r.id}`)}
            className="font-semibold text-[#06D6A0] hover:underline text-left hover:scale-[1.02] transition-transform"
          >
            {r.title}
          </button>
          <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {r.location || "Location not specified"}
          </span>
        </div>
      ),
    },
    { 
      key: "landlordName", 
      label: "Landlord",
      render: (r) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {r.landlordName || "—"}
        </span>
      )
    },
    {
      key: "price",
      label: "Price",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">
            NPR {r.price?.toLocaleString() || "0"}
          </span>
          <span className="text-[10px] text-gray-400">per month</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <motion.div
            initial={!reduceMotion ? { scale: 0.8 } : {}}
            animate={!reduceMotion ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Badge variant={r.isActive !== false ? "success" : "danger"}>
              {r.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </motion.div>
          <motion.div
            initial={!reduceMotion ? { scale: 0.8 } : {}}
            animate={!reduceMotion ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
          >
            <Badge variant={r.isAvailable !== false ? "success" : "warning"}>
              {r.isAvailable !== false ? "Available" : "Booked"}
            </Badge>
          </motion.div>
        </div>
      ),
    },
    { 
      key: "createdAt", 
      label: "Posted", 
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-gray-700 dark:text-gray-300">{formatDate(r.createdAt)}</span>
          <span className="text-[10px] text-gray-400">ago</span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {/* View button */}
          <motion.button
            whileHover={!reduceMotion ? { scale: 1.1 } : {}}
            whileTap={!reduceMotion ? { scale: 0.9 } : {}}
            onClick={() => navigate(`/rooms/${r.id}`)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
            title="View Property"
          >
            <Eye className="w-4 h-4" />
          </motion.button>

          {/* Toggle Active/Inactive */}
          {r.isActive !== false ? (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleToggle(r.id, "isActive", false)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50"
              title="Deactivate"
            >
              <PowerOff className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleToggle(r.id, "isActive", true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all disabled:opacity-50"
              title="Activate"
            >
              <Power className="w-4 h-4" />
            </motion.button>
          )}

          {/* Mark Available */}
          {r.isAvailable === false && (
            <motion.button
              whileHover={!reduceMotion ? { scale: 1.1 } : {}}
              whileTap={!reduceMotion ? { scale: 0.9 } : {}}
              onClick={() => handleToggle(r.id, "isAvailable", true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all disabled:opacity-50"
              title="Mark Available"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.button>
          )}

          {/* Delete */}
          <motion.button
            whileHover={!reduceMotion ? { scale: 1.1 } : {}}
            whileTap={!reduceMotion ? { scale: 0.9 } : {}}
            onClick={() => handleDelete(r.id, r.title)}
            disabled={actionId === r.id}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
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
          title="Properties" 
          description="Manage all room listings across the platform" 
        />
      </motion.div>
      
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white", bg: "bg-gray-100 dark:bg-gray-700/50", icon: Home },
          { label: "Active", value: stats.active, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", icon: Power },
          { label: "Available", value: stats.available, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", icon: CheckCircle },
          { label: "Inactive", value: stats.inactive, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", icon: XCircle },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm ${stat.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-60`} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2 mb-6"
      >
        {[
          { key: "all", label: `All`, count: stats.total },
          { key: "active", label: `Active`, count: stats.active },
          { key: "inactive", label: `Inactive`, count: stats.inactive },
          { key: "available", label: `Available`, count: stats.available },
          { key: "unavailable", label: `Unavailable`, count: properties.length - stats.available },
        ].map(({ key, label, count }) => (
          <motion.button
            key={key}
            whileHover={!reduceMotion ? { scale: 1.03 } : {}}
            whileTap={!reduceMotion ? { scale: 0.97 } : {}}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              filter === key
                ? "bg-gradient-to-r from-[#06D6A0] to-teal-500 text-white shadow-lg shadow-[#06D6A0]/20"
                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            {label} ({count})
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <LoadingState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
          >
            <DataTable 
              columns={columns} 
              rows={filteredProperties} 
              emptyMessage={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {filter === "all" ? "No properties found." : `No ${filter} properties found.`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {filter === "all" 
                      ? "Properties will appear here once landlords add listings." 
                      : `No properties with status "${filter}" found.`}
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

export default AdminProperties