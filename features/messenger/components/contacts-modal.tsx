"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Search, UserPlus } from "lucide-react"
import { Avatar } from "./avatar"
import type { User } from "@/lib/types"

interface ContactsModalProps {
  isOpen: boolean
  onClose: () => void
  contacts: User[]
  onSelectContact: (userId: string) => void
  onAddContact: () => void
}

function formatLastSeen(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

export function ContactsModal({
  isOpen,
  onClose,
  contacts,
  onSelectContact,
  onAddContact,
}: ContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce<Record<string, User[]>>((acc, contact) => {
    const letter = contact.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(contact)
    return acc
  }, {})

  const sortedLetters = Object.keys(groupedContacts).sort()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Contacts</h2>
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

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {sortedLetters.length > 0 ? (
            sortedLetters.map((letter) => (
              <div key={letter}>
                <div className="sticky top-0 bg-muted px-4 py-1.5">
                  <span className="text-sm font-medium text-primary">{letter}</span>
                </div>
                {groupedContacts[letter].map((contact) => (
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
                        {contact.online 
                          ? "online" 
                          : contact.lastSeen 
                            ? `last seen ${formatLastSeen(contact.lastSeen)}`
                            : "offline"
                        }
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))
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
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onAddContact}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>
    </>
  )
}
