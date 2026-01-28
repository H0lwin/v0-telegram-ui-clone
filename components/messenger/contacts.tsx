"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, Search, UserPlus, X } from "lucide-react"
import { Avatar } from "./avatar"
import type { User } from "@/lib/types"

interface ContactsProps {
  contacts: User[]
  onBack: () => void
  onSelectContact: (userId: string) => void
}

export function Contacts({ contacts, onBack, onSelectContact }: ContactsProps) {
  const [searchQuery, setSearchQuery] = useState("")

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
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">Contacts</h1>
        <button className="p-2 rounded-full hover:bg-accent transition-colors">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
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
            className="w-full pl-9 pr-9 py-2.5 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sortedLetters.map((letter) => (
          <div key={letter}>
            <div className="sticky top-0 bg-muted px-4 py-1.5">
              <span className="text-sm font-medium text-primary">{letter}</span>
            </div>
            {groupedContacts[letter].map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
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
        ))}

        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  )
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
