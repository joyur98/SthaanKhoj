// frontend/src/components/VerificationStatus.jsx
/**
 * Inline status badge showing current verification state.
 * Used on the VerifyEmail page.
 */
function VerificationStatus({ status, cooldown, onCheckNow }) {
  if (status === "verified") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30"
        style={{ animation: "statusFadeIn 0.4s ease both" }}
      >
        <span className="text-xl">✅</span>
        <div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            Email Verified!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            Redirecting you to the app…
          </p>
        </div>
      </div>
    )
  }

  if (status === "resending") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          Sending verification email…
        </p>
      </div>
    )
  }

  if (status === "resent") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/30"
        style={{ animation: "statusFadeIn 0.4s ease both" }}
      >
        <span className="text-lg">✉️</span>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Verification email resent!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            Check your inbox (and spam folder).
          </p>
        </div>
      </div>
    )
  }

  // Default: waiting
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-60" />
        </div>
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
          Waiting for verification…
        </p>
      </div>
      <button
        onClick={onCheckNow}
        className="text-[10px] font-bold text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer ml-2 shrink-0"
        title="Check now"
      >
        Check now ↺
      </button>
    </div>
  )
}

export default VerificationStatus
