// frontend/src/pages/VerificationSuccess.jsx
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import logo2 from "../assets/logo2.png"

// Confetti particle
function Particle({ color, x, y, delay, size, rotation }) {
  return (
    <div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size * 0.5,
        background: color,
        left: `${x}%`,
        top: `${y}%`,
        animation: `confettiDrop 2.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms forwards`,
        transform: `rotate(${rotation}deg)`,
        opacity: 0,
      }}
    />
  )
}

const CONFETTI_COLORS = ["#06D6A0","#6366f1","#F59E0B","#EF4444","#38bdf8","#fb7185","#34d399"]

function VerificationSuccess({ darkMode }) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: Math.random() * 100,
      y: Math.random() * 30 - 10,
      delay: Math.random() * 800,
      size: Math.random() * 10 + 6,
      rotation: Math.random() * 360,
    }))
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/login")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-5 overflow-hidden transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #070d19 0%, #0e1b35 100%)"
          : "linear-gradient(135deg, #f0fdf8 0%, #e8fdf5 40%, #f0f9ff 100%)",
      }}
    >
      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
        {/* Ambient blobs */}
        <div
          className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(6,214,160,0.25), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)" }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md"
        style={{ animation: "successCardUp 0.7s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="bg-white dark:bg-[#0e1b35]/90 backdrop-blur-2xl rounded-[28px] border border-gray-100 dark:border-white/5 shadow-[0_32px_80px_rgba(7,18,43,0.07)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* Rainbow top stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-indigo-400 to-teal-400" />

          <div className="px-8 pt-8 pb-10 sm:px-10 text-center">

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/20">
                <img src={logo2} alt="SthaanKhoj" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-lg font-bold text-dark-950 dark:text-white tracking-tight">
                Sthaan<span className="text-primary-600 dark:text-primary-400">Khoj</span>
              </span>
            </div>

            {/* Big success icon */}
            <div className="flex justify-center mb-6">
              <div
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center border-4 border-emerald-200 dark:border-emerald-700/40"
                style={{ animation: "bigSuccessPop 0.7s cubic-bezier(0.175,0.885,0.32,1.275) 0.2s both" }}
              >
                <span className="text-5xl">✅</span>
                {/* Rotating ring */}
                <div
                  className="absolute inset-[-6px] rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: "#06D6A0",
                    borderRightColor: "#06D6A0",
                    animation: "ringRotate 2s linear infinite",
                    opacity: 0.4,
                  }}
                />
              </div>
            </div>

            {/* Headings */}
            <h1
              className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white mb-2"
              style={{ animation: "fadeSlideUp 0.6s ease 0.4s both" }}
            >
              Email Verified Hai Taaaa!!!
            </h1>
            <p
              className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed"
              style={{ animation: "fadeSlideUp 0.6s ease 0.5s both" }}
            >
              Your email has been successfully verified.
              <br />
              You can now start using SthaanKhoj.
            </p>

            {/* CTA buttons */}
            <div
              className="space-y-3 mb-6"
              style={{ animation: "fadeSlideUp 0.6s ease 0.6s both" }}
            >
              <Link
                to="/login"
                className="block w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white font-extrabold text-sm tracking-wide shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all"
              >
                Continue to Login →
              </Link>
              <Link
                to="/"
                className="block w-full py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-dark-950 dark:hover:text-white transition-all hover:-translate-y-0.5"
              >
                Go to Homepage
              </Link>
            </div>

            {/* Auto-redirect countdown */}
            <p
              className="text-xs text-gray-400 dark:text-gray-600"
              style={{ animation: "fadeSlideUp 0.6s ease 0.7s both" }}
            >
              Redirecting to sign-in in{" "}
              <span className="font-bold text-primary-600 dark:text-primary-400">{countdown}s</span>
              …
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-600">
          © 2026 SthaanKhoj · Built for KU
        </p>
      </div>

      <style>{`
        @keyframes successCardUp {
          from { opacity: 0; transform: translateY(36px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bigSuccessPop {
          0%   { transform: scale(0.3) rotate(-20deg); opacity: 0; }
          70%  { transform: scale(1.1) rotate(4deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiDrop {
          0%   { opacity: 1; transform: translateY(-20px) rotate(0deg) scale(0); }
          20%  { opacity: 1; transform: translateY(0) rotate(90deg) scale(1); }
          100% { opacity: 0; transform: translateY(120px) rotate(720deg) scale(0.5); }
        }
      `}</style>
    </div>
  )
}

export default VerificationSuccess
