"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { 
  X,
  Bookmark,
  Users,
  Phone,
  Settings,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare
} from "lucide-react"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onNavigate?: (screen: string) => void
  className?: string
}

const menuItems = [
  { icon: Bookmark, label: "Saved Messages", screen: "saved", color: "text-primary" },
  { icon: Users, label: "Contacts", screen: "contacts", color: "text-blue-500" },
  { icon: Phone, label: "Calls", screen: "calls", color: "text-green-500" },
  { icon: MessageSquare, label: "New Group", screen: "new-group", color: "text-purple-500" },
  { icon: Settings, label: "Settings", screen: "settings", color: "text-muted-foreground" },
  { icon: HelpCircle, label: "Help", screen: "help", color: "text-muted-foreground" },
]

export function SidebarMenu({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  className,
}: SidebarMenuProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setShouldRender(false)
    }
  }

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-200",
          isOpen ? "opacity-100 animate-in fade-in" : "opacity-0 animate-out fade-out"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-72 bg-card z-50 flex flex-col shadow-xl",
          "duration-200",
          isOpen ? "animate-in slide-in-from-left" : "animate-out slide-out-to-left",
          className
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Header */}
        <div className="bg-primary p-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Avatar name="You" size="lg" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">Your Name</h3>
            <p className="text-sm text-primary-foreground/70">+1 234 567 8900</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => {
                onNavigate?.(item.screen)
                onClose()
              }}
              className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
              <span className="text-foreground">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-border my-2" />

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Messenger Clone v1.0
          </p>
        </div>
      </div>
    </>
  )
}
