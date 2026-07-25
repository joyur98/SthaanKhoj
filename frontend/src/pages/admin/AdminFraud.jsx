import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle, UserX, UserCheck, Eye, EyeOff } from "lucide-react"
import AdminLayout from "../../components/admin/AdminLayout"
import {
  PageHeader, LoadingState, ErrorBanner, SuccessBanner,
  DataTable, Badge, ActionButton, formatDate,
} from "../../components/admin/AdminUI"
import {
  getAdminFraudAlerts, resolveAdminFraudAlert,
  getAdminLandlords, verifyAdminLandlord, unflagAdminLandlord,
} from "../../services/adminService"

const SEVERITY_VARIANT = { LOW: "default", MEDIUM: "warning", HIGH: "danger" }

function AdminFraud({ darkMode, toggleDarkMode }) {
  const reduceMotion = useReducedMotion()
  const [alerts, setAlerts] = useState([])
  const [landlords, setLandlords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [tab, setTab] = useState("alerts")

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
    Promise.all([getAdminFraudAlerts(), getAdminLandlords()])
      .then(([alertData, landlordData]) => {
        setAlerts(alertData)
        setLandlords(landlordData.filter((l) => l.isFlagged))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleResolve = async (id) => {
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await resolveAdminFraudAlert(id)
      setSuccess("Alert resolved.")
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleUnflag = async (id) => {
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await unflagAdminLandlord(id)
      setSuccess("Landlord unflagged.")
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleVerify = async (id) => {
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await verifyAdminLandlord(id)
      setSuccess("Landlord verified.")
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const alertColumns = [
    { 
      key: "type", 
      label: "Type", 
      render: (r) => (
        <motion.div
          initial={!reduceMotion ? { scale: 0.8 } : {}}
          animate={!reduceMotion ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Badge variant="danger">{r.type}</Badge>
        </motion.div>
      ) 
    },
    { key: "landlordName", label: "Landlord" },
    {
      key: "severity",
      label: "Severity",
      render: (r) => (
        <Badge variant={SEVERITY_VARIANT[r.severity] || "default"}>
          {r.severity}
        </Badge>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) => <span className="max-w-[250px] truncate block">{r.reason}</span>,
    },
    {
      key: "resolved",
      label: "Status",
      render: (r) => (
        <Badge variant={r.resolved ? "success" : "warning"}>
          {r.resolved ? "Resolved" : "Open"}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Date", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        !r.resolved ? (
          <motion.div
            whileHover={!reduceMotion ? { scale: 1.05 } : {}}
            whileTap={!reduceMotion ? { scale: 0.95 } : {}}
          >
            <ActionButton
              variant="primary"
              disabled={actionId === r.id}
              onClick={() => handleResolve(r.id)}
            >
              Resolve
            </ActionButton>
          </motion.div>
        ) : null,
    },
  ]

  const landlordColumns = [
    { key: "fullName", label: "Name", render: (r) => r.fullName || "—" },
    { key: "email", label: "Email" },
    {
      key: "verified",
      label: "Verified",
      render: (r) => (
        <Badge variant={r.verified ? "success" : "warning"}>
          {r.verified ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "fraudFlags",
      label: "Flags",
      render: (r) => (
        <span className="text-xs text-gray-500 max-w-[200px] truncate block">
          {(r.fraudFlags || []).map((f) => f.reason).join("; ") || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <motion.div
            whileHover={!reduceMotion ? { scale: 1.05 } : {}}
            whileTap={!reduceMotion ? { scale: 0.95 } : {}}
          >
            <ActionButton
              variant="primary"
              disabled={actionId === r.id}
              onClick={() => handleUnflag(r.id)}
            >
              Unflag
            </ActionButton>
          </motion.div>
          {!r.verified && (
            <motion.div
              whileHover={!reduceMotion ? { scale: 1.05 } : {}}
              whileTap={!reduceMotion ? { scale: 0.95 } : {}}
            >
              <ActionButton
                variant="default"
                disabled={actionId === r.id}
                onClick={() => handleVerify(r.id)}
              >
                Verify
              </ActionButton>
            </motion.div>
          )}
        </div>
      ),
    },
  ]

  const openAlertsCount = alerts.filter((a) => !a.resolved).length
  const flaggedLandlordsCount = landlords.length

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <PageHeader 
          title="Fraud & Safety" 
          description="Review fraud alerts and flagged landlords" 
        />
      </motion.div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <motion.div 
          variants={fadeInUp}
          whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{alerts.length}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Alerts</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{openAlertsCount}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open Alerts</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{flaggedLandlordsCount}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flagged Landlords</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <UserX className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          whileHover={!reduceMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                {alerts.filter((a) => a.resolved).length}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolved</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tab Buttons */}
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2 mb-6"
      >
        {[
          { key: "alerts", label: `Alerts (${openAlertsCount} open)`, icon: Shield },
          { key: "landlords", label: `Flagged Landlords (${flaggedLandlordsCount})`, icon: UserX },
        ].map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileHover={!reduceMotion ? { scale: 1.03 } : {}}
            whileTap={!reduceMotion ? { scale: 0.97 } : {}}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
              tab === key
                ? "bg-gradient-to-r from-[#06D6A0] to-teal-500 text-white shadow-lg shadow-[#06D6A0]/20"
                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
          >
            {tab === "alerts" ? (
              <DataTable 
                columns={alertColumns} 
                rows={alerts} 
                emptyMessage={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No fraud alerts.</p>
                    <p className="text-xs text-gray-400">Everything looks safe and secure.</p>
                  </motion.div>
                }
              />
            ) : (
              <DataTable 
                columns={landlordColumns} 
                rows={landlords} 
                emptyMessage={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <UserCheck className="w-12 h-12 text-green-300 dark:text-green-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No flagged landlords.</p>
                    <p className="text-xs text-gray-400">All landlords are in good standing.</p>
                  </motion.div>
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </AdminLayout>
  )
}

export default AdminFraud