import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import {
  listenToMessages,
  sendMessage,
  markAsRead,
  setTyping,
} from "../services/chatService"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { doc, getDoc, onSnapshot } from "firebase/firestore"

// Curated, lightweight emoji set — no external picker dependency needed.
const EMOJI_GROUPS = {
  Emoji: [
    "😀", "😂", "😍", "🙂", "😅", "🥲", "😴", "🤔",
    "👍", "🙏", "👋", "🤝", "✋", "👌", "🙌", "💪",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "✨",
  ],
}
const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏"]

const SUGGESTED_STARTERS = (propertyTitle) => [
  propertyTitle ? `Hi! Is "${propertyTitle}" still available?` : "Hi! Is the room still available?",
  "Can we schedule a viewing?",
  "What's included in the rent?",
  "Hello 👋",
]

function Chat({ darkMode, toggleDarkMode }) {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [chat, setChat] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  // New interaction state
  const [replyTo, setReplyTo] = useState(null)
  const [reactions, setReactions] = useState({}) // { [messageId]: { [emoji]: count } } — client-side only until wired to Firestore
  const [openReactionsFor, setOpenReactionsFor] = useState(null)
  const [activeMenuFor, setActiveMenuFor] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const [charLimit] = useState(2000)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (!user || !role || !chatId) return

    setLoading(true)
    setError("")

    const chatRef = doc(db, "chats", chatId)

    const unsubscribeChat = onSnapshot(
      chatRef,
      async (chatSnap) => {
        if (!chatSnap.exists()) {
          navigate("/messages")
          return
        }

        const chatData = chatSnap.data()

        if (user.uid !== chatData.studentId && user.uid !== chatData.landlordId) {
          navigate("/messages")
          return
        }

        setChat(chatData)

        const otherId = role === "student" ? chatData.landlordId : chatData.studentId
        const otherSnap = await getDoc(doc(db, "users", otherId))

        if (otherSnap.exists()) {
          setOtherUser(otherSnap.data())
        }

        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError("Could not load this chat.")
        setLoading(false)
      }
    )

    const unsubscribeMessages = listenToMessages(chatId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" })
      }, 100)
    })

    markAsRead(chatId, role).catch(console.error)

    return () => {
      unsubscribeChat()
      unsubscribeMessages()
      setTyping(chatId, role, false).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user, role, navigate])

  // Keyboard shortcuts: Ctrl/Cmd+F to search, Esc to close overlays
  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === "f") {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      } else if (e.key === "Escape") {
        if (showEmojiPicker) setShowEmojiPicker(false)
        else if (showSearch) setShowSearch(false)
        else if (replyTo) setReplyTo(null)
        else if (activeMenuFor) setActiveMenuFor(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showEmojiPicker, showSearch, replyTo, activeMenuFor])

  const handleSend = async (e, overrideText) => {
    e?.preventDefault?.()
    const base = (overrideText ?? text).trim()
    if (!base || sending || !user) return

    // Reply context is folded into the message body as a lightweight quote,
    // since the current sendMessage(chatId, uid, text) signature only accepts text.
    // For a persisted "replyToId" field, extend chatService.sendMessage to accept metadata.
    const msg = replyTo ? `↪ Replying to: "${truncate(replyTo.text, 60)}"\n${base}` : base

    setText("")
    setReplyTo(null)
    setSending(true)
    setError("")
    try {
      await sendMessage(chatId, user.uid, msg)
      await setTyping(chatId, role, false)
    } catch (err) {
      console.error(err)
      setError("Message could not be sent. Please try again.")
      setText(base)
    } finally {
      setSending(false)
    }
  }

  const handleTextChange = (e) => {
    const value = e.target.value.slice(0, charLimit)
    setText(value)
    if (!chatId || !role) return
    setTyping(chatId, role, true).catch(() => {})
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatId, role, false).catch(() => {})
    }, 1200)
    // Auto-resize
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + "px"
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const insertEmoji = (emoji) => {
    setText((t) => (t + emoji).slice(0, charLimit))
    inputRef.current?.focus()
  }

  const toggleReaction = (messageId, emoji) => {
    setReactions((prev) => {
      const current = { ...(prev[messageId] || {}) }
      current[emoji] = (current[emoji] || 0) + 1
      return { ...prev, [messageId]: current }
    })
    setOpenReactionsFor(null)
  }

  const copyMessage = async (msg) => {
    try {
      await navigator.clipboard.writeText(msg.text)
      setCopiedId(msg.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // Clipboard API unavailable — silently ignore
    }
    setActiveMenuFor(null)
  }

  const startReply = (msg) => {
    setReplyTo(msg)
    setActiveMenuFor(null)
    inputRef.current?.focus()
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })
  }

  const truncate = (str, len) => (str && str.length > len ? str.slice(0, len) + "…" : str)

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.trim().toLowerCase()
    return messages.filter((m) => m.text?.toLowerCase().includes(q))
  }, [messages, searchQuery])

  const groupedMessages = filteredMessages.reduce((groups, msg) => {
    const date = msg.createdAt ? formatDate(msg.createdAt) : "Just now"
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  const otherIsTyping = role === "student" ? chat?.typingLandlord : chat?.typingStudent
  const isOnline = otherUser?.online === true // wire this to your presence system if/when available

  const highlightMatch = (str) => {
    if (!searchQuery.trim()) return str
    const q = searchQuery.trim()
    const idx = str.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return str
    return (
      <>
        {str.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded px-0.5">
          {str.slice(idx, idx + q.length)}
        </mark>
        {str.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div className={`${darkMode ? "dark" : ""} flex flex-col h-screen overflow-hidden`}>
      <div className="shrink-0">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden bg-[#fafbfc] dark:bg-[#0b1528]">
        {/* Chat Header — glass, sticky */}
        <div className="shrink-0 sticky top-0 z-20 bg-white/80 dark:bg-dark-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
          <motion.button
            onClick={() => navigate("/messages")}
            whileTap={{ scale: 0.85, rotate: -8 }}
            aria-label="Back to messages"
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </motion.button>

          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-primary-500 via-teal-400 to-primary-400">
              <div className="w-full h-full rounded-full bg-white dark:bg-dark-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
                {otherUser?.fullName?.charAt(0) || "?"}
              </div>
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-dark-900">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
              {otherUser?.fullName || "Loading..."}
            </p>
            {otherIsTyping ? (
              <div className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-400">
                <span>typing</span>
                <TypingDots small />
              </div>
            ) : isOnline ? (
              <p className="text-xs text-emerald-500">Active now</p>
            ) : chat?.propertyTitle ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Re: {chat.propertyTitle}</p>
            ) : null}
          </div>

          <button
            onClick={() => {
              setShowSearch((s) => !s)
              setTimeout(() => searchInputRef.current?.focus(), 50)
            }}
            aria-label="Search in conversation"
            className={`shrink-0 p-2 rounded-xl transition-colors ${
              showSearch
                ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {chat?.propertyId && (
            <button
              onClick={() => navigate(`/rooms/${chat.propertyId}`)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              View Room
            </button>
          )}
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden bg-white dark:bg-dark-900/80 border-b border-gray-100 dark:border-white/5"
            >
              <div className="px-4 py-2 flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search this conversation…"
                  className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
                <span className="text-xs text-gray-400 shrink-0">
                  {searchQuery ? `${filteredMessages.length} match${filteredMessages.length === 1 ? "" : "es"}` : ""}
                </span>
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <TypingDots />
            </div>
          ) : error && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              otherUser={otherUser}
              chat={chat}
              navigate={navigate}
              onPickSuggestion={(s) => {
                setText(s)
                inputRef.current?.focus()
              }}
            />
          ) : (
            <AnimatePresence initial={false}>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2">{date}</span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                  </div>

                  {msgs.map((msg, i) => {
                    const isMe = msg.senderId === user.uid
                    const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)
                    const tightSpacing = i > 0 && msgs[i - 1]?.senderId === msg.senderId
                    const msgReactions = reactions[msg.id]

                    return (
                      <motion.div
                        key={msg.id}
                        layout={!prefersReducedMotion}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`group relative flex items-end gap-2 ${tightSpacing ? "mt-0.5" : "mt-3"} ${
                          isMe ? "flex-row-reverse" : "flex-row"
                        }`}
                        onMouseEnter={() => setActiveMenuFor(msg.id)}
                        onMouseLeave={() => {
                          setActiveMenuFor((cur) => (cur === msg.id ? null : cur))
                          setOpenReactionsFor((cur) => (cur === msg.id ? null : cur))
                        }}
                      >
                        {!isMe && (
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              showAvatar ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {otherUser?.fullName?.charAt(0) || "?"}
                          </div>
                        )}

                        <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col relative`}>
                          {/* Hover/quick action toolbar */}
                          <AnimatePresence>
                            {activeMenuFor === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} flex items-center gap-0.5 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-full shadow-md px-1 py-1 z-10`}
                              >
                                <button
                                  onClick={() => setOpenReactionsFor(openReactionsFor === msg.id ? null : msg.id)}
                                  aria-label="React"
                                  className="p-1.5 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                  🙂
                                </button>
                                <button
                                  onClick={() => startReply(msg)}
                                  aria-label="Reply"
                                  className="p-1.5 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 016 6v3" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => copyMessage(msg)}
                                  aria-label="Copy message"
                                  className="p-1.5 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                  {copiedId === msg.id ? (
                                    <span className="text-[10px] font-semibold text-emerald-500 px-0.5">Copied</span>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                    </svg>
                                  )}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Quick reaction picker */}
                          <AnimatePresence>
                            {openReactionsFor === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`absolute -top-16 ${isMe ? "right-0" : "left-0"} flex items-center gap-1 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-full shadow-md px-2 py-1.5 z-10`}
                              >
                                {QUICK_REACTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                    className="text-base hover:scale-125 transition-transform"
                                    aria-label={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div
                            onDoubleClick={() => toggleReaction(msg.id, "❤️")}
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words select-text ${
                              isMe
                                ? "bg-gradient-to-br from-primary-600 to-teal-500 text-white rounded-br-md"
                                : "bg-white dark:bg-dark-900/80 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-white rounded-bl-md shadow-sm"
                            }`}
                          >
                            {highlightMatch(msg.text)}
                          </div>

                          {msgReactions && Object.keys(msgReactions).length > 0 && (
                            <div className={`flex gap-1 mt-1 ${isMe ? "self-end" : "self-start"}`}>
                              {Object.entries(msgReactions).map(([emoji, count]) => (
                                <span
                                  key={emoji}
                                  className="text-[11px] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-full px-1.5 py-0.5 shadow-sm"
                                >
                                  {emoji} {count > 1 ? count : ""}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "self-end" : "self-start"}`}>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatTime(msg.createdAt)}</span>
                            {isMe && <ReadReceipt msg={msg} />}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {error && messages.length > 0 && (
          <div className="shrink-0 px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/40">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Reply preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden bg-primary-50/60 dark:bg-primary-950/20 border-t border-primary-100 dark:border-primary-900/30"
            >
              <div className="px-4 py-2 flex items-center gap-2">
                <div className="w-0.5 self-stretch bg-primary-400 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary-500">Replying to</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{truncate(replyTo.text, 80)}</p>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  aria-label="Cancel reply"
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden bg-white dark:bg-dark-900/80 border-t border-gray-100 dark:border-white/5"
            >
              <div className="px-4 py-3 max-h-40 overflow-y-auto">
                {Object.entries(EMOJI_GROUPS).map(([label, emojis]) => (
                  <div key={label} className="mb-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {emojis.map((e) => (
                        <button
                          key={e}
                          onClick={() => insertEmoji(e)}
                          className="text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <div className="shrink-0 bg-white dark:bg-dark-900/80 border-t border-gray-100 dark:border-white/5 px-4 py-3">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((s) => !s)}
              aria-label="Open emoji picker"
              className={`p-3 rounded-2xl transition-colors shrink-0 ${
                showEmojiPicker
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <span className="text-lg leading-none">😎</span>
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                disabled={sending}
                aria-label="Message input"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-4 pr-14 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 resize-none max-h-32 disabled:opacity-60"
              />
              {text.length > charLimit * 0.8 && (
                <span
                  className={`absolute bottom-2 right-3 text-[10px] font-semibold ${
                    text.length >= charLimit ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {text.length}/{charLimit}
                </span>
              )}
            </div>

            <AnimatePresence>
              <motion.button
                key="send"
                type="submit"
                disabled={!text.trim() || sending}
                initial={false}
                animate={{ scale: text.trim() ? 1 : 0.9, opacity: text.trim() ? 1 : 0.6 }}
                whileTap={{ scale: 0.85 }}
                aria-label="Send message"
                className="p-3 rounded-2xl bg-gradient-to-br from-primary-600 to-teal-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </motion.button>
            </AnimatePresence>
          </form>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 px-1">
            Enter to send · Shift+Enter for new line · Ctrl+F to search
          </p>
        </div>
      </div>
    </div>
  )
}

function TypingDots({ small }) {
  const size = small ? "w-1 h-1" : "w-2 h-2"
  return (
    <div className="flex gap-1">
      <div className={`${size} rounded-full bg-primary-400 animate-bounce`} />
      <div className={`${size} rounded-full bg-primary-400 animate-bounce`} style={{ animationDelay: "150ms" }} />
      <div className={`${size} rounded-full bg-primary-400 animate-bounce`} style={{ animationDelay: "300ms" }} />
    </div>
  )
}

function ReadReceipt({ msg }) {
  // Wire `msg.read` to your Firestore schema (e.g. set it from markAsRead) to get real read state.
  const isRead = msg.read === true
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 12"
      fill="none"
      className={`w-3.5 h-2.5 ${isRead ? "text-sky-400" : "text-gray-300 dark:text-gray-600"}`}
    >
      <path d="M1 6.5L4.5 10L11 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      {isRead && <path d="M8 6.5L11.5 10L18 2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

function EmptyState({ otherUser, chat, navigate, onPickSuggestion }) {
  const name = otherUser?.fullName?.split(" ")[0] || "them"
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full gap-4 text-center px-6"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-3xl"
      >
        💬
      </motion.div>

      <div>
        <p className="font-bold text-gray-700 dark:text-white">Start the conversation</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Say hello to {name}!</p>
      </div>

      {chat?.propertyTitle && (
        <div className="w-full max-w-xs bg-white dark:bg-dark-900/80 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-left shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Discussing</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{chat.propertyTitle}</p>
          {chat.propertyId && (
            <button
              onClick={() => navigate(`/rooms/${chat.propertyId}`)}
              className="mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              View room details →
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {SUGGESTED_STARTERS(chat?.propertyTitle).map((s) => (
          <button
            key={s}
            onClick={() => onPickSuggestion(s)}
            className="text-xs font-medium text-left px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default Chat
