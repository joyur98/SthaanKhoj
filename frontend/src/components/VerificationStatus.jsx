// frontend/src/components/VerificationStatus.jsx
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

/**
 * Inline status badge showing current verification state.
 * Used on the VerifyEmail page.
 */
function VerificationStatus({ status, cooldown, onCheckNow }) {
  const reduceMotion = useReducedMotion()

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    }
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }

  if (status === "verified") {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30"
      >
        <motion.span 
          className="text-xl"
          animate={!reduceMotion ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          ✅
        </motion.span>
        <div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            Email Verified!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            Redirecting you to the app…
          </p>
        </div>
      </motion.div>
    )
  }

  if (status === "resending") {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full shrink-0"
        />
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          Sending verification email…
        </p>
      </motion.div>
    )
  }

  if (status === "resent") {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/30"
      >
        <motion.span 
          className="text-lg"
          animate={!reduceMotion ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ✉️
        </motion.span>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Verification email resent!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            Check your inbox (and spam folder).
          </p>
        </div>
      </motion.div>
    )
  }

  // Default: waiting
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20"
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <motion.div 
            className="w-3 h-3 rounded-full bg-blue-400"
            animate={!reduceMotion ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 opacity-60"
            animate={!reduceMotion ? { scale: [1, 1.8, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
          Waiting for verification…
        </p>
      </div>
      <motion.button
        whileHover={!reduceMotion ? { scale: 1.05 } : {}}
        whileTap={!reduceMotion ? { scale: 0.95 } : {}}
        onClick={onCheckNow}
        className="text-[10px] font-bold text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer ml-2 shrink-0"
        title="Check now"
      >
        Check now ↺
      </motion.button>
    </motion.div>
  )
}

export default VerificationStatus