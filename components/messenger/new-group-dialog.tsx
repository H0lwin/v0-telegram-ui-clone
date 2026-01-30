"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Search, Camera, Check } from "lucide-react"
import { Avatar } from "./avatar"
import type { User } from "@/lib/types"

interface NewGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  contacts: User[]
  onCreateGroup: (name: string, avatar: string | undefined, memberIds: string[]) => void
}

export function NewGroupDialog({
  isOpen,
  onClose,
  contacts,
  onCreateGroup,
}: NewGroupDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [groupName, setGroupName] = useState("")
  const [groupAvatar, setGroupAvatar] = useState<string | undefined>(undefined)
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNext = () => {
    if (groupName.trim()) {
      setStep(2)
    }
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.size > 0) {
      onCreateGroup(groupName, groupAvatar, Array.from(selectedMembers))
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    setGroupName("")
    setGroupAvatar(undefined)
    setSelectedMembers(new Set())
    setSearchQuery("")
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
    // For now, we'll just use a placeholder or let the user input a URL
    // In a real app, this would open a file picker
    const url = prompt("Enter image URL (or leave empty for default):")
    if (url !== null) {
      setGroupAvatar(url || undefined)
    }
  }

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
            {step === 1 ? "New Group" : "Add Members"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Group Name and Avatar */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar 
                    name={groupName || "Group"} 
                    src={groupAvatar}
                    size="xl" 
                  />
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
                    aria-label="Change group picture"
                  >
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>

                {/* Group Name Input */}
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-3 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
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
                disabled={!groupName.trim()}
                className={cn(
                  "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  !groupName.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Add Members */}
        {step === 2 && (
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
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={selectedMembers.size === 0}
                className={cn(
                  "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
                  selectedMembers.size === 0 && "opacity-50 cursor-not-allowed"
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
