"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, Lock, Zap } from "lucide-react"

interface EmptyStateProps {
  className?: string
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full bg-background",
      className
    )}>
      <div className="max-w-sm text-center">
        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -bottom-1 right-1/3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Messenger
        </h2>
        
        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Send and receive messages without keeping your phone online. 
          Use Messenger on up to 4 linked devices at the same time.
        </p>

        {/* Security badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  )
}
