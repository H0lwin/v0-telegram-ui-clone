"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (firstName: string, lastName: string, countryCode: string, phoneNumber: string) => void
}

// Country code to flag emoji mapping
const getCountryFlag = (code: string): string | null => {
  const flagMap: Record<string, string> = {
    "1": "🇺🇸", // US/Canada
    "44": "🇬🇧", // UK
    "33": "🇫🇷", // France
    "49": "🇩🇪", // Germany
    "39": "🇮🇹", // Italy
    "34": "🇪🇸", // Spain
    "31": "🇳🇱", // Netherlands
    "32": "🇧🇪", // Belgium
    "41": "🇨🇭", // Switzerland
    "43": "🇦🇹", // Austria
    "45": "🇩🇰", // Denmark
    "46": "🇸🇪", // Sweden
    "47": "🇳🇴", // Norway
    "358": "🇫🇮", // Finland
    "7": "🇷🇺", // Russia
    "81": "🇯🇵", // Japan
    "82": "🇰🇷", // South Korea
    "86": "🇨🇳", // China
    "91": "🇮🇳", // India
    "61": "🇦🇺", // Australia
    "64": "🇳🇿", // New Zealand
    "55": "🇧🇷", // Brazil
    "52": "🇲🇽", // Mexico
    "54": "🇦🇷", // Argentina
    "27": "🇿🇦", // South Africa
    "20": "🇪🇬", // Egypt
    "971": "🇦🇪", // UAE
    "966": "🇸🇦", // Saudi Arabia
    "98": "🇮🇷", // Iran
    "90": "🇹🇷", // Turkey
    "92": "🇵🇰", // Pakistan
    "880": "🇧🇩", // Bangladesh
    "62": "🇮🇩", // Indonesia
    "60": "🇲🇾", // Malaysia
    "65": "🇸🇬", // Singapore
    "66": "🇹🇭", // Thailand
    "84": "🇻🇳", // Vietnam
    "63": "🇵🇭", // Philippines
  }
  return flagMap[code] || null
}

export function AddContactModal({
  isOpen,
  onClose,
  onSave,
}: AddContactModalProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const countryCodeInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "") // Only allow numbers
    setCountryCode(value)
  }

  const handleCountryCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent deletion of the "+" symbol
    if (e.key === "Backspace" && countryCodeInputRef.current) {
      const selectionStart = countryCodeInputRef.current.selectionStart || 0
      if (selectionStart <= 1) {
        e.preventDefault()
      }
    }
    // Prevent arrow keys from moving before the "+"
    if ((e.key === "ArrowLeft" || e.key === "Home") && countryCodeInputRef.current) {
      const selectionStart = countryCodeInputRef.current.selectionStart || 0
      if (selectionStart <= 1) {
        e.preventDefault()
        countryCodeInputRef.current.setSelectionRange(1, 1)
      }
    }
  }

  const handleCountryCodeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Always position cursor after the "+"
    setTimeout(() => {
      if (e.target.selectionStart === null || e.target.selectionStart < 1) {
        e.target.setSelectionRange(1, 1)
      }
    }, 0)
  }

  const handleSave = () => {
    if (firstName.trim() && countryCode && phoneNumber.trim()) {
      onSave(firstName.trim(), lastName.trim(), countryCode, phoneNumber.trim())
      handleClose()
    }
  }

  const handleClose = () => {
    setFirstName("")
    setLastName("")
    setCountryCode("")
    setPhoneNumber("")
    onClose()
  }

  const countryFlag = countryCode ? getCountryFlag(countryCode) : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add Contact</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div className="flex flex-col gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Country Code and Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                {/* Country Code Input with Fixed + */}
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    {/* Flag Display */}
                    {countryFlag && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl z-10 pointer-events-none">
                        {countryFlag}
                      </div>
                    )}
                    {/* Fixed + Symbol */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground pointer-events-none z-10">
                      {countryFlag ? "" : "+"}
                    </span>
                    <input
                      ref={countryCodeInputRef}
                      type="tel"
                      placeholder="Code"
                      value={countryCode}
                      onChange={handleCountryCodeChange}
                      onKeyDown={handleCountryCodeKeyDown}
                      onFocus={handleCountryCodeFocus}
                      className={cn(
                        "px-3 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
                        countryFlag ? "pl-10" : "pl-8",
                        "min-w-[100px] max-w-[120px]"
                      )}
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!firstName.trim() || !countryCode || !phoneNumber.trim()}
            className={cn(
              "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
              (!firstName.trim() || !countryCode || !phoneNumber.trim()) && "opacity-50 cursor-not-allowed"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
