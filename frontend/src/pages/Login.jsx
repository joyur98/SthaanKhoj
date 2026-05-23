import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import logo2 from "../assets/logo2.png"

function Login({ darkMode }) {
  const navigate = useNavigate()
  const [role, setRole] = useState("student")
  const [form, setForm] = useState({ email: "", password: "" })
  const [focused, setFocused] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      navigate("/home")
    }, 1800)
  }

  return (
    <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-gray-50/50 dark:bg-dark-950 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 relative mesh-gradient overflow-hidden">

        <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3.5 animate-fadeSlideDown">
          <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <img src={logo2} alt="SthaanKhoj Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
              Sthaan<span className="text-primary-400">Khoj</span>
            </h1>
            <span className="text-[10px] text-gray-300 font-semibold tracking-wider uppercase mt-1 block">
              KU Room Discovery
            </span>
          </div>
        </div>

        {/* Core Selling Points */}
        <div className="relative z-10 space-y-10 my-auto text-left max-w-sm">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-widest">
                Welcome Back
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Your next room is one sign-in away.
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg text-primary-300 shrink-0">✓</div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">Saved Room Shortlists</h4>
                <p className="text-gray-300 text-xs mt-0.5 leading-relaxed font-normal">Pick up exactly where you left off with your saved listings.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg text-primary-300 shrink-0">✓</div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">Direct Landlord Chat</h4>
                <p className="text-gray-300 text-xs mt-0.5 leading-relaxed font-normal">Message verified landlords instantly — no middlemen.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-gray-400 font-medium">
          <p>© 2026 SthaanKhoj. Built for KU.</p>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 lg:col-span-7 bg-[#fafbfc] dark:bg-[#070d19] transition-colors duration-300">
        <div className="w-full max-w-lg bg-white dark:bg-dark-900/60 rounded-[32px] p-6 sm:p-10 md:p-12 border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_rgba(7,18,43,0.035)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-fadeSlideUp">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logo2} alt="Logo" className="w-9 h-9 object-contain" />
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white">
              Sthaan<span className="text-primary-600">Khoj</span>
            </h2>
          </div>

          <div className="space-y-2 mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Sign in
            </h2>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Don't have an account?{" "}
              <Link to="/" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="relative p-1 bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center mb-8">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-950 dark:bg-primary-600 rounded-xl shadow-md transition-all duration-500 ease-out ${role === "student" ? "left-1" : "left-[50%]"}`}
            ></div>
            <button
              type="button"
              onClick={() => { setRole("student"); setError("") }}
              className={`relative z-10 flex-1 py-3 text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${role === "student" ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-dark-955 dark:hover:text-white"}`}
            >
              <span>🎓</span> Student
            </button>
            <button
              type="button"
              onClick={() => { setRole("landlord"); setError("") }}
              className={`relative z-10 flex-1 py-3 text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${role === "landlord" ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-dark-955 dark:hover:text-white"}`}
            >
              <span>🏠</span> Landlord
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                placeholder={role === "student" ? "aarav@ku.edu.np" : "landlord@example.com"}
                required
                className={`w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50/80 dark:bg-dark-950 dark:hover:bg-dark-950/80 rounded-2xl border text-sm font-medium tracking-wide outline-none transition-all duration-300 dark:text-white ${focused === "email"
                  ? "border-primary-500 bg-white dark:bg-dark-900 shadow-[0_0_0_4px_rgba(16,185,129,0.1)] ring-1 ring-primary-500"
                  : "border-gray-100 hover:border-gray-200 dark:border-white/5"}`}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3.5 pr-12 bg-gray-50/50 hover:bg-gray-50/80 dark:bg-dark-950 dark:hover:bg-dark-950/80 rounded-2xl border text-sm font-medium tracking-wide outline-none transition-all duration-300 dark:text-white ${focused === "password"
                    ? "border-primary-500 bg-white dark:bg-dark-900 shadow-[0_0_0_4px_rgba(16,185,129,0.1)] ring-1 ring-primary-500"
                    : "border-gray-100 hover:border-gray-200 dark:border-white/5"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer text-base"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 px-4 py-2.5 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm tracking-wider uppercase text-white shadow-lg transition-all duration-300 active:scale-98 cursor-pointer ${submitted
                ? "bg-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.22)]"
                : "bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"}`}
            >
              {submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block"></span>
                  Signing you in...
                </span>
              ) : (
                `Sign in as ${role === "student" ? "Student" : "Landlord"}`
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-dark-950 text-sm font-bold text-dark-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-900 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

        </div>
      </div>

      <style>{`
        .mesh-gradient {
          background-color: #070d19;
          background-image: 
            radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
            radial-gradient(at 90% 80%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
            radial-gradient(at 50% 10%, rgba(6, 182, 212, 0.08) 0px, transparent 50%);
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideDown { animation: fadeSlideDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fadeSlideUp   { animation: fadeSlideUp   0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  )
}

export default Login
