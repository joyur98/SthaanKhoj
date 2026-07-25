// frontend/src/pages/VerificationSuccess.jsx
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import logo2 from "../assets/logo2.png"

// Confetti particle
function Particle({ color, x, y, delay, size, rotation }) {
  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size * 0.5,
        background: color,
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{ opacity: 0, y: -20, scale: 0 }}
      animate={{ opacity: 0, y: 120, scale: 0.5, rotate: 720 }}
      transition={{ 
        duration: 2.5, 
        delay: delay / 1000, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    />
  )
}

const CONFETTI_COLORS = ["#06D6A0","#6366f1","#F59E0B","#EF4444","#38bdf8","#fb7185","#34d399"]

function VerificationSuccess({ darkMode }) {
  const reduceMotion = useReducedMotion()
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const scaleOnHover = {
    whileHover: !reduceMotion ? { scale: 1.02, y: -2, transition: { duration: 0.2 } } : {}
  }

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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(6,214,160,0.25), transparent 70%)" }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)" }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div 
          variants={fadeInUp}
          className="bg-white dark:bg-[#0e1b35]/90 backdrop-blur-2xl rounded-[28px] border border-gray-100 dark:border-white/5 shadow-[0_32px_80px_rgba(7,18,43,0.07)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Rainbow top stripe */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-indigo-400 to-teal-400 origin-left"
          />

          <div className="px-8 pt-8 pb-10 sm:px-10 text-center">

            {/* Logo */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <motion.div 
                whileHover={!reduceMotion ? { scale: 1.05, rotate: -5 } : {}}
                className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/20"
              >
                <img src={logo2} alt="SthaanKhoj" className="w-8 h-8 object-contain" />
              </motion.div>
              <span className="text-lg font-bold text-dark-950 dark:text-white tracking-tight">
                Sthaan<span className="text-primary-600 dark:text-primary-400">Khoj</span>
              </span>
            </motion.div>

            {/* Big success icon */}
            <motion.div 
              variants={fadeInUp}
              className="flex justify-center mb-6"
            >
              <motion.div
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.2 
                }}
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center border-4 border-emerald-200 dark:border-emerald-700/40"
              >
                <motion.span 
                  animate={!reduceMotion ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl"
                >
                  ✅
                </motion.span>
                {/* Rotating ring */}
                <motion.div
                  className="absolute inset-[-6px] rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: "#06D6A0",
                    borderRightColor: "#06D6A0",
                    opacity: 0.4,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </motion.div>

            {/* Headings */}
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl font-extrabold tracking-tight text-dark-950 dark:text-white mb-2"
            >
              Email Verified Hai Taaaa!!!
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed"
            >
              Your email has been successfully verified.
              <br />
              You can now start using SthaanKhoj.
            </motion.p>

            {/* CTA buttons */}
            <motion.div 
              variants={staggerContainer}
              className="space-y-3 mb-6"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to="/login"
                  className="block w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white font-extrabold text-sm tracking-wide shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-98"
                >
                  Continue to Login →
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/"
                  className="block w-full py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-dark-950 dark:hover:text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-98"
                >
                  Go to Homepage
                </Link>
              </motion.div>
            </motion.div>

            {/* Auto-redirect countdown */}
            <motion.p 
              variants={fadeInUp}
              className="text-xs text-gray-400 dark:text-gray-600"
            >
              Redirecting to sign-in in{" "}
              <motion.span 
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-bold text-primary-600 dark:text-primary-400"
              >
                {countdown}
              </motion.span>
              s …
            </motion.p>
          </div>
        </motion.div>

        <motion.p 
          variants={fadeInUp}
          className="mt-5 text-center text-xs text-gray-400 dark:text-gray-600"
        >
          © 2026 SthaanKhoj · Built for KU
        </motion.p>
      </motion.div>
    </div>
  )
}

export default VerificationSuccess