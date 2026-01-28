"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Chat, Message } from "@/lib/types"
import { mockChats, mockMessages, currentUser, mockUsers } from "@/lib/mock-data"
import { ChatList } from "./chat-list"
import { ChatView } from "./chat-view"
import { EmptyState } from "./empty-state"
import { SidebarMenu } from "./sidebar-menu"
import { Settings } from "./settings"
import { Contacts } from "./contacts"
import { NewChatDialog } from "./new-chat-dialog"

type Screen = "chats" | "settings" | "contacts"

// Simulated bot responses
const botResponses = [
  "That's interesting! Tell me more.",
  "I understand. What do you think about that?",
  "Great point! Here's my perspective...",
  "Thanks for sharing! I'll get back to you shortly.",
  "Absolutely! Let's discuss this further.",
  "I'm not sure I follow. Could you explain?",
  "That makes sense. What's next?",
  "Perfect! I'll take care of it.",
]

export function Messenger() {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages)
  const [activeChat, setActiveChat] = useState<string | undefined>()
  const [showMenu, setShowMenu] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<Screen>("chats")
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    setCurrentScreen("chats")
    
    // Mark as read
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    )
  }

  const handleBack = () => {
    setActiveChat(undefined)
  }

  const handleSendMessage = useCallback((content: string, replyTo?: { messageId: string; content: string; senderName: string }) => {
    if (!activeChat) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: activeChat,
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      status: "sending",
      type: "text",
      replyTo,
    }

    // Add message to state
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }))

    // Update chat's last message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? { ...chat, lastMessage: newMessage }
          : chat
      )
    )

    // Simulate sending
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        ),
      }))
    }, 300)

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        ),
      }))
    }, 800)

    // Simulate read receipt and bot response for private chats
    const chat = chats.find((c) => c.id === activeChat)
    if (chat?.type === "private") {
      // Show typing indicator
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat
              ? { ...c, typing: [chat.participants.find((p) => p.id !== currentUser.id)?.name || "User"] }
              : c
          )
        )
      }, 1000)

      // Send bot response
      setTimeout(() => {
        // Mark user's message as read
        setMessages((prev) => ({
          ...prev,
          [activeChat]: prev[activeChat].map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg
          ),
        }))

        // Clear typing indicator
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat ? { ...c, typing: undefined } : c
          )
        )

        // Add bot response
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          chatId: activeChat,
          senderId: chat.participants.find((p) => p.id !== currentUser.id)?.id || "bot",
          content: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date(),
          status: "read",
          type: "text",
        }

        setMessages((prev) => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), botMessage],
        }))

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat
              ? { ...c, lastMessage: botMessage }
              : c
          )
        )
      }, 2500)
    }
  }, [activeChat, chats])

  const handleReact = useCallback((messageId: string, reaction: string) => {
    if (!activeChat) return

    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions
                ? msg.reactions.includes(reaction)
                  ? msg.reactions.filter((r) => r !== reaction)
                  : [...msg.reactions, reaction]
                : [reaction],
            }
          : msg
      ),
    }))
  }, [activeChat])

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!activeChat) return

    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].filter((msg) => msg.id !== messageId),
    }))
  }, [activeChat])

  const handleMenuNavigate = (screen: string) => {
    if (screen === "settings") {
      setCurrentScreen("settings")
    } else if (screen === "contacts") {
      setCurrentScreen("contacts")
    }
    setShowMenu(false)
  }

  const handleSelectContact = (userId: string) => {
    // Find existing chat with this user or create new one
    const existingChat = chats.find(
      (chat) =>
        chat.type === "private" &&
        chat.participants.some((p) => p.id === userId)
    )

    if (existingChat) {
      handleSelectChat(existingChat.id)
    } else {
      // Create new chat
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          type: "private",
          name: user.name,
          participants: [currentUser, user],
          unreadCount: 0,
        }
        setChats((prev) => [newChat, ...prev])
        setMessages((prev) => ({
          ...prev,
          [newChat.id]: [],
        }))
        setActiveChat(newChat.id)
      }
    }
    setCurrentScreen("chats")
  }

  const selectedChat = activeChat
    ? chats.find((c) => c.id === activeChat)
    : undefined
  const chatMessages = activeChat ? messages[activeChat] || [] : []

  // Settings screen
  if (currentScreen === "settings") {
    return (
      <div className="h-screen w-full bg-background">
        <Settings onBack={() => setCurrentScreen("chats")} />
      </div>
    )
  }

  // Contacts screen
  if (currentScreen === "contacts") {
    return (
      <div className="h-screen w-full bg-background">
        <Contacts
          contacts={mockUsers}
          onBack={() => setCurrentScreen("chats")}
          onSelectContact={handleSelectContact}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={handleMenuNavigate}
      />

      {/* New Chat Dialog */}
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        contacts={mockUsers}
        onSelectContact={handleSelectContact}
      />

      {/* Chat List - Always visible on desktop, conditionally on mobile */}
      <div
        className={cn(
          "w-full lg:w-96 lg:border-r lg:border-border flex-shrink-0 h-full relative",
          isMobile && activeChat ? "hidden" : "flex"
        )}
      >
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onMenuClick={() => setShowMenu(true)}
          onNewChat={() => setShowNewChat(true)}
          className="w-full"
        />
      </div>

      {/* Chat View / Empty State */}
      <div
        className={cn(
          "flex-1 h-full min-w-0",
          isMobile && !activeChat ? "hidden" : "flex"
        )}
      >
        {selectedChat ? (
          <ChatView
            chat={selectedChat}
            messages={chatMessages}
            currentUserId={currentUser.id}
            onBack={isMobile ? handleBack : undefined}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            onDeleteMessage={handleDeleteMessage}
            className="w-full"
          />
        ) : (
          <EmptyState className="w-full hidden lg:flex" />
        )}
      </div>
    </div>
  )
}
