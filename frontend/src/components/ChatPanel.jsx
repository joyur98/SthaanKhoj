import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import {
  listenToMessages,
  sendMessage,
  markAsRead,
  setTyping,
} from "../services/chatService"
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

function ChatPanel({ chatId, hideBackButton = false, onInvalidChat }) {
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
  const [reactions, setReactions] = useState({}) // { [messageId]: { [emoji]: count } }
  const [openReactionsFor, setOpenReactionsFor] = useState(null)
  const [activeMenuFor, setActiveMenuFor] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const [charLimit] = useState(2000)

  const bottomRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const searchInputRef = useRef(null)

  const prevChatIdRef = useRef(null)
  const onInvalidChatRef = useRef(onInvalidChat)

  useEffect(() => {
    onInvalidChatRef.current = onInvalidChat
  }, [onInvalidChat])

  useEffect(() => {
    if (!user || !role || !chatId) return

    Promise.resolve().then(() => {
      if (prevChatIdRef.current !== chatId) {
        setLoading(true)
        prevChatIdRef.current = chatId
      }
      setError("")
    })

    const chatRef = doc(db, "chats", chatId)

    const unsubscribeChat = onSnapshot(
      chatRef,
      async (chatSnap) => {
        if (!chatSnap.exists()) {
          if (onInvalidChatRef.current) onInvalidChatRef.current()
          else navigate("/messages")
          return
        }

        const chatData = chatSnap.data()

        if (user.uid !== chatData.studentId && user.uid !== chatData.landlordId) {
          if (onInvalidChatRef.current) onInvalidChatRef.current()
          else navigate("/messages")
          return
        }

        setChat(chatData)

        const otherId = role === "student" ? chatData.landlordId : chatData.studentId
        try {
          const otherSnap = await getDoc(doc(db, "users", otherId))
          if (otherSnap.exists()) {
            setOtherUser(otherSnap.data())
          }
        } catch (err) {
          console.error("Failed to load other user profile:", err)
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
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          })
        }
      }, 100)
    })

    markAsRead(chatId, role).catch(console.error)

    return () => {
      unsubscribeChat()
      unsubscribeMessages()
      setTyping(chatId, role, false).catch(() => {})
    }
  }, [chatId, user, role, navigate, prefersReducedMotion])

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
      // Ignore
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
  const isOnline = otherUser?.online === true

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
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="shrink-0 sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 border-b border-black/[0.04] dark:border-white/[0.06] px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {!hideBackButton && (
            <motion.button
              onClick={() => navigate("/messages")}
              whileTap={{ scale: 0.85, rotate: -8 }}
              aria-label="Back to messages"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </motion.button>
          )}

          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-[#06D6A0] via-teal-400 to-[#FF6B47]">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-[#FF6B47] dark:text-[#FFB199] font-black text-sm">
                {otherUser?.fullName?.charAt(0) || "?"}
              </div>
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
            )}
          </div>

          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 dark:text-white text-sm truncate">
              {otherUser?.fullName || "Loading..."}
            </p>
            {otherIsTyping ? (
              <div className="flex items-center gap-1 text-[11px] text-[#06D6A0] font-bold">
                <span>typing</span>
                <TypingDots small />
              </div>
            ) : isOnline ? (
              <p className="text-[11px] text-emerald-500 font-bold">Active now</p>
            ) : chat?.propertyTitle ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate font-semibold">
                Re: {chat.propertyTitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSearch((s) => !s)
              setTimeout(() => searchInputRef.current?.focus(), 50)
            }}
            aria-label="Search in conversation"
            className={`shrink-0 p-2 rounded-xl transition-colors ${
              showSearch
                ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                : "text-gray-500 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/5"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {chat?.propertyId && (
            <button
              onClick={() => navigate(`/rooms/${chat.propertyId}`)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-[#06D6A0] border border-[#06D6A0]/20 hover:bg-[#06D6A0]/10 transition-all active:scale-95"
            >
              View Room
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 border-b border-black/[0.04] dark:border-white/5"
          >
            <div className="px-5 py-3 flex items-center gap-2">
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search this conversation…"
                className="flex-1 bg-gray-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50"
              />
              <span className="text-xs text-gray-400 shrink-0 font-bold">
                {searchQuery ? `${filteredMessages.length} match${filteredMessages.length === 1 ? "" : "es"}` : ""}
              </span>
              <button
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery("")
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-[#FBF7F0]/20 dark:bg-[#111827]/10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <TypingDots />
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : error && messages.length > 0 ? (
          <div />
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
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-black/[0.04] dark:bg-white/5" />
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">{date}</span>
                  <div className="flex-1 h-px bg-black/[0.04] dark:bg-white/5" />
                </div>

                {msgs.map((msg, i) => {
                  const isMe = msg.senderId === user.uid
                  const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)
                  const tightSpacing = i > 0 && msgs[i - 1]?.senderId === msg.senderId
                  const msgReactions = reactions[msg.id]

                  return (
                    <div
                      key={msg.id}
                      className={`group relative flex items-end gap-2.5 ${tightSpacing ? "mt-0.5" : "mt-4"} ${
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
                          className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#06D6A0] to-teal-400 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm ${
                            showAvatar ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {otherUser?.fullName?.charAt(0) || "?"}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col relative`}>
                        {/* Hover Quick-Menu */}
                        <AnimatePresence>
                          {activeMenuFor === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className={`absolute -top-9 ${isMe ? "right-1" : "left-1"} flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-black/[0.04] dark:border-white/10 rounded-full shadow-lg px-1.5 py-0.5 z-10`}
                            >
                              <button
                                onClick={() => setOpenReactionsFor(openReactionsFor === msg.id ? null : msg.id)}
                                aria-label="React"
                                className="p-1 rounded-full text-xs hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                              >
                                🙂
                              </button>
                              <button
                                onClick={() => startReply(msg)}
                                aria-label="Reply"
                                className="p-1 text-gray-500 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/10 rounded-full transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 016 6v3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => copyMessage(msg)}
                                aria-label="Copy message"
                                className="p-1 text-gray-500 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/10 rounded-full transition-colors"
                              >
                                {copiedId === msg.id ? (
                                  <span className="text-[9px] font-black text-emerald-500 px-1">Copied</span>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                  </svg>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Quick Reaction Picker overlay */}
                        <AnimatePresence>
                          {openReactionsFor === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`absolute -top-16 ${isMe ? "right-1" : "left-1"} flex items-center gap-1 bg-white dark:bg-gray-800 border border-black/[0.04] dark:border-white/10 rounded-full shadow-xl px-2.5 py-1.5 z-10`}
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

                        {/* Text bubble */}
                        <div
                          onDoubleClick={() => toggleReaction(msg.id, "❤️")}
                          className={`px-4.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text ${
                            isMe
                              ? "bg-gradient-to-br from-[#FF6B47] to-[#FFB199] text-white rounded-br-[4px] shadow-sm"
                              : "bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-bl-[4px] shadow-sm"
                          }`}
                        >
                          {highlightMatch(msg.text)}
                        </div>

                        {/* Reaction pills */}
                        {msgReactions && Object.keys(msgReactions).length > 0 && (
                          <div className={`flex gap-1 mt-1 ${isMe ? "self-end" : "self-start"}`}>
                            {Object.entries(msgReactions).map(([emoji, count]) => (
                              <span
                                key={emoji}
                                className="text-[10px] font-bold bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/10 rounded-full px-2 py-0.5 shadow-sm"
                              >
                                {emoji} {count > 1 ? count : ""}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 mt-1 px-1.5 ${isMe ? "self-end" : "self-start"}`}>
                          <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">{formatTime(msg.createdAt)}</span>
                          {isMe && <ReadReceipt msg={msg} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            {otherIsTyping && (
              <div className="flex items-end gap-2.5 mt-2 pl-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06D6A0] to-teal-400 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm">
                  {otherUser?.fullName?.charAt(0) || "?"}
                </div>
                <div className="bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/5 rounded-2xl rounded-bl-[4px] px-4.5 py-2.5 shadow-sm">
                  <TypingDots small />
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="shrink-0 px-5 py-2 bg-red-50 dark:bg-red-950/20 border-t border-red-100 dark:border-red-900/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-red-500 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-[10px] font-bold text-red-400 hover:text-red-600 shrink-0">Dismiss</button>
        </div>
      )}

      {/* Reply Context Banner */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden bg-[#06D6A0]/5 border-t border-[#06D6A0]/10"
          >
            <div className="px-5 py-2 flex items-center gap-2">
              <div className="w-0.5 self-stretch bg-[#06D6A0] rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-[9.5px] font-extrabold text-[#06D6A0] uppercase tracking-wide">Replying to</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium">{truncate(replyTo.text, 80)}</p>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                className="p-1 rounded-full text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Keyboard panel */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden bg-white dark:bg-gray-900 border-t border-black/[0.04] dark:border-white/5"
          >
            <div className="px-5 py-3 max-h-40 overflow-y-auto">
              {Object.entries(EMOJI_GROUPS).map(([label, emojis]) => (
                <div key={label} className="mb-2">
                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => insertEmoji(e)}
                        className="text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
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

      {/* Message Input Panel */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-black/[0.04] dark:border-white/5 px-5 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((s) => !s)}
            aria-label="Open emoji picker"
            className={`p-3 rounded-2xl transition-colors shrink-0 ${
              showEmojiPicker
                ? "bg-[#06D6A0]/10 text-[#06D6A0]"
                : "text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/5"
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
              className="w-full bg-gray-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-2xl pl-4 pr-14 py-3.5 text-[13.5px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B47]/50 resize-none max-h-32 disabled:opacity-60 transition-all"
            />
            {text.length > charLimit * 0.8 && (
              <span
                className={`absolute bottom-2.5 right-4 text-[9px] font-extrabold ${
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
              className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF6B47] to-[#FFB199] text-white shadow-[0_4px_14px_rgba(255,107,71,0.3)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </motion.button>
          </AnimatePresence>
        </form>
        <p className="text-[9.5px] font-semibold text-gray-400 dark:text-gray-500 mt-2 px-1.5">
          Enter to send · Shift+Enter for new line · Ctrl+F to search
        </p>
      </div>
    </div>
  )
}

function TypingDots({ small }) {
  const size = small ? "w-1 h-1" : "w-2 h-2"
  return (
    <div className="flex gap-1 items-center py-1">
      <div className={`${size} rounded-full bg-[#06D6A0] animate-bounce`} />
      <div className={`${size} rounded-full bg-[#06D6A0] animate-bounce`} style={{ animationDelay: "150ms" }} />
      <div className={`${size} rounded-full bg-[#06D6A0] animate-bounce`} style={{ animationDelay: "300ms" }} />
    </div>
  )
}

function ReadReceipt({ msg }) {
  const isRead = msg.read === true
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 12"
      fill="none"
      className={`w-3.5 h-2.5 ${isRead ? "text-sky-400" : "text-gray-300 dark:text-gray-600"}`}
    >
      <path d="M1 6.5L4.5 10L11 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {isRead && <path d="M8 6.5L11.5 10L18 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

function EmptyState({ otherUser, chat, navigate, onPickSuggestion }) {
  const name = otherUser?.fullName?.split(" ")[0] || "them"
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 py-10">
      <div className="w-16 h-16 rounded-3xl bg-[#06D6A0]/10 flex items-center justify-center text-3xl shadow-inner animate-bounce">
        💬
      </div>

      <div>
        <p className="font-extrabold text-gray-800 dark:text-white text-base">Start the conversation</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Say hello to {name}!</p>
      </div>

      {chat?.propertyTitle && (
        <div className="w-full max-w-xs bg-white dark:bg-gray-800 border border-black/[0.03] dark:border-white/5 rounded-2xl px-4.5 py-3.5 text-left shadow-sm">
          <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Discussing Room</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white truncate mt-0.5">{chat.propertyTitle}</p>
          {chat.propertyId && (
            <button
              onClick={() => navigate(`/rooms/${chat.propertyId}`)}
              className="mt-2 text-xs font-bold text-[#06D6A0] hover:underline"
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
            className="text-xs font-semibold text-left px-3.5 py-2.5 rounded-xl border border-black/[0.04] dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#06D6A0]/40 hover:text-[#06D6A0] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatPanel
