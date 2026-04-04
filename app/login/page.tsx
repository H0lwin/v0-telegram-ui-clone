"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { OTPInput } from "@/features/auth/components/otp-input"
import { isValidIranPhone, normalizeIranPhone, requestOtp, saveSession, validateOtp } from "@/features/auth/lib/demo-auth"

type Step = "phone" | "otp"

const stepVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)
  const [otpError, setOtpError] = useState("")
  const [demoCode, setDemoCode] = useState("")

  const canSendOtp = isValidIranPhone(phone)

  const handleSendOtp = () => {
    if (!canSendOtp) return
    const code = requestOtp(phone)
    setDemoCode(code)
    setOtpError("")
    setOtp("")
    setStep("otp")
    setTimer(60)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return
    const result = validateOtp(phone, otp)
    if (!result.ok) {
      setOtpError(result.error)
      return
    }
    saveSession({ phone })
    router.push("/")
  }

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [step, timer])

  return (
    <AuthShell
      title="Sign in"
      subtitle="Enter your phone number to continue"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
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
              Continue
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
            className="space-y-5"
          >
            <div className="text-center text-sm text-muted-foreground">
              Code sent to
              <div className="mt-1 font-medium text-foreground">{phone}</div>
            </div>

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
              Verify & Continue
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-sm">
              {timer > 0 ? (
                <span className="text-muted-foreground">Resend code in {timer}s</span>
              ) : (
                <button onClick={handleSendOtp} className="text-primary hover:underline">
                  Resend code
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setStep("phone")
                setOtp("")
                setOtpError("")
              }}
              className="w-full text-sm text-muted-foreground transition hover:text-foreground"
            >
              Change phone number
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
