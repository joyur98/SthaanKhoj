// frontend/src/components/EmailSentBanner.jsx
/**
 * Prominent top-of-card banner confirming the verification email was sent.
 */
function EmailSentBanner({ email }) {
  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden border border-primary-100 dark:border-primary-800/30"
      style={{ animation: "bannerDrop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {/* Green accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-teal-400" />

      <div className="px-4 py-4 bg-primary-50/60 dark:bg-primary-950/20 flex gap-3 items-start">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-lg shrink-0 mt-0.5">
          ✉️
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary-800 dark:text-primary-300 leading-tight">
            Verification link sent
          </p>
          <p className="text-xs text-primary-700 dark:text-primary-400 mt-0.5 leading-relaxed">
            We emailed a verification link to{" "}
            <span className="font-bold break-all">{email || "your address"}</span>.
            Click the link to activate your account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailSentBanner
