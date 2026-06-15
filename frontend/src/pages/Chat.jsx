import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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

function Chat({ darkMode, toggleDarkMode }) {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [chat, setChat] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)

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
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })

    markAsRead(chatId, role).catch(console.error)

    return () => {
      unsubscribeChat()
      unsubscribeMessages()
      setTyping(chatId, role, false).catch(() => {})
    }
  }, [chatId, user, role, navigate])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending || !user) return
    const msg = text.trim()
    setText("")
    setSending(true)
    setError("")
    try {
      await sendMessage(chatId, user.uid, msg)
      await setTyping(chatId, role, false)
    } catch (err) {
      console.error(err)
      setError("Message could not be sent. Please try again.")
      setText(msg)
    } finally {
      setSending(false)
    }
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    if (!chatId || !role) return
    setTyping(chatId, role, true).catch(() => {})
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatId, role, false).catch(() => {})
    }, 1200)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
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

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.createdAt ? formatDate(msg.createdAt) : "Just now"
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  const otherIsTyping = role === "student" ? chat?.typingLandlord : chat?.typingStudent

  return (
    <div className={`${darkMode ? "dark" : ""} flex flex-col h-screen overflow-hidden`}>
      {/* Navbar — fixed, won't scroll */}
      <div className="shrink-0">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>

      {/* Chat container — fills remaining height */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#fafbfc] dark:bg-[#0b1528]">

        {/* Chat Header */}
        <div className="shrink-0 bg-white dark:bg-dark-900/80 border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/messages")}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {otherUser?.fullName?.charAt(0) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
              {otherUser?.fullName || "Loading..."}
            </p>
            {otherIsTyping ? (
              <p className="text-xs text-primary-500 dark:text-primary-400">typing...</p>
            ) : chat?.propertyTitle ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                Re: {chat.propertyTitle}
              </p>
            ) : null}
          </div>

          {chat?.propertyId && (
            <button
              onClick={() => navigate(`/rooms/${chat.propertyId}`)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all"
            >
              View Room
            </button>
          )}
        </div>

        {/* Messages — only this scrolls */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center text-3xl">
                💬
              </div>
              <p className="font-bold text-gray-700 dark:text-white">Start the conversation</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Say hello to {otherUser?.fullName?.split(" ")[0] || "them"}!
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                </div>

                {msgs.map((msg, i) => {
                  const isMe = msg.senderId === user.uid
                  const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.senderId !== msg.senderId)

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                          {otherUser?.fullName?.charAt(0) || "?"}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isMe
                            ? "bg-gradient-to-br from-primary-600 to-teal-500 text-white rounded-br-md"
                            : "bg-white dark:bg-dark-900/80 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-white rounded-bl-md shadow-sm"
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="shrink-0 px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/40">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Message Input — fixed at bottom */}
        <div className="shrink-0 bg-white dark:bg-dark-900/80 border-t border-gray-100 dark:border-white/5 px-4 py-3">
          <form onSubmit={handleSend} className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              disabled={sending}
              className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 resize-none max-h-32 disabled:opacity-60"
              style={{ overflowY: text.split("\n").length > 3 ? "auto" : "hidden" }}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="p-3 rounded-2xl bg-gradient-to-br from-primary-600 to-teal-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 px-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chat