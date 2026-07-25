// frontend/src/hooks/useEmailVerification.js
import { useState, useEffect, useRef, useCallback } from "react"
import { sendEmailVerification } from "firebase/auth"
import { auth } from "../firebase"
import { generateVerificationLink } from "../services/api"

const RESEND_COOLDOWN = 60 // seconds
const POLL_INTERVAL = 3000 // 3 seconds

/**
 * Custom hook for email verification flow.
 * Assumes the user is signed in (but unverified).
 * Polls Firebase every 3s and provides resend functionality.
 * When verified, calls onVerified() — the caller decides where to navigate
 * (typically /verification-success for registration, or /home for login).
 */
export function useEmailVerification({ onVerified }) {
  const [verificationStatus, setVerificationStatus] = useState("waiting")
  // 'waiting' | 'verified' | 'resending' | 'resent' | 'error'
  const [cooldown, setCooldown] = useState(0)
  const [resendError, setResendError] = useState("")
  const [verificationLink, setVerificationLink] = useState("")

  const pollRef = useRef(null)
  const cooldownRef = useRef(null)

  // Fetch the verification link on mount for dev/fallback support
  useEffect(() => {
    const getLink = async () => {
      try {
        const res = await generateVerificationLink()
        if (res?.link) {
          setVerificationLink(res.link)
        }
      } catch (err) {
        console.error("Error fetching verification link:", err)
      }
    }
    getLink()
  }, [])

  // ── Auto-poll for emailVerified every 3 s ──────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return
        await currentUser.reload()
        if (auth.currentUser?.emailVerified) {
          clearInterval(pollRef.current)
          setVerificationStatus("verified")
          onVerified?.()
        }
      } catch {
        // Silently ignore transient errors
      }
    }, POLL_INTERVAL)

    return () => clearInterval(pollRef.current)
  }, [onVerified])

  // ── Cooldown ticker ────────────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    clearInterval(cooldownRef.current)
    setCooldown(RESEND_COOLDOWN)
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => clearInterval(cooldownRef.current), [])

  // ── Manual verification check ──────────────────────────────────────────────
  const checkNow = useCallback(async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return
      await currentUser.reload()
      if (auth.currentUser?.emailVerified) {
        clearInterval(pollRef.current)
        setVerificationStatus("verified")
        onVerified?.()
      }
    } catch {
      // Ignore
    }
  }, [onVerified])

  // ── Resend email ───────────────────────────────────────────────────────────
  const resendEmail = useCallback(async () => {
    if (cooldown > 0 || verificationStatus === "resending") return
    setResendError("")
    setVerificationStatus("resending")
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No signed-in user")

      await sendEmailVerification(currentUser, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      })

      setVerificationStatus("resent")
      startCooldown()
    } catch (err) {
      const msgs = {
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
      }
      setResendError(msgs[err.code] || "Failed to resend. Please try again.")
      setVerificationStatus("waiting")
    }
  }, [cooldown, verificationStatus, startCooldown])

  return {
    verificationStatus,
    cooldown,
    resendError,
    resendEmail,
    checkNow,
    verificationLink,
  }
}
