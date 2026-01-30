"use client"

import { useState } from "react"
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
  Music,
  ChevronRight,
  Grid3x3,
  Camera,
  Gift
} from "lucide-react"

interface ProfileProps {
  onBack: () => void
  className?: string
}

type Tab = "posts" | "archived" | "gifts"

export function Profile({ onBack, className }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>("posts")
  const [hasMusic, setHasMusic] = useState(true)

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
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
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Info</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="mr-2 h-4 w-4" />
                <span>Set Profile Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2 h-4 w-4" />
                <span>Change Profile color</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 px-4 bg-card">
          <Avatar name="H0lwin" size="xl" />
          <h2 className="text-xl font-semibold text-foreground mt-4">H0lwin</h2>
          <p className="text-sm text-muted-foreground mt-1">online</p>
        </div>


        {/* Info Section */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Info</h3>
          <div className="divide-y divide-border">
            <div className="px-4 py-3">
              <p className="text-foreground">+98 901 990 3510</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mobile</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-foreground">
              Anything that costs you peace of mind is very expensive.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Bio</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-foreground">@H0lwin_P</p>
                <p className="text-xs text-muted-foreground mt-0.5">Username</p>
              </div>
              <Grid3x3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content */}
        <div className="flex-1 min-h-[200px] bg-card">
          {activeTab === "posts" && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-foreground font-medium mb-2">No posts yet...</p>
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
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="px-4 py-4 bg-card border-t border-border">
        {activeTab === "posts" && (
          <button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            <Camera className="h-5 w-5" />
            <span>Add a post</span>
          </button>
        )}
        {activeTab === "gifts" && (
          <button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            <Gift className="h-5 w-5" />
            <span>Send Gifts to Friends</span>
          </button>
        )}
      </div>
    </div>
  )
}
