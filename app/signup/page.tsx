"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, User } from "lucide-react"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { OTPInput } from "@/features/auth/components/otp-input"
import {
  isValidIranPhone,
  normalizeIranPhone,
  requestOtp,
  saveSession,
  upsertDemoUser,
  validateOtp,
} from "@/features/auth/lib/demo-auth"

type Step = "phone" | "otp" | "profile"

const stepVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [demoCode, setDemoCode] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")

  const canSendOtp = isValidIranPhone(phone)
  const usernameValid = /^[a-zA-Z][a-zA-Z0-9_]{3,24}$/.test(username)
  const canCreateAccount = displayName.trim().length >= 2 && usernameValid

  const handleSendOtp = () => {
    if (!canSendOtp) return
    const code = requestOtp(phone)
    setDemoCode(code)
    setOtpError("")
    setOtp("")
    setStep("otp")
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return
    const result = validateOtp(phone, otp)
    if (!result.ok) {
      setOtpError(result.error)
      return
    }
    setStep("profile")
  }

  const handleFinishSignup = () => {
    if (!canCreateAccount) return
    upsertDemoUser({
      phone,
      username: username.trim(),
      displayName: displayName.trim(),
    })
    saveSession({ phone, username: username.trim(), displayName: displayName.trim() })
    router.push("/")
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Set up your Takgram profile"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className={"h-2 w-2 rounded-full " + (step === "phone" ? "bg-primary" : "bg-muted")} />
        <div className={"h-2 w-2 rounded-full " + (step === "otp" ? "bg-primary" : "bg-muted")} />
        <div className={"h-2 w-2 rounded-full " + (step === "profile" ? "bg-primary" : "bg-muted")} />
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.div
            key="phone"
            variants={stepVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
              <input
                value={phone}
                onChange={(e) => setPhone(normalizeIranPhone(e.target.value))}
                placeholder="Phone number (09xxxxxxxxx)"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={!canSendOtp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Send OTP
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            variants={stepVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-center text-sm text-muted-foreground">Enter the verification code</p>
            <OTPInput value={otp} onChange={setOtp} />

            {demoCode && (
              <p className="text-center text-xs text-muted-foreground">
                Demo code: <span className="font-medium text-foreground">{demoCode}</span>
              </p>
            )}
            {otpError && <p className="text-center text-xs text-destructive">{otpError}</p>}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Verify OTP
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div
            key="profile"
            variants={stepVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Complete your profile
            </div>

            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="Username"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            {username.length > 0 && !usernameValid && (
              <p className="text-xs text-destructive">
                Username must start with a letter and be 4-25 characters.
              </p>
            )}

            <button
              onClick={handleFinishSignup}
              disabled={!canCreateAccount}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
