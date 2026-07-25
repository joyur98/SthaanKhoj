// frontend/src/pages/VerifyEmail.jsx
import { useCallback } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { signOut } from "firebase/auth"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { auth } from "../firebase"
import logo2 from "../assets/logo2.png"
import { useEmailVerification } from "../hooks/useEmailVerification"
import VerificationStatus from "../components/VerificationStatus"
import EmailSentBanner from "../components/EmailSentBanner"

function VerifyEmail({ darkMode }) {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()

  const email =
    location.state?.email ||
    auth.currentUser?.email ||
    ""

  const handleVerified = useCallback(() => {
    setTimeout(() => navigate("/verification-success"), 1800)
  }, [navigate])

  const { verificationStatus, cooldown, resendError, resendEmail, checkNow, verificationLink } =
    useEmailVerification({ onVerified: handleVerified })

  const isVerified = verificationStatus === "verified"

  const handleBackToLogin = async () => {
    await signOut(auth)
    navigate("/login")
  }

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
      className={`min-h-screen flex items-center justify-center p-5 transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #070d19 0%, #0e1b35 100%)"
          : "linear-gradient(135deg, #f0fdf8 0%, #e8fdf5 40%, #f0f9ff 100%)",
      }}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[8%] right-[8%] w-[380px] h-[380px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(6,214,160,0.28), transparent 70%)" }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-[8%] left-[8%] w-[320px] h-[320px] rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }}
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
          {/* Top gradient stripe */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-teal-400 to-indigo-500 origin-left"
          />

          <div className="px-8 pt-8 pb-10 sm:px-10">

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

            {/* ── VERIFIED STATE ── */}
            <AnimatePresence mode="wait">
              {isVerified ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-5 py-4"
                >
                  {/* Confetti circles */}
                  <div className="relative flex justify-center">
                    {["#06D6A0","#6366f1","#F59E0B","#EF4444","#06D6A0"].map((c, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2.5 h-2.5 rounded-full"
                        style={{ background: c }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: i * 0.08,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20 
                      }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 flex items-center justify-center text-5xl border-4 border-emerald-100 dark:border-emerald-800/30"
                    >
                      ✅
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-2xl font-extrabold text-dark-950 dark:text-white mb-1">
                      Email Verified! 🎉
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your account is now active.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/20"
                  >
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Taking you to SthaanKhoj…
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ) : (
                // ── WAITING STATE ──
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Floating envelope */}
                  <motion.div 
                    variants={fadeInUp}
                    className="flex flex-col items-center mb-7"
                  >
                    <motion.div
                      className="relative mb-5"
                      animate={!reduceMotion ? { 
                        y: [0, -12, 0],
                        rotate: [-1.5, 1.5, -1.5]
                      } : {}}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        className="w-[88px] h-[88px] drop-shadow-[0_12px_28px_rgba(6,214,160,0.22)]"
                      >
                        {/* Background rounded square */}
                        <rect width="100" height="100" rx="26" fill="url(#bgGrad)" />
                        {/* Envelope body */}
                        <rect x="14" y="30" width="72" height="44" rx="5" fill="white" fillOpacity="0.95" />
                        {/* Envelope flap */}
                        <path d="M14 35l36 24 36-24" stroke="#06D6A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        {/* Bottom corners */}
                        <path d="M14 70l22-18M86 70L64 52" stroke="#06D6A0" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
                        {/* Subtle lines suggesting text */}
                        <line x1="30" y1="50" x2="46" y2="50" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="30" y1="57" x2="55" y2="57" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100">
                            <stop stopColor="#06D6A0" stopOpacity="0.18" />
                            <stop offset="1" stopColor="#6366f1" stopOpacity="0.10" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Animated ping dot */}
                      <span className="absolute -top-1.5 -right-1.5 flex">
                        <span className="w-4 h-4 rounded-full bg-primary-400 opacity-75 animate-ping absolute" />
                        <span className="w-4 h-4 rounded-full bg-primary-500 relative" />
                      </span>
                    </motion.div>

                    <motion.h1 
                      variants={fadeInUp}
                      className="text-2xl font-extrabold tracking-tight text-dark-950 dark:text-white text-center mb-1"
                    >
                      Check your email
                    </motion.h1>
                    <motion.p 
                      variants={fadeInUp}
                      className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed"
                    >
                      We sent a verification link to
                    </motion.p>
                    {email && (
                      <motion.p 
                        variants={fadeInUp}
                        className="mt-1 text-sm font-extrabold text-dark-950 dark:text-white break-all text-center"
                      >
                        {email}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Email sent confirmation banner */}
                  <motion.div variants={fadeInUp}>
                    <EmailSentBanner email={email} />
                  </motion.div>

                  {/* Instruction box */}
                  <motion.div 
                    variants={fadeInUp}
                    className="mb-5 px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="font-bold text-dark-950 dark:text-white">Click the link</span> in
                      the email to verify your account. This page updates automatically.
                    </p>
                  </motion.div>

                  {/* Live status */}
                  <motion.div variants={fadeInUp} className="mb-5">
                    <VerificationStatus
                      status={verificationStatus}
                      cooldown={cooldown}
                      onCheckNow={checkNow}
                    />
                  </motion.div>

                  {/* Resend error */}
                  <AnimatePresence>
                    {resendError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 overflow-hidden"
                      >
                        <p className="text-xs font-semibold text-red-500 dark:text-red-400">
                          ⚠️ {resendError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Resend button */}
                  <motion.button
                    variants={fadeInUp}
                    whileHover={!reduceMotion && cooldown === 0 && verificationStatus !== "resending" ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!reduceMotion && cooldown === 0 && verificationStatus !== "resending" ? { scale: 0.98 } : {}}
                    id="resend-verification-btn"
                    onClick={resendEmail}
                    disabled={cooldown > 0 || verificationStatus === "resending"}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                      cooldown > 0
                        ? "bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : verificationStatus === "resending"
                        ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 text-primary-500 cursor-wait"
                        : "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/40 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {verificationStatus === "resending" ? (
                      <>
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full"
                        />
                        Sending…
                      </>
                    ) : cooldown > 0 ? (
                      `🕐 Resend available in ${cooldown}s`
                    ) : (
                      "🔁 Resend Verification Email"
                    )}
                  </motion.button>

                  {/* Refresh status button */}
                  <motion.button
                    variants={fadeInUp}
                    whileHover={!reduceMotion ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!reduceMotion ? { scale: 0.98 } : {}}
                    onClick={checkNow}
                    className="w-full mt-3 py-3 rounded-2xl text-sm font-bold border border-gray-100 dark:border-white/5 bg-white dark:bg-white/3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-dark-950 dark:hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    🔄 Refresh Status
                  </motion.button>

                  {/* Fallback verification link */}
                  {verificationLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 text-left"
                    >
                      <p className="text-xs font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 mb-1.5">
                        <span>🔑</span> Direct Verification Link
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed font-medium">
                        If the email didn't arrive, you can click the link below to verify your account immediately:
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={verificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-white dark:bg-[#070d19] border border-gray-150 dark:border-white/5 rounded-xl text-[10px] font-mono text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 break-all select-all outline-none leading-relaxed transition-colors max-h-16 overflow-y-auto block"
                        >
                          {verificationLink}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(verificationLink);
                          }}
                          className="px-3 bg-white hover:bg-gray-50 dark:bg-[#070d19] dark:hover:bg-white/5 border border-gray-150 dark:border-white/5 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Copy Link"
                        >
                          📋
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Divider + back to login */}
                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-3 my-5"
                  >
                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                  </motion.div>

                  <motion.button
                    variants={fadeInUp}
                    whileHover={!reduceMotion ? { scale: 1.02 } : {}}
                    onClick={handleBackToLogin}
                    className="block w-full text-center text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    ← Return to Sign In
                  </motion.button>

                  <motion.p 
                    variants={fadeInUp}
                    className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600"
                  >
                    Didn't get the email? Check your spam or junk folder.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer note */}
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

export default VerifyEmail