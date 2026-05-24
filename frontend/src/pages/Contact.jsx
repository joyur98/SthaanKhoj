import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"

function ContactUs({ darkMode, toggleDarkMode }) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const contactMethods = [
    {
      icon: "📧",
      label: "Email Us",
      value: "info@sthaankhoj.com",
      sub: "We reply within 12 hours",
      href: "mailto:info@sthaankhoj.com",
      color: "primary",
    },
    {
      icon: "📍",
      label: "Our Location",
      value: "Dhulikhel, Kavrepalanchok",
      sub: "Near Kathmandu University",
      href: "https://maps.google.com/?q=Dhulikhel",
      color: "teal",
    },
    {
      icon: "🕐",
      label: "Support Hours",
      value: "Sun – Fri, 9AM – 6PM",
      sub: "Nepal Standard Time (NPT)",
      href: null,
      color: "indigo",
    },
  ]

  const faqs = [
    {
      q: "How do I list my room on SthaanKhoj?",
      a: "Click 'Post a Room' in the navbar, create a landlord account, fill out the listing form, and submit for verification. Listings go live within 24 hours.",
    },
    {
      q: "Is SthaanKhoj free for students?",
      a: "Absolutely. Browsing, searching, and contacting landlords is completely free for all KU students. No hidden fees.",
    },
    {
      q: "How are listings verified?",
      a: "Our team manually reviews every listing for accuracy, safety, and legitimacy before it appears on the platform.",
    },
    {
      q: "Can I report a suspicious listing?",
      a: "Yes — use the flag icon on any listing or email us directly. We investigate all reports within 24 hours.",
    },
  ]

  const colorMap = {
    primary: {
      bg: "bg-primary-50 dark:bg-primary-950/40",
      text: "text-primary-600 dark:text-primary-400",
      border: "border-primary-100 dark:border-primary-900/30",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-950/40",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-100 dark:border-teal-900/30",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/30",
    },
  }

  return (
    <div className="min-h-screen mesh-gradient-light dark:mesh-gradient text-dark-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      {/* Universal Consistent Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-16 md:space-y-24 flex-1 w-full">

        {/* Page Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-fadeSlideDown">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100 dark:border-primary-900/30">
            <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              Contact Us
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-dark-955 dark:text-white">
            We'd love to hear from you
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-300 font-normal leading-relaxed">
            Whether you have a question about listings, need help with your account, or want to partner with us — our team is ready to help.
          </p>
        </div>

        {/* Contact Methods Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {contactMethods.map((method, idx) => {
            const colors = colorMap[method.color]
            const inner = (
              <div
                key={idx}
                className="group bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-6 md:p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(7,18,43,0.04)] hover:-translate-y-1.5 transition-all duration-500 text-left relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[28px]"></div>
                <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center text-xl mb-5`}>
                  {method.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{method.label}</p>
                <p className={`text-base font-bold ${colors.text} mb-1`}>{method.value}</p>
                <p className="text-xs text-gray-400">{method.sub}</p>
              </div>
            )
            return method.href ? (
              <a key={idx} href={method.href} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={idx}>{inner}</div>
            )
          })}
        </section>

        {/* Main Split: Form + Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Contact Form (left, wider) */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] text-left flex flex-col">
            <div className="mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg mb-4">
                ✉️
              </div>
              <h2 className="text-2xl font-bold text-dark-950 dark:text-white tracking-tight">Send us a message</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill out the form and we'll get back to you within 12 hours.</p>
            </div>

            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-3xl">
                  ✅
                </div>
                <h3 className="text-xl font-bold text-dark-950 dark:text-white">Message sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Thanks for reaching out, <span className="font-semibold text-primary-600 dark:text-primary-400">{formData.name}</span>. We'll reply to <span className="font-semibold">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }) }}
                  className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-5 flex-1 flex flex-col" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Your Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-dark-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                      placeholder="Ram Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Your Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-dark-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                      placeholder="ram@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                  <select
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-dark-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="" disabled>Select a subject…</option>
                    <option value="listing">Listing Inquiry</option>
                    <option value="account">Account Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="report">Report a Listing</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Message</label>
                  <textarea
                    required
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-dark-900 dark:text-white outline-none focus:border-primary-500 transition-colors resize-none"
                    placeholder="Tell us how we can help…"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-xs tracking-wider uppercase bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
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
            )}
          </div>

          {/* Right Panel: Dark card with quick info + social */}
          <div className="lg:col-span-5 bg-gradient-to-br from-dark-900 to-dark-950 p-8 md:p-10 rounded-[32px] text-white text-left flex flex-col justify-between relative overflow-hidden shadow-[0_16px_40px_rgba(7,18,43,0.15)] border border-white/5">
            {/* Decorative glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-primary-500/20 rounded-full blur-[40px] -z-0"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[120px] h-[120px] bg-teal-500/10 rounded-full blur-[50px] -z-0"></div>

            <div className="space-y-6 relative z-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Quick ways to reach us</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Prefer a more direct line? Use any of the options below to connect with the SthaanKhoj team.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: "📧", label: "Email", val: "info@sthaankhoj.com" },
                  { icon: "📍", label: "Location", val: "Dhulikhel, Kavrepalanchok" },
                  { icon: "🕐", label: "Hours", val: "Sun–Fri, 9AM–6PM NPT" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { label: "Facebook", icon: "f", href: "#" },
                    { label: "Instagram", icon: "ig", href: "#" },
                    { label: "Twitter", icon: "tw", href: "#" },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      aria-label={s.label}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white transition-all duration-200"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap items-center gap-3 relative z-10">
              <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full">KU Student Project</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Always Responsive</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-10">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
              Quick answers to common queries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-6 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.005)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_30px_rgba(7,18,43,0.02)] transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 min-w-[28px] rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-black">
                    Q
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark-950 dark:text-white mb-2 leading-snug">{faq.q}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Universal Footer */}
      <footer className="w-full border-t border-gray-100 dark:border-white/5 bg-white dark:bg-dark-950 py-8 text-center text-xs font-semibold text-gray-400">
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

export default ContactUs
