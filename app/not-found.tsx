"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">

        <div className="mx-auto h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-5">
          <AlertTriangle className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground">
          Page Not Found
        </h1>

        <p className="text-sm text-muted-foreground mt-3">
          The page you are looking for does not exist.
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 rounded-full bg-primary text-primary-foreground"
        >
          Go Home
        </button>

      </div>
    </div>
  )
}