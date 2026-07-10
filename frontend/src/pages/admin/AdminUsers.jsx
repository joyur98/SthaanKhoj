import { useEffect, useState } from "react"
import AdminLayout from "../../components/admin/AdminLayout"
import {
  PageHeader, LoadingState, ErrorBanner, SuccessBanner,
  DataTable, Badge, ActionButton, formatDate,
} from "../../components/admin/AdminUI"
import { getAdminUsers, disableAdminUser, setAdminUserRole } from "../../services/adminService"

const ROLE_VARIANT = { student: "info", landlord: "warning", admin: "admin" }

function AdminUsers({ darkMode, toggleDarkMode }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)

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
    if (!window.confirm(`Change this user's role to "${role}"?`)) return
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

  const columns = [
    { key: "fullName", label: "Name", render: (r) => r.fullName || "—" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (r) => <Badge variant={ROLE_VARIANT[r.role] || "default"}>{r.role || "—"}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={r.isActive !== false ? "success" : "danger"}>
          {r.isActive !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Joined", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.isActive !== false ? (
            <ActionButton
              variant="danger"
              disabled={actionId === r.id}
              onClick={() => handleDisable(r.id, true)}
            >
              Disable
            </ActionButton>
          ) : (
            <ActionButton
              variant="primary"
              disabled={actionId === r.id}
              onClick={() => handleDisable(r.id, false)}
            >
              Enable
            </ActionButton>
          )}
          {r.role !== "admin" && (
            <ActionButton
              variant="warning"
              disabled={actionId === r.id}
              onClick={() => handleRoleChange(r.id, "admin")}
            >
              Make Admin
            </ActionButton>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader title="Users" description="Manage all registered users" />
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      {loading ? <LoadingState /> : <DataTable columns={columns} rows={users} emptyMessage="No users found." />}
    </AdminLayout>
  )
}

export default AdminUsers
