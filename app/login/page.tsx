"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"

type Step = "phone" | "otp"

/* ---------------- OTP INPUT ---------------- */

function OTPInput({
  length = 6,
  value,
  onChange
}: {
  length?: number
  value: string
  onChange: (val: string) => void
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return

    const newValue = value.split("")
    newValue[index] = val
    const final = newValue.join("")
    onChange(final)

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    onChange(pasted)
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="w-12 h-14 text-center text-lg font-medium rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
        />
      ))}
    </div>
  )
}

/* ---------------- PAGE ---------------- */

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "")
    if (v.length > 11) v = v.slice(0, 11)
    return v
  }

  const sendOtp = () => {
    if (phone.length < 10) return
    setStep("otp")
    setTimer(60)
  }

  const verifyOtp = () => {
    if (otp.length !== 6) return
    router.push("/")
  }

  /* auto submit */
  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp()
    }
  }, [otp])

  /* resend timer */
  useEffect(() => {
    if (step !== "otp") return
    if (timer === 0) return

    const interval = setInterval(() => {
      setTimer((t) => t - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [step, timer])

  const containerVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-6">

      <div className="w-full max-w-md backdrop-blur-2xl bg-card/60 border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your phone number to continue
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* PHONE STEP */}
          {step === "phone" && (
            <motion.div
              key="phone"
              variants={containerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >

              <div className="flex items-center px-4 py-3 rounded-xl bg-background border border-border focus-within:ring-2 focus-within:ring-ring transition">

                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Phone number (e.g. 09123456789)"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <button
                onClick={sendOtp}
                disabled={phone.length < 10}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>

            </motion.div>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={containerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >

              <div className="text-center text-sm text-muted-foreground">
                Code sent to
                <div className="text-foreground font-medium mt-1">
                  {phone}
                </div>
              </div>

              <OTPInput value={otp} onChange={setOtp} />

              <button
                onClick={verifyOtp}
                disabled={otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
              >
                Verify & Continue
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* RESEND */}
              <div className="text-center text-sm">
                {timer > 0 ? (
                  <span className="text-muted-foreground">
                    Resend code in {timer}s
                  </span>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="text-primary hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>

              {/* CHANGE NUMBER */}
              <button
                onClick={() => {
                  setStep("phone")
                  setOtp("")
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition"
              >
                Change phone number
              </button>

            </motion.div>
          )}

        </AnimatePresence>

        {/* DISCLAIMER */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed mt-6">
          This messaging platform is designed to enhance communication. Any violation
          of the laws of the Islamic Republic of Iran may result in strict legal action.
          Unauthorized use, distribution of VPN services, or any form of cyber
          exploitation is strictly prohibited.
        </p>

      </div>
    </div>
  )
}