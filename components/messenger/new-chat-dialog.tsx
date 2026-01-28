"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Search, UserPlus, Users } from "lucide-react"
import { Avatar } from "./avatar"
import type { User } from "@/lib/types"

interface NewChatDialogProps {
  isOpen: boolean
  onClose: () => void
  contacts: User[]
  onSelectContact: (userId: string) => void
  onCreateGroup?: () => void
}

export function NewChatDialog({
  isOpen,
  onClose,
  contacts,
  onSelectContact,
  onCreateGroup,
}: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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

        {/* Actions */}
        <div className="border-b border-border">
          <button
            onClick={onCreateGroup}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            <div className="p-2 bg-primary rounded-full">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-medium">New Group</span>
          </button>
          <button
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            <div className="p-2 bg-primary rounded-full">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-medium">New Contact</span>
          </button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredContacts.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground px-4 py-2">Contacts</p>
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelectContact(contact.id)
                    onClose()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
                >
                  <Avatar name={contact.name} online={contact.online} size="md" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.online ? "online" : "offline"}
                    </p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
