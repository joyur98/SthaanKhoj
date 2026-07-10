import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
      setSuccess(`Property ${field} updated.`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return
    setActionId(id)
    setError("")
    setSuccess("")
    try {
      await deleteAdminProperty(id)
      setSuccess("Property deleted.")
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (r) => (
        <button
          onClick={() => navigate(`/rooms/${r.id}`)}
          className="font-semibold text-[#06D6A0] hover:underline text-left max-w-[200px] truncate block"
        >
          {r.title}
        </button>
      ),
    },
    { key: "landlordName", label: "Landlord" },
    { key: "location", label: "Location" },
    {
      key: "price",
      label: "Price",
      render: (r) => `NPR ${r.price?.toLocaleString()}`,
    },
    {
      key: "isActive",
      label: "Active",
      render: (r) => (
        <Badge variant={r.isActive !== false ? "success" : "danger"}>
          {r.isActive !== false ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "isAvailable",
      label: "Available",
      render: (r) => (
        <Badge variant={r.isAvailable !== false ? "success" : "warning"}>
          {r.isAvailable !== false ? "Yes" : "No"}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Posted", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.isActive !== false ? (
            <ActionButton
              variant="warning"
              disabled={actionId === r.id}
              onClick={() => handleToggle(r.id, "isActive", false)}
            >
              Deactivate
            </ActionButton>
          ) : (
            <ActionButton
              variant="primary"
              disabled={actionId === r.id}
              onClick={() => handleToggle(r.id, "isActive", true)}
            >
              Activate
            </ActionButton>
          )}
          {r.isAvailable === false && (
            <ActionButton
              variant="default"
              disabled={actionId === r.id}
              onClick={() => handleToggle(r.id, "isAvailable", true)}
            >
              Mark Available
            </ActionButton>
          )}
          <ActionButton
            variant="danger"
            disabled={actionId === r.id}
            onClick={() => handleDelete(r.id, r.title)}
          >
            Delete
          </ActionButton>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader title="Properties" description="Manage all room listings" />
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      {loading ? <LoadingState /> : <DataTable columns={columns} rows={properties} emptyMessage="No properties found." />}
    </AdminLayout>
  )
}

export default AdminProperties
