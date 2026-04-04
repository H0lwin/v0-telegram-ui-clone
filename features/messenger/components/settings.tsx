"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  CloudDownload,
  Globe,
  HardDrive,
  HelpCircle,
  Laptop,
  Lock,
  LogOut,
  MessageCircle,
  Palette,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCog,
  FolderOpen,
  Wifi,
} from "lucide-react"

interface SettingsProps {
  onBack: () => void
  onLogout?: () => void
  className?: string
}

type Visibility = "Everybody" | "My Contacts" | "Nobody"
type Language = "English" | "Persian" | "Arabic"
type Section =
  | "notifications"
  | "privacy"
  | "storage"
  | "appearance"
  | "devices"
  | "language"
  | "help"
  | "chats"
  | "network"

type Session = {
  id: string
  device: string
  location: string
  active: boolean
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 text-sm font-semibold text-primary border-b border-border">{title}</div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

function SectionRow({
  icon: Icon,
  title,
  description,
  onClick,
  right,
}: {
  icon: any
  title: string
  description?: string
  onClick?: () => void
  right?: React.ReactNode
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
      aria-label="Toggle"
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  )
}

function OverlayModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  )
}

const helpContent: Record<string, string> = {
  "Ask a Question": "Use this section to report issues and request features inside this platform.",
  FAQ: "Common topics: account setup, privacy options, storage cleanup, and session management.",
  "Privacy Policy": "This demo stores data locally in your browser and does not send it to third-party platforms.",
}

export function Settings({ onBack, onLogout, className }: SettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [phone, setPhone] = useState("09019903510")
  const [username, setUsername] = useState("h0lwin_p")
  const [bio, setBio] = useState("Build what users can actually feel.")
  const [displayName, setDisplayName] = useState("H0lwin")
  const [avatar, setAvatar] = useState<string | null>(null)

  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [showBioModal, setShowBioModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)

  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [helpItem, setHelpItem] = useState<string | null>(null)

  const [messagePreview, setMessagePreview] = useState(true)
  const [inAppSounds, setInAppSounds] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)

  const [lastSeenVisibility, setLastSeenVisibility] = useState<Visibility>("Everybody")
  const [profilePhotoVisibility, setProfilePhotoVisibility] = useState<Visibility>("My Contacts")
  const [twoStepVerification, setTwoStepVerification] = useState(false)
  const [passcode, setPasscode] = useState("")

  const [cacheMb, setCacheMb] = useState(428)
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true)
  const [autoDownloadVideos, setAutoDownloadVideos] = useState(false)
  const [autoDownloadFiles, setAutoDownloadFiles] = useState(false)

  const [fontSize, setFontSize] = useState(16)
  const [compactMode, setCompactMode] = useState(false)
  const [chatAnimation, setChatAnimation] = useState(true)
  const [chatFolders, setChatFolders] = useState<string[]>(["All Chats", "Work", "Unread"])

  const [language, setLanguage] = useState<Language>("English")

  const [proxyEnabled, setProxyEnabled] = useState(false)
  const [proxyAddress, setProxyAddress] = useState("")
  const [autoSync, setAutoSync] = useState(true)

  const [sessions, setSessions] = useState<Session[]>([
    { id: "current", device: "Windows Desktop", location: "Tehran", active: true },
    { id: "mobile-1", device: "Android", location: "Tehran", active: false },
  ])

  const storagePercent = useMemo(() => Math.min(100, Math.round((cacheMb / 1024) * 100)), [cacheMb])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border lg:px-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors" aria-label="Back">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection("help")}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Search settings"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-destructive/10 transition-colors" aria-label="Log Out">
            <LogOut className="h-5 w-5 text-destructive" />
          </button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto scrollbar-thin", compactMode && "text-sm")}> 
        <div className="mx-auto w-full lg:max-w-6xl lg:px-6 lg:py-6">
          <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-4">
            <div className="space-y-2 lg:space-y-4">
              <SectionCard title="Profile">
                <div className="flex flex-col items-center py-6 px-4 bg-card">
                  <div className="relative">
                    <div onClick={() => fileRef.current?.click()} className="cursor-pointer">
                      {avatar ? (
                        <img src={avatar} className="w-20 h-20 rounded-full object-cover" alt="Profile Avatar" />
                      ) : (
                        <Avatar name={displayName} size="xl" />
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    </button>
                    <input type="file" ref={fileRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  </div>
                  <h2 onClick={() => setShowNameModal(true)} className="text-xl font-semibold text-foreground mt-4 cursor-pointer hover:opacity-80 transition">
                    {displayName}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">online</p>
                </div>
              </SectionCard>

              <SectionCard title="Account">
                <SectionRow icon={Smartphone} title={phone} description="Tap to change phone number" onClick={() => setShowPhoneModal(true)} />
                <SectionRow icon={UserCog} title={`@${username}`} description="Username" onClick={() => setShowUsernameModal(true)} />
                <SectionRow icon={MessageCircle} title="Bio" description={bio} onClick={() => setShowBioModal(true)} />
              </SectionCard>
            </div>

            <div className="space-y-2 lg:space-y-4">
              <SectionCard title="General Settings">
                <SectionRow icon={Bell} title="Notifications and Sounds" description="Message alerts, sounds, vibration" onClick={() => setActiveSection("notifications")} />
                <SectionRow icon={Lock} title="Privacy and Security" description="Last seen, profile visibility, passcode" onClick={() => setActiveSection("privacy")} />
                <SectionRow icon={HardDrive} title="Data and Storage" description={`${cacheMb} MB cache used`} onClick={() => setActiveSection("storage")} />
                <SectionRow icon={Palette} title="Appearance" description={`Font ${fontSize}px, ${compactMode ? "Compact" : "Comfortable"}`} onClick={() => setActiveSection("appearance")} />
                <SectionRow icon={FolderOpen} title="Chats and Folders" description={`${chatFolders.length} folders`} onClick={() => setActiveSection("chats")} />
                <SectionRow icon={Wifi} title="Network and Sync" description={proxyEnabled ? "Proxy enabled" : "Direct connection"} onClick={() => setActiveSection("network")} />
                <SectionRow icon={Laptop} title="Devices" description={`${sessions.length} active sessions`} onClick={() => setActiveSection("devices")} />
                <SectionRow icon={Globe} title="Language" description={language} onClick={() => setActiveSection("language")} />
              </SectionCard>

              <SectionCard title="Help">
                <SectionRow icon={MessageCircle} title="Ask a Question" description="Open in-app support" onClick={() => setHelpItem("Ask a Question")} />
                <SectionRow icon={HelpCircle} title="FAQ" description="Common questions and answers" onClick={() => setHelpItem("FAQ")} />
                <SectionRow icon={ShieldCheck} title="Privacy Policy" description="Read data and privacy notes" onClick={() => setHelpItem("Privacy Policy")} />
              </SectionCard>

              <div className="hidden lg:block rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-primary mb-2">Desktop Quick View</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Notifications: {desktopNotifications ? "On" : "Off"}</p>
                  <p>Auto Sync: {autoSync ? "On" : "Off"}</p>
                  <p>Storage: {cacheMb} MB used</p>
                  <p>Language: {language}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 text-center space-y-1">
            <p className="text-xs text-muted-foreground">Takgram for Desktop</p>
            <p className="text-xs text-muted-foreground">v1.0.0 (demo build)</p>
          </div>
        </div>
      </div>

      {showPhoneModal && (
        <OverlayModal title="Change Phone Number" onClose={() => setShowPhoneModal(false)}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="09xxxxxxxxx"
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            type="tel"
          />
          <button onClick={() => setShowPhoneModal(false)} className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Save
          </button>
        </OverlayModal>
      )}

      {showUsernameModal && (
        <OverlayModal title="Edit Username" onClose={() => setShowUsernameModal(false)}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="username"
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={() => setShowUsernameModal(false)} className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Save
          </button>
        </OverlayModal>
      )}

      {showBioModal && (
        <OverlayModal title="Edit Bio" onClose={() => setShowBioModal(false)}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={120}
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="text-right text-xs text-muted-foreground">{bio.length}/120</div>
          <button onClick={() => setShowBioModal(false)} className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Save
          </button>
        </OverlayModal>
      )}

      {showNameModal && (
        <OverlayModal title="Edit Display Name" onClose={() => setShowNameModal(false)}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={() => setShowNameModal(false)} className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Save
          </button>
        </OverlayModal>
      )}

      {activeSection === "notifications" && (
        <OverlayModal title="Notifications and Sounds" onClose={() => setActiveSection(null)}>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Show message previews</span><Switch checked={messagePreview} onChange={setMessagePreview} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">In-app sounds</span><Switch checked={inAppSounds} onChange={setInAppSounds} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Vibration</span><Switch checked={vibration} onChange={setVibration} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Desktop notifications</span><Switch checked={desktopNotifications} onChange={setDesktopNotifications} /></div>
        </OverlayModal>
      )}

      {activeSection === "privacy" && (
        <OverlayModal title="Privacy and Security" onClose={() => setActiveSection(null)}>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Last seen</p>
            <div className="flex gap-2">
              {(["Everybody", "My Contacts", "Nobody"] as Visibility[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLastSeenVisibility(opt)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs border", lastSeenVisibility === opt ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border")}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Profile photo visibility</p>
            <div className="flex gap-2">
              {(["Everybody", "My Contacts", "Nobody"] as Visibility[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setProfilePhotoVisibility(opt)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs border", profilePhotoVisibility === opt ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border")}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Two-step verification</span>
              <Switch checked={twoStepVerification} onChange={setTwoStepVerification} />
            </div>
            {twoStepVerification && (
              <input
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Set passcode"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
        </OverlayModal>
      )}

      {activeSection === "storage" && (
        <OverlayModal title="Data and Storage" onClose={() => setActiveSection(null)}>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-foreground"><span>Cache usage</span><span>{cacheMb} MB</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${storagePercent}%` }} /></div>
          </div>
          <button
            onClick={() => setCacheMb(0)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors text-sm text-foreground"
          >
            <Trash2 className="h-4 w-4" /> Clear Cache
          </button>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto-download photos</span><Switch checked={autoDownloadPhotos} onChange={setAutoDownloadPhotos} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto-download videos</span><Switch checked={autoDownloadVideos} onChange={setAutoDownloadVideos} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto-download files</span><Switch checked={autoDownloadFiles} onChange={setAutoDownloadFiles} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Cloud backup sync</span><Switch checked={autoSync} onChange={setAutoSync} /></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CloudDownload className="h-3.5 w-3.5" /> Backup stored in platform cloud.</div>
        </OverlayModal>
      )}

      {activeSection === "appearance" && (
        <OverlayModal title="Appearance" onClose={() => setActiveSection(null)}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-foreground"><span>Font size</span><span>{fontSize}px</span></div>
            <input type="range" min={12} max={22} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Compact mode</span><Switch checked={compactMode} onChange={setCompactMode} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Chat animations</span><Switch checked={chatAnimation} onChange={setChatAnimation} /></div>
        </OverlayModal>
      )}

      {activeSection === "chats" && (
        <OverlayModal title="Chats and Folders" onClose={() => setActiveSection(null)}>
          <div className="space-y-2">
            {chatFolders.map((folder) => (
              <div key={folder} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-sm text-foreground">{folder}</span>
                {folder !== "All Chats" && (
                  <button
                    onClick={() => setChatFolders((prev) => prev.filter((item) => item !== folder))}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setChatFolders((prev) => [...prev, `Folder ${prev.length + 1}`])}
            className="w-full py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-accent transition-colors"
          >
            Add Folder
          </button>
        </OverlayModal>
      )}

      {activeSection === "network" && (
        <OverlayModal title="Network and Sync" onClose={() => setActiveSection(null)}>
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Use Proxy</span><Switch checked={proxyEnabled} onChange={setProxyEnabled} /></div>
          {proxyEnabled && (
            <input
              value={proxyAddress}
              onChange={(e) => setProxyAddress(e.target.value)}
              placeholder="proxy.takgram.local:1080"
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <div className="flex items-center justify-between"><span className="text-sm text-foreground">Auto sync</span><Switch checked={autoSync} onChange={setAutoSync} /></div>
        </OverlayModal>
      )}

      {activeSection === "devices" && (
        <OverlayModal title="Devices" onClose={() => setActiveSection(null)}>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-background">
                <div>
                  <p className="text-sm text-foreground">{session.device}</p>
                  <p className="text-xs text-muted-foreground">{session.location} {session.active ? "- current" : ""}</p>
                </div>
                {!session.active && (
                  <button onClick={() => setSessions((prev) => prev.filter((item) => item.id !== session.id))} className="text-xs text-destructive hover:underline">
                    Terminate
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setSessions((prev) => prev.filter((session) => session.active))}
            className="w-full py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-accent transition-colors"
          >
            Terminate Other Sessions
          </button>
        </OverlayModal>
      )}

      {activeSection === "language" && (
        <OverlayModal title="Language" onClose={() => setActiveSection(null)}>
          <div className="flex gap-2">
            {(["English", "Persian", "Arabic"] as Language[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setLanguage(opt)}
                className={cn("px-3 py-2 rounded-lg text-sm border", language === opt ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border")}
              >
                {opt}
              </button>
            ))}
          </div>
        </OverlayModal>
      )}

      {activeSection === "help" && (
        <OverlayModal title="Settings Help" onClose={() => setActiveSection(null)}>
          <p className="text-sm text-muted-foreground">
            Manage your account, privacy, notifications, storage, sessions, and appearance from this page. Everything stays inside this platform.
          </p>
        </OverlayModal>
      )}

      {helpItem && (
        <OverlayModal title={helpItem} onClose={() => setHelpItem(null)}>
          <p className="text-sm text-muted-foreground">{helpContent[helpItem]}</p>
        </OverlayModal>
      )}
    </div>
  )
}
