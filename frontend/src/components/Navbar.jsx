import { useState, useEffect } from "react"
import logo2 from "../assets/logo2.png"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"

function Navbar({ darkMode, toggleDarkMode }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Find Rooms", path: "/find-rooms" },
    { name: "Favorites", path: "/favorites" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "bg-white/80 dark:bg-dark-950/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] border-b border-gray-100/50 dark:border-white/5 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Left: Brand Logo */}
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="relative p-1 bg-white dark:bg-dark-900 rounded-full shadow-[0_4px_16px_rgba(16,185,129,0.12)] border border-green-50 dark:border-white/5 overflow-hidden transition-all duration-500 group-hover:rotate-12 group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img
              src={logo2}
              alt="SthaanKhoj Logo"
              className="w-10 h-10 object-contain relative z-10"
            />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-bold tracking-tight leading-none flex items-center">
              <span className="text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">Sthaan</span>
              <span className="text-primary-600">Khoj</span>
            </h1>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
              KU Room Finder
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative py-1.5 text-sm tracking-wide transition-colors duration-300 group ${
                isActive(link.path)
                  ? "text-primary-600 dark:text-primary-400 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:text-dark-900 dark:hover:text-white"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-primary-500 to-teal-500 transition-all duration-300 ${
                  isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 dark:border-white/10 dark:hover:border-white/20 bg-gray-50/50 hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-dark-950 dark:text-gray-400 dark:hover:text-white transition-all duration-300 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform duration-500 hover:rotate-45">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.93 4.93l1.58 1.58m9.75 9.75l1.58 1.58M3 12h2.25m13.5 0H21M5.75 18.25l1.58-1.58m9.75-9.75l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform duration-500 hover:-rotate-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <button className="relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_4px_14px_rgba(16,185,129,0.22)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer">
            Post a Room
          </button>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Log Out
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-dark-900 dark:hover:text-white transition-all focus:outline-none"
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[9px]" : ""}`}></span>
            <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0 w-0" : "w-full"}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[9px]" : ""}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white dark:bg-dark-900 shadow-2xl border-l border-gray-100/50 dark:border-white/5 p-6 flex flex-col justify-between transform transition-transform duration-500 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <img src={logo2} alt="Logo" className="w-8 h-8 object-contain" />
              <h2 className="font-bold text-lg text-dark-950 dark:text-white">
                Sthaan<span className="text-primary-600">Khoj</span>
              </h2>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-dark-900 dark:hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold tracking-wide transition-all text-left ${
                  isActive(link.path)
                    ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-dark-900 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/10">
          <div className="flex justify-between items-center px-3 mb-2">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 transition"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-teal-500 shadow-md text-center cursor-pointer"
          >
            Post a Room
          </button>
          {/* Mobile Log Out */}
          <button
            onClick={() => { setMobileMenuOpen(false); handleLogout() }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
