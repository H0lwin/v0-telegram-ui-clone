"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, ChevronRight } from "lucide-react"
import { Avatar } from "./avatar"

interface SettingsPanelProps {
  onBack: () => void
  className?: string
}

// Notification Settings Panel
export function NotificationSettings({ onBack, className }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    messages: true,
    groups: true,
    channels: true,
    sounds: true,
    vibrate: true,
    preview: true,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="bg-card mt-2">
          {[
            { key: "messages", label: "Private Chats", desc: "New messages in private chats" },
            { key: "groups", label: "Groups", desc: "New messages in groups" },
            { key: "channels", label: "Channels", desc: "New posts in channels" },
          ].map((item, i) => (
            <button
              key={item.key}
              onClick={() => toggleSetting(item.key as keyof typeof settings)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3",
                i > 0 && "border-t border-border"
              )}
            >
              <div className="text-left">
                <p className="text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <div className={cn(
                "w-12 h-7 rounded-full p-1 transition-colors",
                settings[item.key as keyof typeof settings] ? "bg-primary" : "bg-muted"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white shadow transition-transform",
                  settings[item.key as keyof typeof settings] && "translate-x-5"
                )} />
              </div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Alerts</p>
        </div>
        
        <div className="bg-card">
          {[
            { key: "sounds", label: "Sounds", desc: "Play sound for notifications" },
            { key: "vibrate", label: "Vibrate", desc: "Vibrate for notifications" },
            { key: "preview", label: "Message Preview", desc: "Show message text in notifications" },
          ].map((item, i) => (
            <button
              key={item.key}
              onClick={() => toggleSetting(item.key as keyof typeof settings)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3",
                i > 0 && "border-t border-border"
              )}
            >
              <div className="text-left">
                <p className="text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <div className={cn(
                "w-12 h-7 rounded-full p-1 transition-colors",
                settings[item.key as keyof typeof settings] ? "bg-primary" : "bg-muted"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white shadow transition-transform",
                  settings[item.key as keyof typeof settings] && "translate-x-5"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Privacy Settings Panel
export function PrivacySettings({ onBack, className }: SettingsPanelProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Privacy and Security</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2 mt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Privacy</p>
        </div>
        
        <div className="bg-card">
          {[
            { label: "Phone Number", value: "My Contacts" },
            { label: "Last Seen & Online", value: "Everyone" },
            { label: "Profile Photo", value: "Everyone" },
            { label: "Forwarded Messages", value: "Everyone" },
            { label: "Calls", value: "Everyone" },
            { label: "Groups", value: "Everyone" },
          ].map((item, i) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors",
                i > 0 && "border-t border-border"
              )}
            >
              <span className="text-foreground">{item.label}</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm">{item.value}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Security</p>
        </div>
        
        <div className="bg-card">
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <span className="text-foreground">Passcode Lock</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-sm">Off</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors border-t border-border">
            <span className="text-foreground">Two-Step Verification</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-sm">Off</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        <div className="bg-card mt-4">
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <span className="text-foreground">Active Sessions</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Chat Settings Panel
export function ChatSettings({ onBack, className }: SettingsPanelProps) {
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Chat Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="bg-card mt-2">
          <div className="px-4 py-3">
            <p className="text-foreground mb-3">Message Text Size</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">A</span>
              <input
                type="range"
                min="12"
                max="22"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-lg text-muted-foreground">A</span>
              <span className="text-sm text-muted-foreground w-8">{fontSize}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Chat Background</p>
        </div>
        
        <div className="bg-card">
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <span className="text-foreground">Change Chat Wallpaper</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors border-t border-border">
            <span className="text-foreground">Color Theme</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary" />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Data</p>
        </div>
        
        <div className="bg-card">
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive">
            <span>Delete All Cloud Drafts</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Appearance Settings Panel
interface AppearanceSettingsProps extends SettingsPanelProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function AppearanceSettings({ onBack, darkMode, onToggleDarkMode, className }: AppearanceSettingsProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Appearance</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="bg-card mt-2">
          <button
            onClick={onToggleDarkMode}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            <div className="text-left">
              <p className="text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <div className={cn(
              "w-12 h-7 rounded-full p-1 transition-colors",
              darkMode ? "bg-primary" : "bg-muted"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow transition-transform",
                darkMode && "translate-x-5"
              )} />
            </div>
          </button>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Accent Color</p>
        </div>
        
        <div className="bg-card p-4">
          <div className="flex gap-3 flex-wrap">
            {[
              "bg-blue-500",
              "bg-green-500",
              "bg-purple-500",
              "bg-pink-500",
              "bg-orange-500",
              "bg-cyan-500",
              "bg-red-500",
              "bg-yellow-500",
            ].map((color, i) => (
              <button
                key={color}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  color,
                  i === 0 && "ring-2 ring-offset-2 ring-primary"
                )}
              >
                {i === 0 && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Profile Panel
export function EditProfile({ onBack, className }: SettingsPanelProps) {
  const [name, setName] = useState("Your Name")
  const [username, setUsername] = useState("username")
  const [bio, setBio] = useState("")

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Edit Profile</h1>
        <button className="ml-auto px-4 py-1.5 text-primary font-medium">
          Done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="bg-card p-6 flex flex-col items-center">
          <div className="relative">
            <Avatar name={name} size="xl" />
            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-card mt-2">
          <div className="px-4 py-3 border-b border-border">
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-foreground mt-1 focus:outline-none"
            />
          </div>
          <div className="px-4 py-3 border-b border-border">
            <label className="text-xs text-muted-foreground">Username</label>
            <div className="flex items-center mt-1">
              <span className="text-primary">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-foreground focus:outline-none"
              />
            </div>
          </div>
          <div className="px-4 py-3">
            <label className="text-xs text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add a few words about yourself"
              rows={3}
              className="w-full bg-transparent text-foreground mt-1 focus:outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
