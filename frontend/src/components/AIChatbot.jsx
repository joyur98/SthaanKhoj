import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { chatbotSearch } from "../services/api"
import { parseMessage, generateResponse } from "../services/chatbotEngine"

const ROOM_TYPE_LABELS = {
  room: "Room", flat: "Flat", studio: "Studio", house: "House", pg: "PG",
}

function AIChatbot({ darkMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Namaste! 🙏 I'm **SthaanBot**, your AI room-finding assistant. Tell me what you're looking for — location, budget, amenities — and I'll search for you!",
      suggestions: [
        "Rooms in Dhulikhel",
        "Under 10K with WiFi",
        "Furnished rooms",
        "Help",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }])
  }

  const handleSend = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput("")

    addMessage({ role: "user", text: msg })

    const { intent, filters } = parseMessage(msg)

    if (intent === "search") {
      setIsTyping(true)
      try {
        const apiFilters = {}
        if (filters?.location) apiFilters.location = filters.location
        if (filters?.minPrice) apiFilters.minPrice = filters.minPrice
        if (filters?.maxPrice) apiFilters.maxPrice = filters.maxPrice
        if (filters?.amenities) apiFilters.amenities = filters.amenities
        if (filters?.roomType) apiFilters.roomType = filters.roomType
        if (filters?.available) apiFilters.available = filters.available

        const res = await chatbotSearch(apiFilters)
        const results = res.data || []

        await new Promise((r) => setTimeout(r, 600))
        setIsTyping(false)

        const response = generateResponse(intent, filters, results)
        addMessage({ role: "bot", ...response })
      } catch (err) {
        setIsTyping(false)
        addMessage({
          role: "bot",
          text: `Oops, something went wrong 😓: ${err.message}. Please try again!`,
          suggestions: ["Try again", "Help"],
        })
      }
    } else {
      setIsTyping(true)
      await new Promise((r) => setTimeout(r, 400))
      setIsTyping(false)

      const response = generateResponse(intent, filters, null)
      addMessage({ role: "bot", ...response })
      if (!isOpen) setHasUnread(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderText = (text) => {
    if (!text) return null
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic opacity-80">{part.slice(1, -1)}</em>
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  const RoomCard = ({ room }) => (
    <div
      className="flex gap-3 p-3 bg-white/60 dark:bg-white/5 border border-gray-100/80 dark:border-white/10 rounded-2xl hover:shadow-md dark:hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => {
        navigate(`/rooms/${room.id}`)
        setIsOpen(false)
      }}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
        {room.images?.[0] ? (
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300 dark:text-white/10">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
          {room.title}
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {room.location}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
            NPR {room.price?.toLocaleString()}
          </span>
          <span className="text-[9px] font-semibold bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
            {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
          </span>
        </div>
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {room.amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-[8px] font-semibold bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                {a}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold py-0.5">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  // Hide chatbot on chat pages to avoid overlapping the send button
  if (location.pathname.startsWith("/chat/")) {
    return null;
  }

  return (
    <>
      {/* ── Floating Button ────────────────────────────────────────── */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed bottom-6 left-6 z-[9998] p-4 rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)] transition-all duration-500 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-gray-200 dark:bg-dark-900 rotate-0"
            : "bg-gradient-to-br from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600"
        }`}
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-600 dark:text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-dark-950 animate-pulse" />
            )}
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600 to-teal-500 animate-ping opacity-20 pointer-events-none" />
          </>
        )}
      </button>

      {/* ── Chat Window ────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 left-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-[550px] max-h-[calc(100vh-8rem)] rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-gray-100/60 dark:border-white/[0.06] bg-white/95 dark:bg-[#0c1a30]/95 backdrop-blur-xl">

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="relative shrink-0 px-5 py-4 bg-gradient-to-r from-primary-600 to-teal-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-lg shadow-sm">
                ✨
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm tracking-wide">SthaanBot</h3>
                <p className="text-white/70 text-[10px] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  AI Room Finder • Always online
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chatbot-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-chatbot-fade-in`}
              >
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-[10px] shadow-sm">✨</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">SthaanBot</span>
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary-600 to-teal-500 text-white rounded-2xl rounded-tr-md shadow-[0_4px_14px_rgba(16,185,129,0.2)]"
                        : "bg-gray-50/80 dark:bg-white/[0.04] border border-gray-100/80 dark:border-white/[0.06] text-gray-700 dark:text-gray-200 rounded-2xl rounded-tl-md"
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>

                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-2 space-y-2 max-h-[280px] overflow-y-auto pr-1 chatbot-scrollbar">
                      {msg.results.slice(0, 5).map((room) => (
                        <RoomCard key={room.id} room={room} />
                      ))}
                      {msg.results.length > 5 && (
                        <button
                          onClick={() => {
                            navigate("/find-rooms")
                            setIsOpen(false)
                          }}
                          className="w-full py-2 text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all"
                        >
                          View all {msg.results.length} results →
                        </button>
                      )}
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1.5 text-[11px] font-semibold bg-white dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-full hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all duration-200 active:scale-95"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-chatbot-fade-in">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-teal-400 flex items-center justify-center text-[10px] shadow-sm">✨</span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">SthaanBot</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50/80 dark:bg-white/[0.04] border border-gray-100/80 dark:border-white/[0.06] rounded-2xl rounded-tl-md">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-chatbot-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-chatbot-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-chatbot-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ─────────────────────────────────────────────── */}
          <div className="shrink-0 px-4 py-3 border-t border-gray-100/80 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Try "rooms in Dhulikhel under 10K"'
                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.22)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-400 dark:text-gray-600 mt-1.5 font-medium">
              Powered by SthaanKhoj AI • Search rooms naturally
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AIChatbot