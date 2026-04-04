"use client"

import { cn } from "@/lib/utils"

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}

export function AuthShell({ title, subtitle, children, className, footer }: AuthShellProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background px-6", className)}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  )
}
