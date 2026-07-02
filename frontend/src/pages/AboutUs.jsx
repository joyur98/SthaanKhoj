import { useState } from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, GraduationCap, Handshake, Zap, Target, Sparkles, Laptop, AlertTriangle } from "lucide-react"
import emailjs from "@emailjs/browser"
import Navbar from "../components/Navbar"

// EmailJS credentials — same project as the Contact page
const EMAILJS_SERVICE_ID = "service_e7s7gjm"
const EMAILJS_TEMPLATE_ID = "template_ihqklni"
const EMAILJS_PUBLIC_KEY = "fE6DyFIj8B8PPQOBH"

function AboutUs({ darkMode, toggleDarkMode }) {
  const [showPopup, setShowPopup] = useState(false)
  const [popupForm, setPopupForm] = useState({ name: "", email: "", message: "" })
  const [popupLoading, setPopupLoading] = useState(false)
  const [popupError, setPopupError] = useState("")
  const [popupSent, setPopupSent] = useState(false)

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

  const values = [
    {
      title: "Trust First",
      desc: "Vigorously verified listings ensuring complete transparency and peace of mind for every single applicant.",
      icon: <ShieldCheck className="w-8 h-8 text-[#06D6A0]" />,
    },
    {
      title: "Student Accessibility",
      desc: "Tailored discovery routes designed to match the budget constraints and housing requirements of students.",
      icon: <GraduationCap className="w-8 h-8 text-[#06D6A0]" />,
    },
    {
      title: "Vibrant Community",
      desc: "Fostering long-term respectful relationships by bridging landlords and university students smoothly.",
      icon: <Handshake className="w-8 h-8 text-[#06D6A0]" />,
    },
    {
      title: "Total Convenience",
      desc: "Streamlined search tools, location breakdowns, and instant direct coordination with zero intermediaries.",
      icon: <Zap className="w-8 h-8 text-[#06D6A0]" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF7F0] dark:bg-[#111827] text-gray-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      {/* Universal Consistent Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 space-y-16 md:space-y-24 flex-1 w-full">
        {/* Dynamic Page Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-fadeSlideDown">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100 dark:border-primary-900/30">
            <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Who We Are
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-dark-955 dark:text-white">
            Simplifying student living near KU
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-300 font-normal leading-relaxed">
            SthaanKhoj is a modern student-focused lodging platform built by students, for students. We solve the actual real-world accommodation hurdles around Dhulikhel.
          </p>
        </div>

        {/* Mission and Vision Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Background Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[#9feadd] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] -z-10 blur-3xl opacity-30" />

          {/* Mission Card */}
          <div className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg hover:shadow-xl  transition-all duration-500 text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#06D6A0] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[24px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white mb-4 tracking-tight">
              Our Mission
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We are dedicated to helping students find safe, comfortable, and affordable rooms near Kathmandu University. We aim to remove the stress from room search by offering vetted listings, exact locations, and intuitive discovery tools.
            </p>
          </div>

          {/* Vision Card */}
          <div className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg hover:shadow-xl  transition-all duration-500 text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#06D6A0] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[24px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white mb-4 tracking-tight">
              Our Vision
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We envision a fully cohesive digital environment where landlords and university students transact seamlessly with complete trust. Through direct chat pipelines, verification schemes, and smart layouts, we aim to be the gold standard.
            </p>
          </div>
        </section>

        {/* Custom Redesigned Values Grid */}
        <section className="space-y-12">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Core values we stand by
            </h2>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
              The foundation of the SthaanKhoj platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col text-left"
              >
                <div className="mb-4 bg-[#06D6A0]/10 w-14 h-14 rounded-xl flex items-center justify-center">{v.icon}</div>
                <h3 className="text-lg font-bold text-dark-950 dark:text-white mb-2 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Side-by-side Split Team & Contact Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Team Info Card (left) */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[24px] shadow-lg  text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#06D6A0]/10 text-[#06D6A0] flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-dark-950 dark:text-white tracking-tight">
                Our Tech Team
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                SthaanKhoj was designed and crafted by a passionate cohort of student developers who understand the real-world housing struggles KU students face. By blending modern UI architecture with simple direct listing pipelines, we built a utility that acts as a true community asset.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
                KU Student Project
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                Community Focused
              </span>
            </div>
          </div>

          {/* Contact Form Details (right) */}
          <div className="lg:col-span-5 bg-[#06D6A0] p-8 md:p-10 rounded-[24px] text-white text-left flex flex-col justify-between relative overflow-hidden shadow-lg ">
            {/* Soft decorative blur spot */}
            <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-white/20 rounded-full blur-[40px] -z-0"></div>
            
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl font-bold tracking-tight">
                Get In Touch
              </h2>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal">
                Have listings to submit, partnership opportunities, or feedback? Drop us a line—we respond within 12 hours!
              </p>
            </div>

            <div className="space-y-4 mt-8 relative z-10">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-white-400 uppercase tracking-widest">
                  Direct Inquiries
                </span>
                <a
                  href="mailto:info@sthaankhoj.com"
                  className="text-base sm:text-lg font-bold text-primary-400 hover:text-primary-300 transition break-all"
                >
                  sthaankhoj@gmail.com
                </a>
              </div>

              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex justify-center items-center w-full py-3.5 rounded-full font-bold text-[#06D6A0] text-xs tracking-wider uppercase bg-white hover:bg-gray-50 transition-all cursor-pointer text-center shadow-md"
              >
                Send Email Message
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Email Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative text-left">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {popupSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5m6 1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-dark-950 dark:text-white">Message sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">We'll get back to you within 12 hours.</p>
                <button
                  onClick={closePopup}
                  className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Close
                </button>
              </div>
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
                    className="w-full py-3.5 rounded-full font-bold text-white text-sm bg-[#06D6A0] hover:bg-[#05c490] shadow-md transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      "Send Message"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
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
