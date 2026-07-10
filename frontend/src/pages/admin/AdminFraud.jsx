import { useEffect, useState } from "react"
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
  const [alerts, setAlerts] = useState([])
  const [landlords, setLandlords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)
  const [tab, setTab] = useState("alerts")

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
    { key: "type", label: "Type", render: (r) => <Badge variant="danger">{r.type}</Badge> },
    { key: "landlordName", label: "Landlord" },
    {
      key: "severity",
      label: "Severity",
      render: (r) => <Badge variant={SEVERITY_VARIANT[r.severity] || "default"}>{r.severity}</Badge>,
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
          <ActionButton
            variant="primary"
            disabled={actionId === r.id}
            onClick={() => handleResolve(r.id)}
          >
            Resolve
          </ActionButton>
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
          <ActionButton
            variant="primary"
            disabled={actionId === r.id}
            onClick={() => handleUnflag(r.id)}
          >
            Unflag
          </ActionButton>
          {!r.verified && (
            <ActionButton
              variant="default"
              disabled={actionId === r.id}
              onClick={() => handleVerify(r.id)}
            >
              Verify
            </ActionButton>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader title="Fraud & Safety" description="Review fraud alerts and flagged landlords" />
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="flex gap-2 mb-6">
        {[
          { key: "alerts", label: `Alerts (${alerts.filter((a) => !a.resolved).length} open)` },
          { key: "landlords", label: `Flagged Landlords (${landlords.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              tab === key
                ? "bg-[#06D6A0] text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : tab === "alerts" ? (
        <DataTable columns={alertColumns} rows={alerts} emptyMessage="No fraud alerts." />
      ) : (
        <DataTable columns={landlordColumns} rows={landlords} emptyMessage="No flagged landlords." />
      )}
    </AdminLayout>
  )
}

export default AdminFraud
