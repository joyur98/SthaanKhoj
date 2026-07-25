import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search } from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import {
  PageHeader, LoadingState, ErrorBanner, SuccessBanner,
  DataTable, Badge, ActionButton, formatDate,
} from "../../components/admin/AdminUI"
import { getAdminBookings, updateAdminBookingStatus } from "../../services/adminService"

const STATUS_VARIANT = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  cancelled: "default",
}

function AdminBookings({ darkMode, toggleDarkMode }) {
  const reduceMotion = useReducedMotion()
  const [bookings, setBookings] = useState([])
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
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const load = () => {
    setLoading(true)
    getAdminBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await updateAdminBookingStatus(id, status)
      setSuccess(`Booking marked as ${status}.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true
    return booking.status === filter
  })

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    accepted: bookings.filter(b => b.status === "accepted").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }

  const columns = [
    { 
      key: "propertyTitle", 
      label: "Property",
      render: (r) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {r.propertyTitle}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <motion.div
          initial={!reduceMotion ? { scale: 0.8 } : {}}
          animate={!reduceMotion ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Badge variant={STATUS_VARIANT[r.status] || "default"}>
            {r.status}
          </Badge>
        </motion.div>
      ),
    },
    { key: "startDate", label: "Start", render: (r) => formatDate(r.startDate) },
    { key: "endDate", label: "End", render: (r) => formatDate(r.endDate) },
    {
      key: "message",
      label: "Message",
      render: (r) => (
        <span className="max-w-[150px] truncate block text-gray-500">{r.message || "—"}</span>
      ),
    },
    { key: "createdAt", label: "Requested", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.status === "pending" && (
            <>
              <motion.div
                whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                whileTap={!reduceMotion ? { scale: 0.95 } : {}}
              >
                <ActionButton
                  variant="primary"
                  disabled={actionId === r.id}
                  onClick={() => handleStatus(r.id, "accepted")}
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Accept
                </ActionButton>
              </motion.div>
              <motion.div
                whileHover={!reduceMotion ? { scale: 1.05 } : {}}
                whileTap={!reduceMotion ? { scale: 0.95 } : {}}
              >
                <ActionButton
                  variant="danger"
                  disabled={actionId === r.id}
                  onClick={() => handleStatus(r.id, "rejected")}
                >
                  <XCircle className="w-3 h-3 inline mr-1" />
                  Reject
                </ActionButton>
              </motion.div>
            </>
          )}
          {r.status !== "cancelled" && r.status !== "rejected" && (
            <motion.div
              whileHover={!reduceMotion ? { scale: 1.05 } : {}}
              whileTap={!reduceMotion ? { scale: 0.95 } : {}}
            >
              <ActionButton
                variant="warning"
                disabled={actionId === r.id}
                onClick={() => handleStatus(r.id, "cancelled")}
              >
                <XCircle className="w-3 h-3 inline mr-1" />
                Cancel
              </ActionButton>
            </motion.div>
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
          title="Bookings" 
          description="View and manage all booking requests" 
        />
      </motion.div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
      >
        {[
          { label: "Total", value: stats.total, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-700/50", icon: Calendar },
          { label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", icon: Clock },
          { label: "Accepted", value: stats.accepted, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", icon: XCircle },
          { label: "Cancelled", value: stats.cancelled, color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-700/30", icon: AlertCircle },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 shadow-sm text-center ${stat.bg}`}
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
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
          { key: "all", label: "All", count: stats.total },
          { key: "pending", label: "Pending", count: stats.pending },
          { key: "accepted", label: "Accepted", count: stats.accepted },
          { key: "rejected", label: "Rejected", count: stats.rejected },
          { key: "cancelled", label: "Cancelled", count: stats.cancelled },
        ].map(({ key, label, count }) => (
          <motion.button
            key={key}
            whileHover={!reduceMotion ? { scale: 1.03 } : {}}
            whileTap={!reduceMotion ? { scale: 0.97 } : {}}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              filter === key
                ? "bg-gradient-to-r from-[#06D6A0] to-teal-500 text-white shadow-lg shadow-[#06D6A0]/20"
                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
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
              rows={filteredBookings} 
              emptyMessage={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {filter === "all" ? "No bookings found." : `No ${filter} bookings.`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {filter === "all" 
                      ? "Bookings will appear here once students make requests." 
                      : `No bookings with status "${filter}" found.`}
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

export default AdminBookings