import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo2 from "../assets/logo2.png"

function Register({ darkMode }) {
  const [role, setRole] = useState("student")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [focused, setFocused] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      navigate("/home")
    }, 1800)
  }

  return (
    <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-gray-50/50 dark:bg-dark-950 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>


      {/* ── Left Panel (Luxury Brand & Feature Stats) ── */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 relative mesh-gradient overflow-hidden">
        
        {/* Glow ambient spots */}
        <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>

        {/* Logo and Brand */}
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
                Exclusive KU Network
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Bridging KU students & local housing.
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg text-primary-300 shrink-0">✓</div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">Direct Booking Pipeline</h4>
                <p className="text-gray-300 text-xs mt-0.5 leading-relaxed font-normal">Connect directly with vetted local landlords near Dhulikhel.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg text-primary-300 shrink-0">✓</div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">Vetted Safety Criteria</h4>
                <p className="text-gray-300 text-xs mt-0.5 leading-relaxed font-normal">Every listed house matches our rigorous security standard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex justify-between items-center text-xs text-gray-400 font-medium">
          <p>© 2026 SthaanKhoj. Built for KU.</p>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
        </div>
      </div>

      {/* ── Right Panel (Registration Card & Form) ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 lg:col-span-7 bg-[#fafbfc] dark:bg-[#070d19] transition-colors duration-300">
        <div className="w-full max-w-lg bg-white dark:bg-dark-900/60 rounded-[32px] p-6 sm:p-10 md:p-12 border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_rgba(7,18,43,0.035)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-fadeSlideUp">

          {/* Mobile logo container */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logo2} alt="Logo" className="w-9 h-9 object-contain" />
            <h2 className="text-2xl font-bold text-dark-950 dark:text-white">
              Sthaan<span className="text-primary-600">Khoj</span>
            </h2>
          </div>

          <div className="space-y-2 mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white">
              Create account
            </h2>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Already have an account?{" "}
              <a href="#" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                Sign in
              </a>
            </p>
          </div>

          {/* Premium Animated Role Toggle */}
          <div className="relative p-1 bg-gray-50 dark:bg-dark-950 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center mb-8">
            {/* Sliding highlight indicator background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-dark-950 dark:bg-primary-600 rounded-xl shadow-md transition-all duration-500 ease-out ${role === "student" ? "left-1" : "left-[50%]"
                }`}
            ></div>

            {/* Student Button */}
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative z-10 flex-1 py-3 text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${role === "student" ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-dark-955 dark:hover:text-white"
                }`}
            >
              <span>🎓</span> Student
            </button>

            {/* Landlord Button */}
            <button
              type="button"
              onClick={() => setRole("landlord")}
              className={`relative z-10 flex-1 py-3 text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${role === "landlord" ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-dark-955 dark:hover:text-white"
                }`}
            >
              <span>🏠</span> Landlord
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: "fullName", label: "Full Name", type: "text", placeholder: "Aarav Shrestha" },
                { name: "email", label: "Email Address", type: "email", placeholder: "aarav@ku.edu.np" },
                { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
                { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5 text-left">
                  <label
                    htmlFor={field.name}
                    className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused("")}
                    required
                    className={`w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50/80 dark:bg-dark-950 dark:hover:bg-dark-950/80 rounded-2xl border text-sm font-medium tracking-wide outline-none transition-all duration-300 dark:text-white ${focused === field.name
                        ? "border-primary-500 bg-white dark:bg-dark-900 shadow-[0_0_0_4px_rgba(16,185,129,0.1)] ring-1 ring-primary-500"
                        : "border-gray-100 hover:border-gray-200 dark:border-white/5"
                      }`}
                  />
                </div>
              ))}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 text-left">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/10 text-primary-600 focus:ring-primary-500 accent-primary-600 cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-normal select-none">
                I agree to SthaanKhoj's{" "}
                <a href="#" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Register Action button */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm tracking-wider uppercase text-white shadow-lg transition-all duration-300 active:scale-98 cursor-pointer ${submitted
                  ? "bg-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.22)]"
                  : "bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                }`}
            >
              {submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                  Deploying Profile...
                </span>
              ) : (
                "Create Free Account"
              )}
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
        .animate-fadeSlideDown {
          animation: fadeSlideDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

    </div>
  )
}

export default Register
