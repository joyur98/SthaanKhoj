import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  Mail, MapPin, Clock, Send, CheckCircle2, AlertTriangle, MessageCircle,
  Copy, Navigation, Search, ChevronDown, ThumbsUp, ThumbsDown, Flag,
  Sparkles, Check, X, Calendar,
} from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import emailjs from "@emailjs/browser"
import Navbar from "../components/Navbar"

// Project contact details
const PROJECT_EMAIL = "sthaankhoj4@gmail.com"
const WHATSAPP_NUMBER = "9779765039885"
const WHATSAPP_DISPLAY = "+977 976-5039885"
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20SthaanKhoj%2C%20I%20have%20a%20question`
const EMAILJS_TEMPLATE_ID = "template_ihqklni"
const EMAILJS_PUBLIC_KEY = "fE6DyFIj8B8PPQOBH"
const EMAILJS_SERVICE_ID = "service_e7s7gjm"

const DRAFT_KEY = "sthaankhoj_contact_draft"
const MESSAGE_LIMIT = 500

// ---------- small reusable bits ----------

function useCountUp(target, start, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return value
}

function TrustStat({ value, suffix, label, delay = 0 }) {
  const [inView, setInView] = useState(false)
  const count = useCountUp(value, inView)
  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, amount: 0.6 }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center px-4"
    >
      <p className="text-2xl md:text-3xl font-extrabold text-dark-950 dark:text-white tabular-nums">
        {count}{suffix}
      </p>
      <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mt-1">
        {label}
      </p>
    </motion.div>
  )
}

function TiltCard({ children, className = "" }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const [style, setStyle] = useState({})

  const onMove = (e) => {
    if (reduceMotion || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const rotateY = (px - 0.5) * 10
    const rotateX = (0.5 - py) * 10
    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
      "--glow-x": `${px * 100}%`,
      "--glow-y": `${py * 100}%`,
    })
  }
  const onLeave = () => setStyle({ transform: "perspective(800px) rotateX(0) rotateY(0) translateY(0)" })

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 300ms ease", ...style }}
      className={className}
    >
      {children}
    </div>
  )
}

// ---------- main component ----------

function ContactUs({ darkMode, toggleDarkMode }) {
  const reduceMotion = useReducedMotion()

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [priority, setPriority] = useState(false)
  const [sendCopy, setSendCopy] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [draftRestored, setDraftRestored] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name || parsed.email || parsed.subject || parsed.message) {
          setFormData(parsed)
          setDraftRestored(true)
        }
      }
    } catch { /* ignore corrupt draft */ }
  }, [])

  // autosave draft
  useEffect(() => {
    const t = setTimeout(() => {
      const hasContent = formData.name || formData.email || formData.subject || formData.message
      if (hasContent && !submitted) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
      }
    }, 400)
    return () => clearTimeout(t)
  }, [formData, submitted])

  const errors = useMemo(() => {
    const e = {}
    if (touched.name && formData.name.trim().length < 2) e.name = "Please tell us your name."
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "That email doesn't look right."
    if (touched.subject && !formData.subject) e.subject = "Pick a subject so we route this correctly."
    if (touched.message && formData.message.trim().length < 10) e.message = "A few more words would help us help you."
    return e
  }, [formData, touched])

  const isValid =
    formData.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    !!formData.subject &&
    formData.message.trim().length >= 10

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "message" && value.length > MESSAGE_LIMIT) return
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })
    if (!isValid) return
    setLoading(true)
    setError("")

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          priority: priority ? "Urgent" : "Normal",
          send_copy: sendCopy ? "Yes" : "No",
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      )
      setSubmitted(true)
      localStorage.removeItem(DRAFT_KEY)
    } catch (err) {
      console.error("EmailJS error:", err)
      setError("Something went wrong sending your message. Please try again or email us directly.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
    setTouched({})
    setPriority(false)
    setSendCopy(false)
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_EMAIL)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  // live support status — Sun(0)–Fri(5), 9AM–6PM NPT (assumes visitor's clock ~ NPT; safe fallback)
  const isOnline = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    return day !== 6 && hour >= 9 && hour < 18
  }, [])

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />, label: "Email Us", value: "sthaankhoj@gmail.com",
      sub: "Avg. reply time: 2.3 hrs", href: "mailto:sthaankhoj@gmail.com", color: "primary",
      action: { label: copiedEmail ? "Copied!" : "Copy address", icon: copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />, onClick: copyEmail },
    },
    {
      icon: <MapPin className="w-6 h-6" />, label: "Our Location", value: "Dhulikhel, Kavrepalanchok",
      sub: "Near Kathmandu University", href: "https://maps.google.com/?q=Dhulikhel", color: "teal",
      action: { label: "Get directions", icon: <Navigation className="w-3.5 h-3.5" />, href: "https://maps.google.com/?q=Dhulikhel" },
    },
    {
      icon: <Clock className="w-6 h-6" />, label: "Support Hours", value: "Sun – Fri, 9AM – 6PM",
      sub: "Nepal Standard Time (NPT)", href: null, color: "indigo",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />, label: "WhatsApp", value: "Chat instantly",
      sub: "Avg. reply time: 1.5 hrs", href: "https://wa.me/9770000000000?text=Hi%20SthaanKhoj%2C%20I%20have%20a%20question", color: "primary",
      action: { label: "Open chat", icon: <MessageCircle className="w-3.5 h-3.5" />, href: "https://wa.me/9770000000000" },
    },
  ]

  const colorMap = {
    primary: { bg: "bg-primary-50 dark:bg-primary-950/40", text: "text-primary-600 dark:text-primary-400", ring: "ring-primary-300/40" },
    teal: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-300/40" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-300/40" },
  }

  // ---------- FAQ ----------
  const faqs = [
    { q: "How do I list my room on SthaanKhoj?", a: "Click 'Post a Room' in the navbar, create a landlord account, fill out the listing form, and submit for verification. Listings go live within 24 hours.", cat: "Listings" },
    { q: "Is SthaanKhoj free for students?", a: "Absolutely. Browsing, searching, and contacting landlords is completely free for all KU students. No hidden fees.", cat: "General" },
    { q: "How are listings verified?", a: "Our team manually reviews every listing for accuracy, safety, and legitimacy before it appears on the platform.", cat: "Safety" },
    { q: "Can I report a suspicious listing?", a: `Yes — use the flag icon on any listing, message us on WhatsApp at ${WHATSAPP_DISPLAY}, or email ${PROJECT_EMAIL}. We investigate all reports within 24 hours.`, cat: "Safety" },
    { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot password'. We'll send a reset link to your registered email.", cat: "Account" },
    { q: "Can I edit or remove my listing later?", a: "Yes, landlords can edit or unpublish a listing anytime from the 'My Listings' dashboard.", cat: "Listings" },
    { q: "Is my personal data shared with landlords?", a: "Only your name and contact details are shared, and only after you choose to reach out. We never sell your data.", cat: "Safety" },
    { q: "How do I delete my account?", a: `Email us at ${PROJECT_EMAIL} from your registered address and we'll process account deletion within 48 hours.`, cat: "Account" },
  ]
  const categories = ["All", "General", "Listings", "Account", "Safety"]
  const [faqQuery, setFaqQuery] = useState("")
  const [faqCat, setFaqCat] = useState("All")
  const [openFaq, setOpenFaq] = useState(null)
  const [faqFeedback, setFaqFeedback] = useState({})

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = faqCat === "All" || f.cat === faqCat
    const matchesQuery = (f.q + f.a).toLowerCase().includes(faqQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  const rateFaq = useCallback((idx, val) => {
    setFaqFeedback((prev) => ({ ...prev, [idx]: val }))
  }, [])

  return (
    <div className="min-h-screen bg-[#FBF7F0] dark:bg-[#111827] text-gray-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 space-y-16 md:space-y-24 flex-1 w-full">

        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden rounded-[32px]">
          <div
            className="absolute inset-0 -z-10 opacity-70 dark:opacity-40"
            style={{
              background: "radial-gradient(circle at 15% 20%, rgba(245,158,11,0.25), transparent 45%), radial-gradient(circle at 85% 30%, rgba(6,214,160,0.25), transparent 45%), radial-gradient(circle at 50% 90%, rgba(20,184,166,0.2), transparent 50%)",
            }}
          />
          {!reduceMotion && (
            <>
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute top-10 left-[8%] w-11 h-11 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-primary-500 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="hidden md:flex absolute top-24 right-[12%] w-11 h-11 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-teal-500 shadow-lg"
              >
                <MapPin className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="hidden md:flex absolute bottom-8 left-[20%] w-9 h-9 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-amber-500 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </>
          )}

          <div className="text-center max-w-3xl mx-auto space-y-4 py-14 px-4">
            <motion.div
              animate={reduceMotion ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100 dark:border-primary-900/30"
            >
              <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
                Contact Us
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-dark-955 dark:text-white">
              We'd love to hear from you
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-300 font-normal leading-relaxed">
              Whether you have a question about listings, need help with your account, or want to partner with us — our team is ready to help.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 pb-10">
            <TrustStat value={250} suffix="+" label="Students Connected" delay={0} />
            <TrustStat value={60} suffix="+" label="Verified Landlords" delay={0.1} />
            <TrustStat value={98} suffix="%" label="Response Rate" delay={0.2} />
          </div>
        </section>

        {/* ---------------- CONTACT METHOD CARDS ---------------- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, idx) => {
            const colors = colorMap[method.color]
            return (
              <TiltCard key={idx} className="group relative">
                <div
                  className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(180px circle at var(--glow-x,50%) var(--glow-y,50%), rgba(6,214,160,0.18), transparent 65%)",
                  }}
                />
                <div className="relative h-full bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                    {method.icon}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{method.label}</p>
                  <p className={`text-base font-bold ${colors.text} mb-1`}>{method.value}</p>
                  <p className="text-xs text-gray-400 mb-4">{method.sub}</p>

                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                    {method.href && !method.action?.onClick ? (
                      <a href={method.href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Open ↗
                      </a>
                    ) : <span />}
                    {method.action && (
                      method.action.onClick ? (
                        <button
                          onClick={method.action.onClick}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} hover:brightness-95 transition`}
                        >
                          {method.action.icon} {method.action.label}
                        </button>
                      ) : (
                        <a
                          href={method.action.href}
                          target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} hover:brightness-95 transition`}
                        >
                          {method.action.icon} {method.action.label}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </section>

        {/* ---------------- FORM + INFO PANEL ---------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[120%] bg-[#9feadd] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] -z-10 blur-3xl opacity-30" />

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg text-left flex flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-dark-950 dark:text-white tracking-tight">Send us a message</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill out the form and we'll get back to you within 12 hours.</p>
              </div>
            </div>

            {draftRestored && !submitted && (
              <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/30 rounded-xl px-4 py-2.5">
                <span>We restored your unsent draft.</span>
                <button
                  type="button"
                  onClick={() => { setFormData({ name: "", email: "", subject: "", message: "" }); setDraftRestored(false); localStorage.removeItem(DRAFT_KEY) }}
                  className="underline underline-offset-2 hover:text-primary-900 dark:hover:text-primary-200"
                >
                  Discard
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12 relative overflow-hidden"
                >
                  {!reduceMotion && <Confetti />}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="w-16 h-16 rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0]"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-dark-950 dark:text-white">
                    Thank you, {formData.name.split(" ")[0] || "friend"}! 🎉
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Your message is on its way. We'll reply to <span className="font-semibold">{formData.email}</span>{priority ? ", and flagged this as urgent" : ""} shortly.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link to="/rooms" className="text-xs font-bold px-4 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition">Browse Rooms</Link>
                    <button onClick={resetForm} className="text-xs font-bold px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                      Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5 flex-1 flex flex-col"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FloatingField
                      label="Your Name" name="name" value={formData.name}
                      onChange={handleChange} onBlur={handleBlur} error={errors.name}
                      valid={touched.name && !errors.name && formData.name.trim().length >= 2}
                    />
                    <FloatingField
                      label="Your Email" name="email" type="email" value={formData.email}
                      onChange={handleChange} onBlur={handleBlur} error={errors.email}
                      valid={touched.email && !errors.email && !!formData.email}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                    <select
                      name="subject" value={formData.subject}
                      onChange={handleChange} onBlur={handleBlur}
                      className={`w-full bg-gray-50 dark:bg-dark-950 border rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none transition-colors ${errors.subject ? "border-red-400" : "border-gray-200 dark:border-white/10 focus:border-primary-500"}`}
                    >
                      <option value="" disabled>Select a subject…</option>
                      <option value="listing">Listing Inquiry</option>
                      <option value="account">Account Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="report">Report a Listing</option>
                      <option value="feedback">General Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.subject}</p>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Message</label>
                      <span className={`text-[10px] font-bold tabular-nums ${formData.message.length > MESSAGE_LIMIT * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
                        {formData.message.length}/{MESSAGE_LIMIT}
                      </span>
                    </div>
                    <textarea
                      rows="5" name="message" value={formData.message}
                      onChange={handleChange} onBlur={handleBlur}
                      className={`w-full bg-gray-50 dark:bg-dark-950 border rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none transition-colors resize-none ${errors.message ? "border-red-400" : "border-gray-200 dark:border-white/10 focus:border-primary-500"}`}
                      placeholder="Tell us how we can help…"
                    ></textarea>
                    <div className="h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-teal-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, (formData.message.length / MESSAGE_LIMIT) * 100)}%` }}
                      />
                    </div>
                    {errors.message && <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setPriority((p) => !p)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${priority ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400" : "border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600"}`}
                    >
                      <Flag className="w-3.5 h-3.5" /> {priority ? "Marked urgent" : "Mark as urgent"}
                    </button>

                    <label className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      Send me a copy
                      <span
                        onClick={() => setSendCopy((s) => !s)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${sendCopy ? "bg-primary-500" : "bg-gray-200 dark:bg-white/10"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sendCopy ? "translate-x-4" : ""}`} />
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full font-bold text-white text-xs tracking-wider uppercase bg-[#06D6A0] hover:bg-[#05c490] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(6,214,160,0.25)]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Sending…
                      </>
                    ) : "Send Message"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-5 bg-[#06D6A0] p-8 md:p-10 rounded-[24px] text-white text-left flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-white/20 rounded-full blur-[40px]"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[120px] h-[120px] bg-white/10 rounded-full blur-[50px]"></div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Quick ways to reach us</h2>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Prefer a more direct line? Use any of the options below to connect with the SthaanKhoj team.
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-white/15">
                  <span className={`relative flex w-2 h-2`}>
                    <span className={`absolute inline-flex h-full w-full rounded-full ${isOnline ? "bg-emerald-300 animate-ping" : "bg-white/40"} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full w-2 h-2 ${isOnline ? "bg-emerald-300" : "bg-white/40"}`}></span>
                  </span>
                  {isOnline ? "We're online now" : "Back at 9AM NPT"}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { icon: <Mail className="w-4 h-4" />, label: "Email", val: PROJECT_EMAIL, href: `mailto:${PROJECT_EMAIL}` },
                  { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp", val: WHATSAPP_DISPLAY, href: WHATSAPP_LINK },
                  { icon: <MapPin className="w-4 h-4" />, label: "Location", val: "Dhulikhel, near KU" },
                  { icon: <Clock className="w-4 h-4" />, label: "Hours", val: "Sun–Fri, 9AM–6PM NPT" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:underline break-all">
                          {item.val}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-white">{item.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full bg-white text-[#06D6A0] hover:bg-white/90 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                </a>
                <a
                  href={`mailto:${PROJECT_EMAIL}?subject=SthaanKhoj%20Inquiry`}
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition"
                >
                  <Calendar className="w-3.5 h-3.5" /> Send an email
                </a>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {[{ label: "Facebook", icon: "f" }, { label: "Instagram", icon: "ig" }, { label: "Twitter", icon: "tw" }].map((s, i) => (
                    <a key={i} href="#" aria-label={s.label} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 border border-white/10 flex items-center justify-center text-xs font-bold text-white transition-all duration-200">
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 relative z-10">
              <span className="text-xs font-bold text-white bg-white/15 px-3 py-1 rounded-full">KU Student Project</span>
              <span className="text-xs font-bold text-white bg-white/15 px-3 py-1 rounded-full">Always Responsive</span>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
              Quick answers to common queries
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                placeholder="Search FAQs…"
                className="w-full bg-white dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFaqCat(c)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-colors ${faqCat === c ? "bg-primary-600 border-primary-600 text-white" : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-primary-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-gray-400 md:col-span-2 text-center py-8">No results — try a different search or category.</p>
            )}
            {filteredFaqs.map((faq, idx) => {
              const open = openFaq === idx
              return (
                <div key={idx} className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.005)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] overflow-hidden text-left">
                  <button
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-start gap-3 p-6 text-left"
                    aria-expanded={open}
                  >
                    <div className="w-7 h-7 min-w-[28px] rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-black">Q</div>
                    <h3 className="flex-1 text-sm font-bold text-dark-950 dark:text-white leading-snug">{faq.q}</h3>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-10">{faq.a}</p>
                        <div className="pl-10 mt-4 flex items-center gap-3">
                          {faqFeedback[idx] ? (
                            <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">Thanks for the feedback! 🙏</span>
                          ) : (
                            <>
                              <span className="text-[11px] font-semibold text-gray-400">Was this helpful?</span>
                              <button onClick={() => rateFaq(idx, "up")} className="text-gray-400 hover:text-primary-600 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                              <button onClick={() => rateFaq(idx, "down")} className="text-gray-400 hover:text-red-500 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900 py-8 text-center text-xs font-semibold text-gray-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SthaanKhoj. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/home" className="hover:text-dark-900 dark:hover:text-white transition">Home</Link>
            <Link to="/about" className="hover:text-dark-900 dark:hover:text-white transition">About</Link>
            <Link to="/contact" className="hover:text-dark-900 dark:hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------- FloatingField ----------
function FloatingField({ label, name, value, onChange, onBlur, error, valid, type = "text" }) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); onBlur(e) }}
        className={`peer w-full bg-gray-50 dark:bg-dark-950 border rounded-xl px-4 pt-5 pb-2 text-sm text-black dark:text-white outline-none transition-colors ${error ? "border-red-400" : "border-gray-200 dark:border-white/10 focus:border-primary-500"}`}
        placeholder=" "
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none text-gray-400 ${floated ? "top-1.5 text-[9px] font-bold uppercase tracking-widest" : "top-1/2 -translate-y-1/2 text-sm"}`}
      >
        {label}
      </label>
      {valid && <Check className="w-4 h-4 text-primary-500 absolute right-3.5 top-1/2 -translate-y-1/2" />}
      {error && <p className="text-[11px] font-semibold text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ---------- Confetti ----------
function Confetti() {
  const pieces = useMemo(() => {
    const colors = ["#06D6A0", "#F5A623", "#4F46E5", "#14B8A6", "#EF4444"]
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 0.8,
      rotate: Math.random() * 360,
    }))
  }, [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `${p.left}%`, opacity: 1, rotate: 0 }}
          animate={{ y: "120%", opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{ position: "absolute", top: 0, width: 6, height: 10, backgroundColor: p.color, borderRadius: 1 }}
        />
      ))}
    </div>
  )
}

export default ContactUs
