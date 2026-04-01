"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ShieldCheck, User } from "lucide-react"

type Step = "phone" | "otp" | "profile"

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("phone")

  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")

  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")

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
    setStep("profile")
  }

  const finishSignup = () => {
    if (!username || !displayName) return
    router.push("/")
  }

  const variant = {
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
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Built for fast and secure communication
          </p>
        </div>

        {/* WARNING */}
        <div className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-xl p-3 mb-4">
          This messaging platform is designed to improve communication.
          Any violation of the laws of the Islamic Republic of Iran will result in strict action.
          Illegal use, distribution of VPN services, or cyber exploitation is prohibited.
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-2 rounded-full ${step === "phone" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-2 rounded-full ${step === "otp" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-2 rounded-full ${step === "profile" ? "bg-primary" : "bg-muted"}`} />
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 - PHONE */}
          {step === "phone" && (
            <motion.div
              key="phone"
              variants={variant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-lg">🇮🇷</span>
                <span>Enter your phone number</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
                {/* <span className="text-sm text-muted-foreground">09</span> */}

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
                Send OTP
                <ArrowRight className="h-4 w-4" />
              </button>

            </motion.div>
          )}

          {/* STEP 2 - OTP */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={variant}
              initial="hidden"
              animate="visible"
              exit="exit"
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
                Verify OTP
                <ArrowRight className="h-4 w-4" />
              </button>

            </motion.div>
          )}

          {/* STEP 3 - PROFILE */}
          {step === "profile" && (
            <motion.div
              key="profile"
              variants={variant}
              initial="hidden"
              animate="visible"
              exit="exit"
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
                className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={finishSignup}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition"
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </button>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  )
}