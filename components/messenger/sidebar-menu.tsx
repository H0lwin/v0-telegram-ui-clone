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
  User,
  Plus,
  ChevronUp,
  Megaphone
} from "lucide-react"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onNavigate?: (screen: string) => void
  className?: string
}

interface Account {
  id: string
  name: string
  avatar?: string
  active?: boolean
  badge?: string
}

const mockAccounts: Account[] = [
  { id: "1", name: "H0lwin", active: true, badge: "78.3K" },
  { id: "2", name: "H0lwin" },
]

const menuItems = [
  { icon: User, label: "My Profile", screen: "profile" },
  { icon: Users, label: "New Group", screen: "new-group" },
  { icon: Megaphone, label: "New Channel", screen: "new-channel" },
  { icon: User, label: "Contacts", screen: "contacts" },
  { icon: Phone, label: "Calls", screen: "calls" },
  { icon: Bookmark, label: "Saved Messages", screen: "saved" },
  { icon: Settings, label: "Settings", screen: "settings" },
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
          "fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 flex flex-col shadow-xl",
          "duration-200",
          isOpen ? "animate-in slide-in-from-left" : "animate-out slide-out-to-left",
          className
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* User Profile Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name="H0lwin" size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sidebar-foreground truncate">H0lwin</h3>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span>Set Emoji Status</span>
                <ChevronUp className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-sidebar-accent transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>
        </div>

        {/* Account List */}
        <div className="border-b border-sidebar-border py-2">
          {mockAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                // Handle account switch
              }}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-2.5 hover:bg-sidebar-accent transition-colors",
                account.active && "bg-sidebar-accent"
              )}
            >
              <Avatar name={account.name} size="md" src={account.avatar} />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {account.name}
                </span>
                {account.badge && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {account.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
          <button
            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-sidebar-accent transition-colors"
            onClick={() => {
              // Handle add account
            }}
          >
            <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center border-2 border-dashed border-sidebar-border">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-sidebar-foreground">
              Add Account
            </span>
          </button>
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
              className="flex items-center gap-4 w-full px-4 py-3 hover:bg-sidebar-accent transition-colors"
            >
              <item.icon className="h-5 w-5 text-sidebar-foreground" />
              <span className="text-sidebar-foreground">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-sidebar-border my-2" />

          {/* Night Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex items-center gap-4">
              <Moon className="h-5 w-5 text-sidebar-foreground" />
              <span className="text-sidebar-foreground">Night Mode</span>
            </div>
            <div
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200",
                darkMode ? "bg-primary" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  darkMode && "translate-x-5"
                )}
              />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Telegram Desktop
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Version 6.4.2 x64 - About
          </p>
        </div>
      </div>
    </>
  )
}
