import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getOrCreateChat } from "../services/chatService"

function ContactLandlordModal({ isOpen, onClose, room }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleStartChat = async () => {
    if (!user || !room) return

    try {
      setLoading(true)

      const chatId = await getOrCreateChat(
        user.uid,
        room.landlordId,
        room.id,
        room.title
      )

      onClose()
      navigate(`/chat/${chatId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] p-6 shadow-2xl border border-gray-200 dark:border-white/10">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Contact Landlord
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          Start a real-time chat with the landlord about this room.
        </p>

        <button
          onClick={handleStartChat}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Opening chat..." : "Open Chat"}
        </button>
      </div>
    </div>
  )
}

export default ContactLandlordModal