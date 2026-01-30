"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Trash2, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from "lucide-react"
import { Avatar } from "./avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"

export interface Call {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  direction: "incoming" | "outgoing"
  status: "answered" | "missed" | "declined" | "canceled"
  timestamp: Date
}

interface CallsModalProps {
  isOpen: boolean
  onClose: () => void
  calls: Call[]
  contacts: User[]
  onStartNewCall?: () => void
  onCallContact?: (userId: string) => void
}

function formatCallTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  
  // Format as date if older than a week
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function getCallIcon(direction: "incoming" | "outgoing", status: string) {
  if (status === "missed" || status === "declined") {
    return PhoneMissed
  }
  if (status === "canceled") {
    return PhoneOff
  }
  return direction === "incoming" ? PhoneIncoming : PhoneOutgoing
}

function getCallStatusColor(status: string): string {
  switch (status) {
    case "answered":
      return "text-green-500"
    case "missed":
    case "declined":
      return "text-red-500"
    case "canceled":
      return "text-muted-foreground"
    default:
      return "text-muted-foreground"
  }
}

export function CallsModal({
  isOpen,
  onClose,
  calls,
  contacts,
  onStartNewCall,
  onCallContact,
}: CallsModalProps) {
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const toggleCallSelection = (callId: string) => {
    setSelectedCalls((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(callId)) {
        newSet.delete(callId)
      } else {
        newSet.add(callId)
      }
      return newSet
    })
  }

  const handleDeleteAll = () => {
    // In a real app, this would delete all calls
    console.log("Delete all calls")
    setSelectedCalls(new Set())
  }

  const handleDeleteSelected = () => {
    // In a real app, this would delete selected calls
    console.log("Delete selected calls:", Array.from(selectedCalls))
    setSelectedCalls(new Set())
  }

  const sortedCalls = [...calls].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  const displayCalls = sortedCalls.slice(0, 200) // Limit to 200 entries

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
          <h2 className="text-lg font-semibold">Calls</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  aria-label="Delete options"
                >
                  <Trash2 className="h-5 w-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDeleteAll}>
                  Delete All
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteSelected}
                  disabled={selectedCalls.size === 0}
                >
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Start New Call Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={onStartNewCall}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="h-5 w-5" />
            <span>Start New Call</span>
          </button>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {displayCalls.length > 0 ? (
            <div className="divide-y divide-border">
              {displayCalls.map((call) => {
                const CallIcon = getCallIcon(call.direction, call.status)
                const contact = contacts.find((c) => c.id === call.userId)
                const isSelected = selectedCalls.has(call.id)

                return (
                  <div
                    key={call.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => toggleCallSelection(call.id)}
                  >
                    <Avatar
                      name={call.userName}
                      src={call.userAvatar || contact?.avatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CallIcon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            getCallStatusColor(call.status)
                          )}
                        />
                        <p className="font-medium text-foreground truncate">
                          {call.userName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground capitalize">
                          {call.direction}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className={cn("capitalize", getCallStatusColor(call.status))}>
                          {call.status}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {formatCallTime(call.timestamp)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCallContact?.(call.userId)
                      }}
                      className="p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
                      aria-label="Call again"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Phone className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No calls yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
