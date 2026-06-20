import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { listenToChats } from "../services/chatService"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

function Messages({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const { user, role } = useAuth()

  const [chats, setChats] = useState([])
  const [otherUsers, setOtherUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !role) return

    setLoading(true)
    setError("")

    const unsubscribe = listenToChats(
      user.uid,
      role,
      async (chatList) => {
        setChats(chatList)
        setLoading(false)

        const userMap = {}

        await Promise.all(
          chatList.map(async (chat) => {
            const otherId = role === "student" ? chat.landlordId : chat.studentId

            if (!otherId || userMap[otherId]) return

            const snap = await getDoc(doc(db, "users", otherId))

            if (snap.exists()) {
              userMap[otherId] = snap.data()
            }
          })
        )

        setOtherUsers(userMap)
      },
      (err) => {
        console.error(err)
        setError("Could not load messages.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, role])

  const formatTime = (timestamp) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) {
      return date.toLocaleTimeString("en-NP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    return date.toLocaleDateString("en-NP", {
      day: "numeric",
      month: "short",
    })
  }

  const unreadField = role === "student" ? "unreadStudent" : "unreadLandlord"

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className="relative min-h-screen pt-28 pb-20 bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <div className="mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100/40 dark:border-primary-900/30">
              <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Inbox
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Messages
            </h1>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-dark-900/50 rounded-[20px] p-4 flex items-center gap-3 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 shrink-0" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-xl font-bold text-red-500">{error}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Please check your Firestore rules and try again.
              </p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-5xl">💬</p>

              <p className="text-xl font-bold text-gray-700 dark:text-white">
                No messages yet
              </p>

              <p className="text-sm text-gray-400 dark:text-gray-500">
                {role === "student"
                  ? "Start a conversation by contacting a landlord on a room listing."
                  : "Students will message you when they're interested in your rooms."}
              </p>

              {role === "student" && (
                <button
                  onClick={() => navigate("/find-rooms")}
                  className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#FF6B47] hover:bg-[#f55a35] shadow-[0_4px_12px_rgba(255,107,71,0.25)] transition-all hover:-translate-y-0.5"
                >
                  Browse Rooms
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const otherId = role === "student" ? chat.landlordId : chat.studentId
                const other = otherUsers[otherId]
                const unread = chat[unreadField] || 0
                const otherIsTyping =
                  role === "student" ? chat.typingLandlord : chat.typingStudent

                return (
                  <button
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="w-full bg-white dark:bg-gray-800 rounded-[20px] p-4 flex items-center gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-left shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white font-bold">
                        {other?.fullName?.charAt(0) || "?"}
                      </div>

                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p
                          className={`text-sm truncate ${
                            unread > 0
                              ? "font-bold text-gray-900 dark:text-white"
                              : "font-semibold text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {other?.fullName || "Loading..."}
                        </p>

                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold truncate mb-0.5">
                        {chat.propertyTitle || "Room"}
                      </p>

                      <p
                        className={`text-xs truncate ${
                          unread > 0
                            ? "text-gray-700 dark:text-gray-200 font-semibold"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {otherIsTyping
                          ? "typing..."
                          : chat.lastMessage || "No messages yet"}
                      </p>
                    </div>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Messages
