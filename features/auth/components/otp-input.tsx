"use client"

import { useRef } from "react"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (val: string) => void
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const newValue = value.split("")
    newValue[index] = val
    onChange(newValue.join(""))
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
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
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
          className="h-14 w-12 rounded-xl border border-border bg-background text-center text-lg font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"
        />
      ))}
    </div>
  )
}
