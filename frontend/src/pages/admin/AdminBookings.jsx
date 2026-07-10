import { useEffect, useState } from "react"
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
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionId, setActionId] = useState(null)

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

  const columns = [
    { key: "propertyTitle", label: "Property" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] || "default"}>{r.status}</Badge>
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
              <ActionButton
                variant="primary"
                disabled={actionId === r.id}
                onClick={() => handleStatus(r.id, "accepted")}
              >
                Accept
              </ActionButton>
              <ActionButton
                variant="danger"
                disabled={actionId === r.id}
                onClick={() => handleStatus(r.id, "rejected")}
              >
                Reject
              </ActionButton>
            </>
          )}
          {r.status !== "cancelled" && r.status !== "rejected" && (
            <ActionButton
              variant="warning"
              disabled={actionId === r.id}
              onClick={() => handleStatus(r.id, "cancelled")}
            >
              Cancel
            </ActionButton>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <PageHeader title="Bookings" description="View and manage all booking requests" />
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      {loading ? <LoadingState /> : <DataTable columns={columns} rows={bookings} emptyMessage="No bookings found." />}
    </AdminLayout>
  )
}

export default AdminBookings
