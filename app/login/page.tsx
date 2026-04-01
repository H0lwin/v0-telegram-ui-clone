"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"

type Step = "phone" | "otp"

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")

  const formatIranPhone = (value: string) => {
    let v = value.replace(/\D/g, "")
    if (v.length > 11) v = v.slice(0, 11)
    return v
  }

  const sendOtp = () => {
    if (phone.length < 10) return
    setStep("otp")
  }

  const verifyOtp = () => {
    if (!otp) return
    router.push("/")
  }

  const containerVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">

      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-2 rounded-full transition-all ${step === "phone" ? "bg-primary scale-125" : "bg-muted"}`} />
          <div className={`h-2 w-2 rounded-full transition-all ${step === "otp" ? "bg-primary scale-125" : "bg-muted"}`} />
        </div>

        {/* ANIMATED STEPS */}
        <AnimatePresence mode="wait">

          {/* STEP 1 - PHONE */}
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

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-lg">🇮🇷</span>
                <span>Enter your Iranian phone number</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border focus-within:ring-2 focus-within:ring-primary">

                {/* <span className="text-sm text-muted-foreground whitespace-nowrap">
                  09
                </span> */}

                <input
                  value={phone}
                  onChange={(e) => setPhone(formatIranPhone(e.target.value))}
                  placeholder="09123456789"
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <button
                onClick={sendOtp}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition"
              >
                Send Code
                <ArrowRight className="h-4 w-4" />
              </button>

            </motion.div>
          )}

          {/* STEP 2 - OTP */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={containerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Enter verification code
              </div>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={verifyOtp}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition"
              >
                Verify & Continue
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setStep("phone")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition"
              >
                Change phone number
              </button>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  )
}