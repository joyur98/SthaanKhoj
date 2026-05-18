import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"

function AboutUs({ darkMode, toggleDarkMode }) {
  const values = [
    {
      title: "Trust First",
      desc: "Vigorously verified listings ensuring complete transparency and peace of mind for every single applicant.",
      icon: "🛡️",
    },
    {
      title: "Student Accessibility",
      desc: "Tailored discovery routes designed to match the budget constraints and housing requirements of students.",
      icon: "🎓",
    },
    {
      title: "Vibrant Community",
      desc: "Fostering long-term respectful relationships by bridging landlords and university students smoothly.",
      icon: "🤝",
    },
    {
      title: "Total Convenience",
      desc: "Streamlined search tools, location breakdowns, and instant direct coordination with zero intermediaries.",
      icon: "⚡",
    },
  ]

  return (
    <div className="min-h-screen mesh-gradient-light dark:mesh-gradient text-dark-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      {/* Universal Consistent Navigation */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-16 md:space-y-24 flex-1 w-full">
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(7,18,43,0.04)] hover:-translate-y-1.5 transition-all duration-500 text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[32px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl font-bold mb-6">
              🎯
            </div>
            
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white mb-4 tracking-tight">
              Our Mission
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
              We are dedicated to helping students find safe, comfortable, and affordable rooms near Kathmandu University. We aim to remove the stress from room search by offering vetted listings, exact locations, and intuitive discovery tools.
            </p>
          </div>

          {/* Vision Card */}
          <div className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(7,18,43,0.04)] hover:-translate-y-1.5 transition-all duration-500 text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[32px]"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold mb-6">
              ✨
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
                className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-6 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.005)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_30px_rgba(7,18,43,0.02)] transition-all duration-300 flex flex-col text-left"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
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
          <div className="lg:col-span-7 bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                💻
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
          <div className="lg:col-span-5 bg-gradient-to-br from-dark-900 to-dark-950 p-8 md:p-10 rounded-[32px] text-white text-left flex flex-col justify-between relative overflow-hidden shadow-[0_16px_40px_rgba(7,18,43,0.15)] border border-white/5">
            {/* Soft decorative blur spot */}
            <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-primary-500/20 rounded-full blur-[40px] -z-0"></div>
            
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
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Direct Inquiries
                </span>
                <a
                  href="mailto:info@sthaankhoj.com"
                  className="text-base sm:text-lg font-bold text-primary-400 hover:text-primary-300 transition break-all"
                >
                  info@sthaankhoj.com
                </a>
              </div>

              <a
                href="mailto:info@sthaankhoj.com"
                className="inline-flex justify-center items-center w-full py-3.5 rounded-xl font-bold text-white text-xs tracking-wider uppercase bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 transition-all cursor-pointer text-center"
              >
                Send Email Message
              </a>
            </div>
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

export default AboutUs