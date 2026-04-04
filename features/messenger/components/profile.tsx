"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Grid3x3,
  Camera,
  Gift,
} from "lucide-react"

interface ProfileProps {
  onBack: () => void
  onLogout?: () => void
  className?: string
}

type Tab = "posts" | "archived" | "gifts"

export function Profile({ onBack, onLogout, className }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>("posts")
  const [displayName, setDisplayName] = useState("H0lwin")
  const [bio, setBio] = useState("Anything that costs you peace of mind is very expensive.")
  const [username, setUsername] = useState("H0lwin_P")
  const [phone, setPhone] = useState("+98 901 990 3510")
  const [avatar, setAvatar] = useState<string | undefined>()
  const [colorVariant, setColorVariant] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [giftStatus, setGiftStatus] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [draftDisplayName, setDraftDisplayName] = useState(displayName)
  const [draftBio, setDraftBio] = useState(bio)
  const [draftUsername, setDraftUsername] = useState(username)
  const [draftPhone, setDraftPhone] = useState(phone)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sectionThemes = ["bg-card", "bg-accent/30", "bg-primary/10"]

  const openEditDialog = () => {
    setDraftDisplayName(displayName)
    setDraftBio(bio)
    setDraftUsername(username)
    setDraftPhone(phone)
    setShowEditModal(true)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Edit"
            onClick={openEditDialog}
          >
            <Edit className="h-5 w-5 text-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={openEditDialog}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Info</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                <span>Set Profile Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setColorVariant((prev) => (prev + 1) % sectionThemes.length)}>
                <span className="mr-2 h-4 w-4" />
                <span>Change Profile color</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onLogout}>
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className={cn("flex flex-col items-center py-6 px-4", sectionThemes[colorVariant])}>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          {avatar ? (
            <img src={avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <Avatar name={displayName} size="xl" />
          )}
          <h2 className="text-xl font-semibold text-foreground mt-4">{displayName}</h2>
          <p className="text-sm text-muted-foreground mt-1">online</p>
        </div>

        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Info</h3>
          <div className="divide-y divide-border">
            <div className="px-4 py-3">
              <p className="text-foreground">{phone}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mobile</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-foreground">{bio}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Bio</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-foreground">@{username}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Username</p>
              </div>
              <Grid3x3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card mt-2 border-b border-border">
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === "posts"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Posts
              {activeTab === "posts" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === "archived"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Archived Posts
              {activeTab === "archived" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("gifts")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-1",
                activeTab === "gifts"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🎂</span>
              <span>Gifts</span>
              {activeTab === "gifts" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[200px] bg-card">
          {activeTab === "posts" && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-foreground font-medium mb-2">{postCount > 0 ? `${postCount} post(s) published` : "No posts yet..."}</p>
              <p className="text-sm text-muted-foreground text-center">
                Publish photos and videos to display on your profile page
              </p>
            </div>
          )}

          {activeTab === "archived" && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-foreground font-medium mb-2">No stories yet...</p>
              <p className="text-sm text-muted-foreground text-center">
                Upload a new story to view it here.
              </p>
            </div>
          )}

          {activeTab === "gifts" && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-6xl mb-4">🎂</div>
              <p className="text-sm text-muted-foreground text-center">
                Tap on a gift to convert it to Stars or change its privacy settings.
              </p>
              {giftStatus && <p className="text-xs text-primary mt-2">{giftStatus}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 bg-card border-t border-border">
        {activeTab === "posts" && (
          <button
            onClick={() => {
              fileInputRef.current?.click()
              setPostCount((prev) => prev + 1)
            }}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span>Add a post</span>
          </button>
        )}
        {activeTab === "gifts" && (
          <button
            onClick={() => setGiftStatus("Gift sent successfully")}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Gift className="h-5 w-5" />
            <span>Send Gifts to Friends</span>
          </button>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-semibold text-foreground">Edit Profile</h3>
            <input
              value={draftDisplayName}
              onChange={(e) => setDraftDisplayName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={draftUsername}
              onChange={(e) => setDraftUsername(e.target.value.replace(/^@/, ""))}
              placeholder="Username"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="Phone"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              rows={3}
              placeholder="Bio"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (draftDisplayName.trim()) setDisplayName(draftDisplayName.trim())
                  if (draftBio.trim()) setBio(draftBio.trim())
                  if (draftUsername.trim()) setUsername(draftUsername.trim())
                  if (draftPhone.trim()) setPhone(draftPhone.trim())
                  setShowEditModal(false)
                }}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
