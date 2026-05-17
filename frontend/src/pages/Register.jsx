import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
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
  navigate("/home")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      navigate("/home")
    }, 2000)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ── Left Panel (branding) ── */}
      <div
        className="hidden md:flex flex-col justify-between px-16 py-14"
        style={{ backgroundColor: "#07122b" }}
      >
        {/* Logo */}
        <div className="animate-fadeSlideDown" style={{ animationDelay: "0ms" }}>
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-white">Sthaan</span>
            <span className="text-green-400">Khoj</span>
          </h1>
          <p className="text-green-300 mt-2 text-lg font-medium">
            Student Room Finder
          </p>
        </div>

        {/* Centre illustration text */}
        <div
          className="animate-fadeSlideUp"
          style={{ animationDelay: "150ms" }}
        >
          <p className="text-6xl font-bold text-white leading-tight">
            Find your<br />
            <span className="text-green-400">perfect room</span><br />
            near KU.
          </p>
          <p className="text-gray-400 mt-6 text-lg leading-relaxed max-w-sm">
            Safe, affordable, and verified rooms in Dhulikhel and surrounding areas — just for KU students.
          </p>
        </div>

        {/* Bottom stats */}
        <div
          className="flex gap-10 animate-fadeSlideUp"
          style={{ animationDelay: "300ms" }}
        >
          {[
            { val: "200+", label: "Listings" },
            { val: "4.8★", label: "Avg Rating" },
            { val: "1 day", label: "Avg Find Time" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.val}</p>
              <p className="text-gray-400 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex items-center justify-center px-8 py-14 bg-gray-50">
        <div
          className="w-full max-w-md animate-fadeSlideUp"
          style={{ animationDelay: "100ms" }}
        >
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center">
            <h1 className="text-4xl font-bold">
              <span style={{ color: "#07122b" }}>Sthaan</span>
              <span className="text-green-700">Khoj</span>
            </h1>
          </div>

          <h2
            className="text-3xl font-bold mb-1"
            style={{ color: "#07122b" }}
          >
            Create account
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-green-700 font-semibold hover:underline">
              Sign in
            </a>
          </p>

          {/* Role toggle */}
          <div
            className="flex rounded-2xl p-1 mb-8"
            style={{ backgroundColor: "#e8edf5" }}
          >
            {["student", "landlord"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300"
                style={
                  role === r
                    ? {
                        backgroundColor: "#07122b",
                        color: "white",
                        boxShadow: "0 2px 12px rgba(7,18,43,0.25)",
                      }
                    : { color: "#6b7280" }
                }
              >
                {r === "student" ? "🎓 Student" : "🏠 Landlord"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "fullName", label: "Full Name", type: "text", placeholder: "Aarav Shrestha" },
              { name: "email", label: "Email Address", type: "email", placeholder: "aarav@ku.edu.np" },
              { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
              { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
            ].map((field, i) => (
              <div
                key={field.name}
                className="animate-fadeSlideUp"
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: "#07122b" }}
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
                  className="w-full px-4 py-3.5 rounded-2xl border-2 text-sm outline-none transition-all duration-200 bg-white"
                  style={{
                    borderColor:
                      focused === field.name ? "#15803d" : "#e5e7eb",
                    boxShadow:
                      focused === field.name
                        ? "0 0 0 3px rgba(21,128,61,0.12)"
                        : "none",
                    color: "#07122b",
                  }}
                />
              </div>
            ))}

            {/* Terms */}
            <div
              className="flex items-start gap-3 animate-fadeSlideUp"
              style={{ animationDelay: "460ms" }}
            >
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 accent-green-700 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-green-700 font-semibold hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-700 font-semibold hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit */}
            <div
              className="animate-fadeSlideUp pt-1"
              style={{ animationDelay: "500ms" }}
            >
              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 active:scale-95"
                style={{
                  backgroundColor: submitted ? "#15803d" : "#07122b",
                  boxShadow: "0 4px 24px rgba(7,18,43,0.25)",
                }}
              >
                {submitted ? "✓ Account Created!" : `Register as ${role === "student" ? "Student" : "Landlord"}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Animation keyframes ── */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideDown {
          animation: fadeSlideDown 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>
    </div>
  )
}

export default Register
