import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { 
  ShieldCheck, GraduationCap, Handshake, Zap, Target, 
  Sparkles, Laptop, AlertTriangle, Mail, MapPin, 
  Clock, Users, Building, Award, ArrowRight, CheckCircle,
  Heart, Star, Phone, MessageCircle,
  Send
} from "lucide-react"
import emailjs from "@emailjs/browser"
import Navbar from "../components/Navbar"

// EmailJS credentials — same project as the Contact page
const EMAILJS_SERVICE_ID = "service_e7s7gjm"
const EMAILJS_TEMPLATE_ID = "template_ihqklni"
const EMAILJS_PUBLIC_KEY = "fE6DyFIj8B8PPQOBH"
const PROJECT_EMAIL = "sthaankhoj4@gmail.com"

function AboutUs({ darkMode, toggleDarkMode }) {
  const reduceMotion = useReducedMotion()
  const [showPopup, setShowPopup] = useState(false)
  const [popupForm, setPopupForm] = useState({ name: "", email: "", message: "" })
  const [popupLoading, setPopupLoading] = useState(false)
  const [popupError, setPopupError] = useState("")
  const [popupSent, setPopupSent] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const scaleOnHover = {
    whileHover: { scale: 1.02, transition: { duration: 0.3 } }
  }

  const handlePopupChange = (e) => {
    setPopupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePopupSubmit = async (e) => {
    e.preventDefault()
    setPopupLoading(true)
    setPopupError("")

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: popupForm.name,
          email: popupForm.email,
          subject: "About Us — Quick Message",
          message: popupForm.message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      )
      setPopupSent(true)
    } catch (err) {
      console.error("EmailJS error:", err)
      setPopupError("Something went wrong sending your message. Please try again or email us directly.")
    } finally {
      setPopupLoading(false)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setPopupSent(false)
    setPopupError("")
    setPopupForm({ name: "", email: "", message: "" })
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_EMAIL)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const values = [
    {
      title: "Trust First",
      desc: "Vigorously verified listings ensuring complete transparency and peace of mind for every single applicant.",
      icon: <ShieldCheck className="w-8 h-8 text-[#06D6A0]" />,
      color: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Student Accessibility",
      desc: "Tailored discovery routes designed to match the budget constraints and housing requirements of students.",
      icon: <GraduationCap className="w-8 h-8 text-[#06D6A0]" />,
      color: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Vibrant Community",
      desc: "Fostering long-term respectful relationships by bridging landlords and university students smoothly.",
      icon: <Handshake className="w-8 h-8 text-[#06D6A0]" />,
      color: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Total Convenience",
      desc: "Streamlined search tools, location breakdowns, and instant direct coordination with zero intermediaries.",
      icon: <Zap className="w-8 h-8 text-[#06D6A0]" />,
      color: "bg-purple-50 dark:bg-purple-950/30"
    },
  ]

  const stats = [
    { value: "250+", label: "Students Connected", icon: Users },
    { value: "60+", label: "Verified Landlords", icon: Building },
    { value: "98%", label: "Response Rate", icon: Award },
    { value: "4.9", label: "Average Rating", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-[#FBF7F0] dark:bg-[#111827] text-gray-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 space-y-16 md:space-y-24 flex-1 w-full">

        {/* ---------------- HERO SECTION ---------------- */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[32px]"
        >
          <div
            className="absolute inset-0 -z-10 opacity-70 dark:opacity-40"
            style={{
              background: "radial-gradient(circle at 15% 20%, rgba(245,158,11,0.2), transparent 45%), radial-gradient(circle at 85% 30%, rgba(6,214,160,0.2), transparent 45%), radial-gradient(circle at 50% 90%, rgba(20,184,166,0.15), transparent 50%)",
            }}
          />
          
          {!reduceMotion && (
            <>
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="hidden md:flex absolute top-10 left-[8%] w-11 h-11 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-primary-500 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="hidden md:flex absolute top-24 right-[12%] w-11 h-11 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-teal-500 shadow-lg"
              >
                <Heart className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="hidden md:flex absolute bottom-8 left-[20%] w-9 h-9 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 dark:border-white/10 items-center justify-center text-amber-500 shadow-lg"
              >
                <Star className="w-4 h-4" />
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
                Who We Are
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Simplifying student living near KU
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-300 font-normal leading-relaxed max-w-2xl mx-auto">
              SthaanKhoj is a modern student-focused lodging platform built by students, for students. We solve the actual real-world accommodation hurdles around Dhulikhel.
            </p>
          </div>

          {/* Stats Row */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 md:gap-12 pb-10"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="flex flex-col items-center px-4"
              >
                <p className="text-2xl md:text-3xl font-extrabold text-dark-950 dark:text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ---------------- MISSION & VISION ---------------- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[#9feadd] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] -z-10 blur-3xl opacity-30" />

          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-500 text-left"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#06D6A0] to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[24px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white mb-4 tracking-tight">
              Our Mission
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We are dedicated to helping students find safe, comfortable, and affordable rooms near Kathmandu University. We aim to remove the stress from room search by offering vetted listings, exact locations, and intuitive discovery tools.
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-500 text-left"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#06D6A0] to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[24px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white mb-4 tracking-tight">
              Our Vision
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We envision a fully cohesive digital environment where landlords and university students transact seamlessly with complete trust. Through direct chat pipelines, verification schemes, and smart layouts, we aim to be the gold standard.
            </p>
          </motion.div>
        </motion.section>

        {/* ---------------- CORE VALUES ---------------- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-10"
        >
          <motion.div variants={fadeInUp} className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-teal-400 rounded-full"></div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
                  Core values we stand by
                </h2>
                <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
                  The foundation of the SthaanKhoj platform
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={!reduceMotion ? { y: -8, transition: { duration: 0.3 } } : {}}
                className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col text-left group"
              >
                <div className={`mb-4 ${v.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-dark-950 dark:text-white mb-2 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ---------------- TEAM & CONTACT ---------------- */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-7 bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg text-left flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-dark-950 dark:text-white tracking-tight">
                Our Tech Team
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                SthaanKhoj was designed and crafted by a passionate cohort of student developers who understand the real-world housing struggles KU students face. By blending modern UI architecture with simple direct listing pipelines, we built a utility that acts as a true community asset.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> KU Student Project
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full flex items-center gap-1">
                <Heart className="w-3 h-3" /> Community Focused
              </span>
            </div>
          </motion.div>

          {/* Contact Panel */}
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-5 bg-gradient-to-br from-[#06D6A0] to-[#04a878] p-8 md:p-10 rounded-[24px] text-white text-left flex flex-col justify-between relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-white/20 rounded-full blur-[40px]"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[120px] h-[120px] bg-white/10 rounded-full blur-[50px]"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Get In Touch
              </h2>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-normal">
                Have listings to submit, partnership opportunities, or feedback? Drop us a line—we respond within 12 hours!
              </p>
            </div>

            <div className="space-y-4 mt-6 relative z-10">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  Direct Inquiries
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${PROJECT_EMAIL}`}
                    className="text-base sm:text-lg font-bold text-white hover:underline break-all"
                  >
                    {PROJECT_EMAIL}
                  </a>
                  <button
                    onClick={copyEmail}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Copy email"
                  >
                    {copiedEmail ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Mail className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowPopup(true)}
                  className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-full font-bold text-[#06D6A0] text-xs tracking-wider uppercase bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Email Message
                </button>
                <a
                  href="https://wa.me/9779765039885?text=Hi%20SthaanKhoj%2C%20I%20have%20a%20question"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-full font-bold text-white text-xs tracking-wider uppercase bg-white/15 hover:bg-white/25 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </motion.section>

      </main>

      {/* Email Popup Modal */}
      {showPopup && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative text-left"
          >
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {popupSent ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-6 text-center space-y-3"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0]">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-dark-950 dark:text-white">Message sent! 🎉</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">We'll get back to you within 12 hours.</p>
                <button
                  onClick={closePopup}
                  className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-dark-950 dark:text-white mb-2">Send an Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill out the form below and we'll get back to you shortly.</p>

                <form className="space-y-4" onSubmit={handlePopupSubmit}>
                  {popupError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {popupError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={popupForm.name}
                      onChange={handlePopupChange}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-primary-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Your Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={popupForm.email}
                      onChange={handlePopupChange}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-primary-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea
                      required
                      rows="4"
                      name="message"
                      value={popupForm.message}
                      onChange={handlePopupChange}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-primary-500 transition-colors resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={popupLoading}
                    className="w-full py-3.5 rounded-full font-bold text-white text-sm bg-gradient-to-r from-[#06D6A0] to-[#04a878] hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {popupLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Universal Footer */}
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

export default AboutUs