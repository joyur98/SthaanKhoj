import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Search,
  Filter,
  Pin,
  PinOff,
  Archive,
  CheckCheck,
  Circle,
  MapPin,
  Image as ImageIcon,
  X,
  ChevronRight,
  MoreVertical,
  Trash2,
  Mail,
  MailOpen,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { listenToChats } from "../services/chatService"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// A small, fixed palette of gradient pairs. Deterministic per-name so a given
// person always gets the same avatar treatment across sessions.
const AVATAR_GRADIENTS = [
  ["#FF6B47", "#FFB199"], // terracotta
  ["#0EA5A0", "#67E8DE"], // teal
  ["#6366F1", "#A5B4FC"], // indigo
  ["#F59E0B", "#FDE68A"], // amber
  ["#EC4899", "#FBCFE8"], // pink
  ["#10B981", "#6EE7B7"], // emerald
]

function hashString(str = "") {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getAvatarGradient(name) {
  const pair = AVATAR_GRADIENTS[hashString(name) % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function toDate(timestamp) {
  if (!timestamp) return null
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
}

function formatTime(timestamp) {
  const date = toDate(timestamp)
  if (!date) return ""
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) {
    return date.toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" })
  }
  if (diff < 172800000) return "Yesterday"
  return date.toLocaleDateString("en-NP", { day: "numeric", month: "short" })
}

function formatLastActive(timestamp, isOnline) {
  if (isOnline) return "Active now"
  const date = toDate(timestamp)
  if (!date) return "Offline"
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return "Active moments ago"
  if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`
  return `Active ${Math.floor(diff / 86400000)}d ago`
}

/* -------------------------------------------------------------------------- */
/*  Skeleton loader                                                            */
/* -------------------------------------------------------------------------- */

function ConversationSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-[22px] bg-white dark:bg-gray-800/60 p-4 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.03] dark:border-white/[0.04]"
        >
          <div className="w-[52px] h-[52px] rounded-full bg-gray-100 dark:bg-white/5 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 bg-gray-100 dark:bg-white/5 rounded-full w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-2/5" />
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
          </div>
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

function EmptyState({ role, onBrowse, hasFilters, onClearFilters }) {
  const reduceMotion = useReducedMotion()

  if (hasFilters) {
    return (
      <div className="text-center py-24 px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
          <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-lg font-bold text-gray-700 dark:text-white mb-1">No matches found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
          Try a different name, property, or clear your filters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-20 px-6">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="relative w-24 h-24 mx-auto mb-6"
      >
        <div
          className="absolute inset-0 rounded-[28px] opacity-90"
          style={{ background: "linear-gradient(135deg, #FF6B47 0%, #FFB199 100%)" }}
        />
        <motion.div
          animate={reduceMotion ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-4xl"
        >
          💬
        </motion.div>
      </motion.div>

      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1.5">
        {role === "student" ? "No conversations yet" : "Your inbox is empty"}
      </h2>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto mb-6">
        {role === "student"
          ? "Message a landlord from any room listing to start planning your move near Kathmandu University."
          : "When students reach out about your rooms, their messages will show up here."}
      </p>

      {role === "student" && (
        <motion.button
          onClick={onBrowse}
          animate={reduceMotion ? {} : { boxShadow: [
            "0 4px 12px rgba(255,107,71,0.20)",
            "0 4px 20px rgba(255,107,71,0.40)",
            "0 4px 12px rgba(255,107,71,0.20)",
          ] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#FF6B47] hover:bg-[#f55a35] transition-colors"
        >
          Browse rooms
        </motion.button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Conversation card                                                          */
/* -------------------------------------------------------------------------- */

const SWIPE_ACTION_WIDTH = 144

function ConversationCard({
  chat,
  other,
  unread,
  isTyping,
  isSelected,
  isPinned,
  isChecked,
  selectMode,
  onOpen,
  onTogglePin,
  onToggleRead,
  onArchive,
  onToggleCheck,
  index,
}) {
  const reduceMotion = useReducedMotion()
  const isOnline = other?.online === true
  const propertyImage = chat.propertyImage
  const lastAttachment = chat.lastMessageType // "image" | "location" | undefined
  const dragX = useRef(0)
  const [swiped, setSwiped] = useState(false)

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.3), type: "spring", stiffness: 260, damping: 24 }}
      className="relative"
    >
      {/* Swipe / hover action tray, revealed behind the card */}
      <div className="absolute inset-y-0 right-0 flex items-stretch rounded-r-[22px] overflow-hidden">
        <button
          onClick={() => onTogglePin(chat.id)}
          aria-label={isPinned ? "Unpin conversation" : "Pin conversation"}
          className="w-12 flex items-center justify-center bg-amber-400 text-white hover:bg-amber-500 transition-colors"
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onToggleRead(chat.id)}
          aria-label={unread > 0 ? "Mark as read" : "Mark as unread"}
          className="w-12 flex items-center justify-center bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {unread > 0 ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onArchive(chat.id)}
          aria-label="Archive conversation"
          className="w-12 flex items-center justify-center bg-gray-700 text-white hover:bg-gray-800 transition-colors"
        >
          <Archive className="w-4 h-4" />
        </button>
      </div>

      <motion.button
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: -SWIPE_ACTION_WIDTH, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          dragX.current = info.offset.x
          setSwiped(info.offset.x < -SWIPE_ACTION_WIDTH / 2)
        }}
        animate={{ x: swiped ? -SWIPE_ACTION_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        onClick={() => {
          if (Math.abs(dragX.current) > 8) return // was a swipe, not a tap
          if (selectMode) onToggleCheck(chat.id)
          else onOpen(chat)
        }}
        className={`group relative z-10 w-full text-left rounded-[22px] p-4 flex items-center gap-3 border transition-all duration-300
          ${isSelected
            ? "bg-primary-50/70 dark:bg-primary-950/30 border-primary-200/60 dark:border-primary-900/40"
            : "bg-white dark:bg-gray-800 border-black/[0.03] dark:border-white/[0.04] hover:border-black/[0.06] dark:hover:border-white/[0.08]"
          }
          shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none
          hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          hover:-translate-y-0.5 active:translate-y-0
        `}
      >
        {selectMode && (
          <div
            className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
              ${isChecked ? "bg-primary-500 border-primary-500" : "border-gray-300 dark:border-gray-600"}`}
          >
            {isChecked && <CheckCheck className="w-3 h-3 text-white" />}
          </div>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-bold text-base ring-2 ring-white dark:ring-gray-800"
            style={{ backgroundImage: getAvatarGradient(other?.fullName || "?") }}
          >
            {getInitials(other?.fullName)}
          </div>

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-gray-800" />
          )}

          {isPinned && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
              <Pin className="w-2.5 h-2.5 text-white" />
            </span>
          )}

          {unread > 0 && (
            <motion.div
              key={unread}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FF6B47] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
            >
              <span className="text-white text-[10px] font-bold leading-none">
                {unread > 99 ? "99+" : unread}
              </span>
            </motion.div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <p
                className={`text-[15px] truncate ${
                  unread > 0
                    ? "font-bold text-gray-900 dark:text-white"
                    : "font-semibold text-gray-600 dark:text-gray-300"
                }`}
              >
                {other?.fullName || "Unknown user"}
              </p>
              {other?.role && (
                <span
                  className={`shrink-0 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                    other.role === "landlord"
                      ? "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400"
                      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                  }`}
                >
                  {other.role}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
              {formatTime(chat.lastMessageTime)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            {propertyImage ? (
              <img
                src={propertyImage}
                alt=""
                className="w-4 h-4 rounded object-cover shrink-0"
              />
            ) : (
              <span className="w-4 h-4 rounded bg-gray-100 dark:bg-white/10 shrink-0" />
            )}
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold truncate">
              {chat.propertyTitle || "Room"}
            </p>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            {lastAttachment === "image" && (
              <ImageIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            {lastAttachment === "location" && (
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            {isTyping ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary-500">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                      className="w-1 h-1 rounded-full bg-primary-500"
                    />
                  ))}
                </span>
                typing
              </span>
            ) : (
              <p
                className={`text-xs truncate ${
                  unread > 0
                    ? "text-gray-700 dark:text-gray-200 font-semibold"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {chat.lastMessageFromMe && (
                  <CheckCheck
                    className={`inline w-3.5 h-3.5 mr-1 -mt-0.5 ${
                      chat.lastMessageRead ? "text-primary-500" : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                )}
                {chat.lastMessage || "No messages yet"}
              </p>
            )}
          </div>

          <p className="text-[10.5px] text-gray-300 dark:text-gray-600 mt-1">
            {formatLastActive(other?.lastActive, isOnline)}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
      </motion.button>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Detail panel (desktop split view)                                          */
/* -------------------------------------------------------------------------- */

function DetailPanel({ chat, other, onClose, ChatPanelComponent }) {
  if (!chat) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-10 rounded-[28px] bg-white/60 dark:bg-gray-800/30 border border-black/[0.03] dark:border-white/[0.04]">
        <div
          className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-2xl"
          style={{ background: "linear-gradient(135deg, #FF6B47 0%, #FFB199 100%)" }}
        >
          💬
        </div>
        <p className="font-bold text-gray-700 dark:text-white mb-1">Select a conversation</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          Pick a thread from the list to see the full conversation here.
        </p>
      </div>
    )
  }

  if (ChatPanelComponent) {
    return (
      <div className="hidden lg:flex flex-col h-full rounded-[28px] overflow-hidden bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/[0.04]">
        <ChatPanelComponent chatId={chat.id} />
      </div>
    )
  }

  // Graceful fallback preview when no embeddable chat component is supplied.
  return (
    <div className="hidden lg:flex flex-col h-full rounded-[28px] overflow-hidden bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/[0.04]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundImage: getAvatarGradient(other?.fullName || "?") }}
          >
            {getInitials(other?.fullName)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
              {other?.fullName || "Unknown user"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {formatLastActive(other?.lastActive, other?.online)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close conversation"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Full chat for <span className="font-semibold text-gray-600 dark:text-gray-300">{chat.propertyTitle || "this room"}</span> opens in the dedicated chat view.
        </p>
        <a
          href={`/chat/${chat.id}`}
          className="px-5 py-2 rounded-full text-sm font-bold text-white bg-[#FF6B47] hover:bg-[#f55a35] transition-colors"
        >
          Open full conversation
        </a>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

function Messages({ darkMode, toggleDarkMode, ChatPanelComponent }) {
  const navigate = useNavigate()
  const { chatId: routeChatId } = useParams()
  const { user, role } = useAuth()
  const reduceMotion = useReducedMotion()

  const [chats, setChats] = useState([])
  const [otherUsers, setOtherUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all") // "all" | "unread"
  const [pinned, setPinned] = useState(() => new Set())
  const [localReadOverrides, setLocalReadOverrides] = useState({}) // chatId -> forced unread count
  const [archived, setArchived] = useState(() => new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [checked, setChecked] = useState(() => new Set())
  const [selectedChatId, setSelectedChatId] = useState(routeChatId || null)

  const unreadField = role === "student" ? "unreadStudent" : "unreadLandlord"

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

        // Fetch each "other user" profile independently. A single blocked or
        // failing read (e.g. a Firestore rule preventing cross-user reads)
        // must NOT take down the whole batch — previously this used a bare
        // Promise.all, so one rejected getDoc() rejected the entire promise
        // and setOtherUsers() was never called, leaving every card stuck on
        // "Loading...".
        const userMap = {}
        const uniqueOtherIds = [
          ...new Set(
            chatList
              .map((chat) => (role === "student" ? chat.landlordId : chat.studentId))
              .filter(Boolean)
          ),
        ]

        await Promise.allSettled(
          uniqueOtherIds.map(async (otherId) => {
            const snap = await getDoc(doc(db, "users", otherId))
            if (snap.exists()) userMap[otherId] = snap.data()
          })
        )

        setOtherUsers((prev) => ({ ...prev, ...userMap }))
      },
      (err) => {
        console.error(err)
        setError("Could not load messages.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, role])

  const enriched = useMemo(() => {
    return chats
      .filter((c) => !archived.has(c.id))
      .map((chat) => {
        const otherId = role === "student" ? chat.landlordId : chat.studentId
        const other = otherUsers[otherId]
        const baseUnread = chat[unreadField] || 0
        const unread = localReadOverrides[chat.id] !== undefined
          ? localReadOverrides[chat.id]
          : baseUnread
        const isTyping = role === "student" ? chat.typingLandlord : chat.typingStudent
        return { chat, other, unread, isTyping, isPinned: pinned.has(chat.id) }
      })
  }, [chats, otherUsers, role, unreadField, localReadOverrides, archived, pinned])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched
      .filter(({ other, chat, unread }) => {
        if (filter === "unread" && unread === 0) return false
        if (!q) return true
        return (
          other?.fullName?.toLowerCase().includes(q) ||
          chat.propertyTitle?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
        const ta = toDate(a.chat.lastMessageTime)?.getTime() || 0
        const tb = toDate(b.chat.lastMessageTime)?.getTime() || 0
        return tb - ta
      })
  }, [enriched, query, filter])

  const unreadCount = enriched.filter((e) => e.unread > 0).length

  const togglePin = useCallback((id) => {
    setPinned((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleRead = useCallback((id) => {
    setLocalReadOverrides((prev) => {
      const current = enriched.find((e) => e.chat.id === id)?.unread || 0
      return { ...prev, [id]: current > 0 ? 0 : 1 }
    })
  }, [enriched])

  const archiveOne = useCallback((id) => {
    setArchived((prev) => new Set(prev).add(id))
  }, [])

  const toggleCheck = useCallback((id) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleOpen = (chat) => {
    setSelectedChatId(chat.id)
    // On mobile there's no split view, so navigate straight to the full chat.
    if (window.innerWidth < 1024) navigate(`/chat/${chat.id}`)
  }

  const bulkMarkRead = () => {
    setLocalReadOverrides((prev) => {
      const next = { ...prev }
      checked.forEach((id) => (next[id] = 0))
      return next
    })
    setChecked(new Set())
  }

  const bulkArchive = () => {
    setArchived((prev) => {
      const next = new Set(prev)
      checked.forEach((id) => next.add(id))
      return next
    })
    setChecked(new Set())
    setSelectMode(false)
  }

  const selected = filtered.find((e) => e.chat.id === selectedChatId)

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className="relative min-h-screen pt-28 pb-20 bg-[#FBF7F0] dark:bg-[#111827] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100/40 dark:border-primary-900/30">
                <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                  Inbox
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400">
                    · {unreadCount} unread
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>

            {chats.length > 0 && (
              <button
                onClick={() => {
                  setSelectMode((v) => !v)
                  setChecked(new Set())
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <MoreVertical className="w-3.5 h-3.5" />
                {selectMode ? "Cancel" : "Select"}
              </button>
            )}
          </div>

          {/* Search + filter bar */}
          {chats.length > 0 && (
            <div className="flex items-center gap-2 mb-5 sticky top-24 z-20">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or property..."
                  aria-label="Search conversations"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-white dark:bg-gray-800 border border-black/[0.04] dark:border-white/[0.06] text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow"
                />
              </div>

              <button
                onClick={() => setFilter((f) => (f === "unread" ? "all" : "unread"))}
                aria-pressed={filter === "unread"}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                  filter === "unread"
                    ? "bg-[#FF6B47] text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-black/[0.04] dark:border-white/[0.06]"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Unread
              </button>
            </div>
          )}

          {/* Bulk action bar */}
          <AnimatePresence>
            {selectMode && checked.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-full bg-gray-900 dark:bg-white/10 text-white"
              >
                <span className="text-xs font-bold">{checked.size} selected</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={bulkMarkRead}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <MailOpen className="w-3.5 h-3.5" /> Mark read
                  </button>
                  <button
                    onClick={bulkArchive}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Archive
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
            <div>
              {loading ? (
                <ConversationSkeleton />
              ) : error ? (
                <div className="text-center py-24 space-y-3">
                  <p className="text-xl font-bold text-red-500">{error}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Please check your Firestore rules and try again.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  role={role}
                  onBrowse={() => navigate("/find-rooms")}
                  hasFilters={chats.length > 0 && (query.trim() !== "" || filter === "unread")}
                  onClearFilters={() => {
                    setQuery("")
                    setFilter("all")
                  }}
                />
              ) : (
                <div className="space-y-2.5 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
                  <AnimatePresence initial={false}>
                    {filtered.map(({ chat, other, unread, isTyping, isPinned }, i) => (
                      <ConversationCard
                        key={chat.id}
                        chat={chat}
                        other={other}
                        unread={unread}
                        isTyping={isTyping}
                        isPinned={isPinned}
                        isSelected={selectedChatId === chat.id}
                        isChecked={checked.has(chat.id)}
                        selectMode={selectMode}
                        onOpen={handleOpen}
                        onTogglePin={togglePin}
                        onToggleRead={toggleRead}
                        onArchive={archiveOne}
                        onToggleCheck={toggleCheck}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Desktop split-view detail panel */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-260px)]">
              <DetailPanel
                chat={selected?.chat}
                other={selected?.other}
                onClose={() => setSelectedChatId(null)}
                ChatPanelComponent={ChatPanelComponent}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Messages
