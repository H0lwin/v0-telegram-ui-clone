"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Search, Camera, Check, Copy, CheckCheck } from "lucide-react"
import { Avatar } from "./avatar"
import type { User } from "@/lib/types"

interface NewChannelDialogProps {
  isOpen: boolean
  onClose: () => void
  contacts: User[]
  onCreateChannel: (name: string, avatar: string | undefined, description: string, isPublic: boolean, link: string, memberIds: string[]) => void
}

function generatePrivateLink(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const randomPart = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `https://t.me/+${randomPart}`
}

export function NewChannelDialog({
  isOpen,
  onClose,
  contacts,
  onCreateChannel,
}: NewChannelDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [channelName, setChannelName] = useState("")
  const [channelAvatar, setChannelAvatar] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [channelType, setChannelType] = useState<"public" | "private" | null>(null)
  const [publicLink, setPublicLink] = useState("")
  const [privateLink, setPrivateLink] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  if (!isOpen) return null

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNext = () => {
    if (step === 1) {
      if (channelName.trim()) {
        setStep(2)
        // Generate private link if not already generated
        if (!privateLink) {
          setPrivateLink(generatePrivateLink())
        }
      }
    } else if (step === 2) {
      if (channelType) {
        setStep(3)
      }
    }
  }

  const handleCreate = () => {
    if (channelName.trim() && channelType) {
      const link = channelType === "public" 
        ? `https://t.me/${publicLink}` 
        : privateLink
      
      onCreateChannel(
        channelName,
        channelAvatar,
        description,
        channelType === "public",
        link,
        Array.from(selectedMembers)
      )
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    setChannelName("")
    setChannelAvatar(undefined)
    setDescription("")
    setChannelType(null)
    setPublicLink("")
    setPrivateLink("")
    setSelectedMembers(new Set())
    setSearchQuery("")
    setLinkCopied(false)
    onClose()
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleAvatarClick = () => {
    const url = prompt("Enter image URL (or leave empty for default):")
    if (url !== null) {
      setChannelAvatar(url || undefined)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(privateLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const canProceedStep1 = channelName.trim().length > 0
  const canProceedStep2 = channelType !== null
  const canProceedStep3 = selectedMembers.size > 0

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
          <h2 className="text-lg font-semibold">
            {step === 1 && "New Channel"}
            {step === 2 && "Channel Type"}
            {step === 3 && "Add Members"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Channel Details */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <div className="flex flex-col items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar 
                    name={channelName || "Channel"} 
                    src={channelAvatar}
                    size="xl" 
                  />
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
                    aria-label="Change channel picture"
                  >
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>

                {/* Channel Name Input */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Channel Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Channel name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>

                {/* Description Input */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Channel description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
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
                onClick={handleNext}
                disabled={!canProceedStep1}
                className={cn(
                  "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  !canProceedStep1 && "opacity-50 cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Channel Type Selection */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <div className="flex flex-col gap-4">
                {/* Public Channel Option */}
                <button
                  onClick={() => setChannelType("public")}
                  className={cn(
                    "p-4 border-2 rounded-xl text-left transition-all",
                    channelType === "public"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      channelType === "public" 
                        ? "border-primary bg-primary" 
                        : "border-border"
                    )}>
                      {channelType === "public" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">Public Channel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anyone can find your channel by searching for it
                  </p>
                  {channelType === "public" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Channel Link
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">t.me/</span>
                        <input
                          type="text"
                          placeholder="channelname"
                          value={publicLink}
                          onChange={(e) => setPublicLink(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                          className="flex-1 px-3 py-2 bg-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </button>

                {/* Private Channel Option */}
                <button
                  onClick={() => setChannelType("private")}
                  className={cn(
                    "p-4 border-2 rounded-xl text-left transition-all",
                    channelType === "private"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      channelType === "private" 
                        ? "border-primary bg-primary" 
                        : "border-border"
                    )}>
                      {channelType === "private" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">Private Channel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Only people with the invite link can join your channel
                  </p>
                  {channelType === "private" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Invite Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={privateLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-input rounded-lg text-sm text-foreground cursor-text"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyLink()
                          }}
                          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          aria-label="Copy link"
                        >
                          {linkCopied ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {linkCopied && (
                        <p className="text-xs text-primary mt-1">Link copied!</p>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 p-4 border-t border-border">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceedStep2}
                className={cn(
                  "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  !canProceedStep2 && "opacity-50 cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Add Members */}
        {step === 3 && (
          <>
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filteredContacts.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground px-4 py-2">Contacts</p>
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedMembers.has(contact.id)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => toggleMember(contact.id)}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
                      >
                        <Avatar 
                          name={contact.name} 
                          online={contact.online} 
                          size="md" 
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.online ? "online" : "offline"}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        {!isSelected && (
                          <div className="h-6 w-6 rounded-full border-2 border-border" />
                        )}
                      </button>
                    )
                  })}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">No contacts found</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 p-4 border-t border-border">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canProceedStep3}
                className={cn(
                  "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  !canProceedStep3 && "opacity-50 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
