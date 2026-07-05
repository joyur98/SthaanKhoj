import { useEffect, useState } from "react"
import logo2 from "../assets/logo2.png"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { listenToUnreadCount } from "../services/chatService"
import { useTranslation } from "react-i18next"


function Navbar({ darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const { t, i18n } = useTranslation()

  const location = useLocation()
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  useEffect(() => {
    if (!user || !role) { setUnreadCount(0); return }
    const unsubscribe = listenToUnreadCount(user.uid, role, setUnreadCount)
    return () => unsubscribe()
  }, [user, role])


  const navLinks = [
    { key: "home", name: t("nav.home"), path: "/home" },
    { key: "findRooms", name: t("nav.findRooms"), path: "/find-rooms" },
    { key: "messages", name: t("nav.messages"), path: "/messages", badge: unreadCount },
    { key: "favorites", name: t("nav.favorites"), path: "/favorites" },
    { key: "analytics", name: t("nav.analytics"), path: "/analytics" },
    { key: "about", name: t("nav.about"), path: "/about" },
    { key: "contact", name: t("nav.contact"), path: "/contact" },
  ]


  const isActive = (path) => location.pathname === path


  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleLang = () => {
    const next = i18n.language === "en" ? "ne" : "en"
    i18n.changeLanguage(next)
  }


  return (
    <>
      {/* ── Floating Pill Navbar ─────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1180px] transition-all duration-300 ${
          scrolled
            ? "shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            : "shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-full px-4 py-2.5 flex items-center justify-between gap-3">


          {/* ── Logo Lockup ─────────────────────────────────────────── */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="SthaanKhoj Home"
          >
            <div className="w-9 h-9 rounded-full bg-[#FBF7F0] dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-[#06D6A0]/20 group-hover:ring-[#06D6A0]/50 transition-all duration-300">
              <img
                src={logo2}
                alt="SthaanKhoj logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight">
                <span className="text-gray-900 dark:text-white">Sthaan</span>
                <span className="text-[#06D6A0]">Khoj</span>
              </span>
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold tracking-[0.15em] uppercase mt-0.5">
                KU Room Finder
              </span>
            </div>
          </Link>


          {/* ── Desktop Nav Links ────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`relative px-3 py-2 text-[13px] font-medium rounded-full transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-gray-900 dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <span className="relative inline-flex items-center gap-1">
                  {link.name}
                  {link.badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </span>
                  {isActive(link.path) && (
                    <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-[60%] h-[3px] bg-[#06D6A0] rounded-full" />
                  )}
              </Link>
            ))}
          </div>


          {/* ── Desktop Controls ─────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            {/* Language toggle — outline pill */}
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="px-3 py-1.5 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#06D6A0] hover:text-[#06D6A0] transition-all duration-200"
            >
              {i18n.language === "en" ? "🇳🇵 ने" : "🇬🇧 EN"}
            </button>

            {/* Theme toggle — outline pill */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="relative flex items-center w-14 h-7 rounded-full border border-gray-300 dark:border-gray-600 p-[2px] transition-colors cursor-pointer"
            >
              <div className={`absolute top-[2px] left-[2px] w-6 h-6 rounded-full bg-gray-600 dark:bg-gray-400 transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
              <div className="w-1/2 flex items-center justify-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${!darkMode ? 'text-white' : 'text-gray-400 dark:text-gray-300'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.93 4.93l1.58 1.58m9.75 9.75l1.58 1.58M3 12h2.25m13.5 0H21M5.75 18.25l1.58-1.58m9.75-9.75l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              </div>
              <div className="w-1/2 flex items-center justify-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${darkMode ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </div>
            </button>


            {/* Profile button — outline circle */}
            <Link
              to={role === "landlord" ? "/profile/landlord" : "/profile/student"}
              aria-label="Go to profile"
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>


            {/* Landlord: Post a Room */}
            {role === "landlord" && (
              <Link
                to="/post-room"
                className="px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-[0_4px_12px_rgba(6,214,160,0.3)] hover:shadow-[0_6px_16px_rgba(6,214,160,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("nav.postRoom")}
              </Link>
            )}


            {/* Log Out / Log In — coral pill */}
            {user ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#FF6B47] hover:bg-[#f55a35] shadow-[0_4px_12px_rgba(255,107,71,0.3)] hover:shadow-[0_6px_16px_rgba(255,107,71,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#FF6B47] hover:bg-[#f55a35] shadow-[0_4px_12px_rgba(255,107,71,0.3)] hover:shadow-[0_6px_16px_rgba(255,107,71,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>


          {/* ── Mobile Hamburger ─────────────────────────────────────── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0 w-0" : "w-full"}`} />
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>


        </div>
      </nav>


      {/* ── Mobile backdrop ──────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}


      {/* ── Mobile Drawer ────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-400 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer top: logo + close */}
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-5 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FBF7F0] dark:bg-gray-800 flex items-center justify-center overflow-hidden ring-1 ring-[#06D6A0]/20">
                <img src={logo2} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-base">
                Sthaan<span className="text-[#06D6A0]">Khoj</span>
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>


          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`relative flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "bg-[#06D6A0]/10 text-[#06D6A0] dark:text-[#06D6A0]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{link.name}</span>
                {link.badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                )}
                {isActive(link.path) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#06D6A0] rounded-r-full" />
                )}
              </Link>
            ))}
          </div>
        </div>


        {/* Drawer bottom: theme + language + actions */}
        <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {darkMode ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold transition-all"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="flex items-center justify-between px-1 mb-4">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Language
            </span>
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold transition-all"
            >
              {i18n.language === "en" ? "🇳🇵 ने" : "🇬🇧 EN"}
            </button>
          </div>


          {role === "landlord" && (
            <Link
              to="/post-room"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 rounded-2xl text-sm font-bold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-md text-center transition-all"
            >
              {t("nav.postRoom")}
            </Link>
          )}


          {user && (
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout() }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white bg-[#FF6B47] hover:bg-[#f55a35] shadow-[0_4px_12px_rgba(255,107,71,0.25)] transition-all duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {t("nav.logout")}
            </button>
          )}
        </div>
      </div>
    </>
  )
}


export default Navbar