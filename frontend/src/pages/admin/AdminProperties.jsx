import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home, MapPin, Calendar, DollarSign, Eye, Edit, Trash2, Power, PowerOff, CheckCircle, XCircle } from "lucide-react"
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
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState("all") // all, active, inactive, available, unavailable

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
          <Badge variant={r.isActive !== false ? "success" : "danger"}>
            {r.isActive !== false ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={r.isAvailable !== false ? "success" : "warning"}>
            {r.isAvailable !== false ? "Available" : "Booked"}
          </Badge>
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
          <button
            onClick={() => navigate(`/rooms/${r.id}`)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:scale-105"
            title="View Property"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Toggle Active/Inactive */}
          {r.isActive !== false ? (
            <button
              onClick={() => handleToggle(r.id, "isActive", false)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Deactivate"
            >
              <PowerOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleToggle(r.id, "isActive", true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Activate"
            >
              <Power className="w-4 h-4" />
            </button>
          )}

          {/* Mark Available */}
          {r.isAvailable === false && (
            <button
              onClick={() => handleToggle(r.id, "isAvailable", true)}
              disabled={actionId === r.id}
              className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Mark Available"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => handleDelete(r.id, r.title)}
            disabled={actionId === r.id}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-105 disabled:opacity-50"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader 
        title="Properties" 
        description="Manage all room listings across the platform" 
      />
      
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{stats.active}</p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.available}</p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{stats.inactive}</p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inactive</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: `All (${stats.total})` },
          { key: "active", label: `Active (${stats.active})` },
          { key: "inactive", label: `Inactive (${stats.inactive})` },
          { key: "available", label: `Available (${stats.available})` },
          { key: "unavailable", label: `Unavailable (${properties.length - stats.available})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
              filter === key
                ? "bg-[#06D6A0] text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <DataTable 
          columns={columns} 
          rows={filteredProperties} 
          emptyMessage={
            filter === "all" 
              ? "No properties found." 
              : `No ${filter} properties found.`
          } 
        />
      )}
    </AdminLayout>
  )
}

export default AdminProperties