"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Chat, Message, User } from "@/lib/types"
import { mockChats, mockMessages, currentUser, mockUsers } from "@/lib/mock-data"
import { ChatList } from "./chat-list"
import { ChatView } from "./chat-view"
import { EmptyState } from "./empty-state"
import { SidebarMenu } from "./sidebar-menu"
import { Settings } from "./settings"
import { Contacts } from "./contacts"
import { ContactsModal } from "./contacts-modal"
import { AddContactModal } from "./add-contact-modal"
import { CallsModal, type Call } from "./calls-modal"
import { Profile } from "./profile"
import { NewChatDialog } from "./new-chat-dialog"
import { NewGroupDialog } from "./new-group-dialog"
import { NewChannelDialog } from "./new-channel-dialog"
import { DeleteChatModal } from "./delete-chat-modal"
import { ForwardMessageDialog } from "./forward-message-dialog"

type Screen = "chats" | "settings" | "contacts" | "profile"

// Mock calls data
const mockCalls: Call[] = [
  {
    id: "call-1",
    userId: "user-2",
    userName: "Sarah Chen",
    direction: "incoming",
    status: "answered",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "call-2",
    userId: "user-3",
    userName: "Alex Johnson",
    direction: "outgoing",
    status: "missed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "call-3",
    userId: "user-5",
    userName: "Mike Wilson",
    direction: "incoming",
    status: "declined",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "call-4",
    userId: "user-6",
    userName: "Emma Davis",
    direction: "outgoing",
    status: "answered",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "call-5",
    userId: "user-8",
    userName: "John Smith",
    direction: "incoming",
    status: "missed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
]

// Saved Messages chat ID - system chat that always exists
const SAVED_MESSAGES_CHAT_ID = "saved-messages"

// Create Saved Messages chat
const savedMessagesChat: Chat = {
  id: SAVED_MESSAGES_CHAT_ID,
  type: "private",
  name: "Saved Messages",
  participants: [currentUser],
  unreadCount: 0,
  pinned: true,
}

// Ensure Saved Messages is always in the chat list and at the top
const ensureSavedMessages = (chatList: Chat[]): Chat[] => {
  // Remove any existing Saved Messages (in case it's in wrong position)
  const otherChats = chatList.filter((chat) => chat.id !== SAVED_MESSAGES_CHAT_ID)
  // Always place Saved Messages at the top
  return [savedMessagesChat, ...otherChats]
}

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
  const [chats, setChatsState] = useState<Chat[]>(ensureSavedMessages(mockChats))
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    ...mockMessages,
    [SAVED_MESSAGES_CHAT_ID]: mockMessages[SAVED_MESSAGES_CHAT_ID] || [],
  })
  const [activeChat, setActiveChat] = useState<string | undefined>()
  const [showMenu, setShowMenu] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showCallsModal, setShowCallsModal] = useState(false)
  const [calls] = useState<Call[]>(mockCalls)
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [messagesToForward, setMessagesToForward] = useState<Message[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, string[]>>({})
  const [darkMode, setDarkMode] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<Screen>("chats")
  const [isMobile, setIsMobile] = useState(false)

  // Wrapper to ensure Saved Messages is never removed
  const setChats = (updater: Chat[] | ((prev: Chat[]) => Chat[])) => {
    setChatsState((prev) => {
      const newChats = typeof updater === "function" ? updater(prev) : updater
      return ensureSavedMessages(newChats)
    })
  }

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

  const handleSendMessage = useCallback((content: string, replyTo?: { messageId: string; content: string; senderName: string }, editingMessageId?: string) => {
    if (!activeChat) return

    // If editing, update existing message
    if (editingMessageId) {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === editingMessageId
            ? { ...msg, content, edited: true, editTimestamp: new Date() }
            : msg
        ),
      }))
      return
    }

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

    // Remove from pinned messages if it was pinned
    setPinnedMessages((prev) => {
      const pinned = prev[activeChat] || []
      return {
        ...prev,
        [activeChat]: pinned.filter((id) => id !== messageId),
      }
    })
  }, [activeChat])

  const handlePinMessage = useCallback((messageId: string) => {
    if (!activeChat) return

    setPinnedMessages((prev) => {
      const pinned = prev[activeChat] || []
      const isPinned = pinned.includes(messageId)
      return {
        ...prev,
        [activeChat]: isPinned
          ? pinned.filter((id) => id !== messageId)
          : [...pinned, messageId],
      }
    })

    // Update message pinned status
    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].map((msg) =>
        msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
      ),
    }))
  }, [activeChat])

  const handleForwardMessage = useCallback((message: Message) => {
    setMessagesToForward([message])
    setShowForwardDialog(true)
  }, [])

  const handleForwardMessages = useCallback((chatIds: string[], messages: Message[]) => {
    chatIds.forEach((chatId) => {
      const forwardedMessages: Message[] = messages.map((msg) => ({
        ...msg,
        id: `msg-${Date.now()}-${Math.random()}`,
        chatId,
        timestamp: new Date(),
        status: "sent" as const,
      }))

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), ...forwardedMessages],
      }))

      // Update chat's last message
      const lastForwarded = forwardedMessages[forwardedMessages.length - 1]
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, lastMessage: lastForwarded } : chat
        )
      )
    })
  }, [])

  const handleMenuNavigate = (screen: string) => {
    if (screen === "settings") {
      setCurrentScreen("settings")
    } else if (screen === "contacts") {
      setShowContactsModal(true)
    } else if (screen === "calls") {
      setShowCallsModal(true)
    } else if (screen === "profile") {
      setCurrentScreen("profile")
    } else if (screen === "saved") {
      // Open Saved Messages chat
      setActiveChat(SAVED_MESSAGES_CHAT_ID)
      setCurrentScreen("chats")
    } else if (screen === "new-group") {
      setShowNewGroup(true)
    } else if (screen === "new-channel") {
      setShowNewChannel(true)
    }
    setShowMenu(false)
  }

  const handleAddContact = (firstName: string, lastName: string, countryCode: string, phoneNumber: string) => {
    // Create a new contact (frontend only for now)
    const fullName = lastName.trim() ? `${firstName} ${lastName}` : firstName
    const newContact: User = {
      id: `user-${Date.now()}`,
      name: fullName,
      online: false,
    }
    
    // In a real app, this would be saved to a backend
    // For now, we'll just log it
    console.log("New contact added:", {
      name: fullName,
      phone: `+${countryCode}${phoneNumber}`,
    })
    
    // You could add it to mockUsers if needed for demo purposes
    // mockUsers.push(newContact)
  }

  const handleCreateGroup = (name: string, avatar: string | undefined, memberIds: string[]) => {
    // Get selected members
    const selectedMembers = mockUsers.filter((user) => memberIds.includes(user.id))
    
    // Create new group chat
    const newGroup: Chat = {
      id: `chat-${Date.now()}`,
      type: "group",
      name: name,
      avatar: avatar,
      participants: [currentUser, ...selectedMembers],
      unreadCount: 0,
    }

    // Add to chats list
    setChats((prev) => [newGroup, ...prev])
    
    // Initialize empty messages for the group
    setMessages((prev) => ({
      ...prev,
      [newGroup.id]: [],
    }))

    // Optionally select the new group
    setActiveChat(newGroup.id)
    setCurrentScreen("chats")
  }

  const handleCreateChannel = (name: string, avatar: string | undefined, description: string, isPublic: boolean, link: string, memberIds: string[]) => {
    // Get selected members
    const selectedMembers = mockUsers.filter((user) => memberIds.includes(user.id))
    
    // Create new channel chat
    const newChannel: Chat = {
      id: `chat-${Date.now()}`,
      type: "channel",
      name: name,
      avatar: avatar,
      participants: [currentUser, ...selectedMembers],
      unreadCount: 0,
    }

    // Add to chats list
    setChats((prev) => [newChannel, ...prev])
    
    // Initialize empty messages for the channel
    setMessages((prev) => ({
      ...prev,
      [newChannel.id]: [],
    }))

    // Optionally select the new channel
    setActiveChat(newChannel.id)
    setCurrentScreen("chats")
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

  // Profile screen
  if (currentScreen === "profile") {
    return (
      <div className="h-screen w-full bg-background">
        <Profile onBack={() => setCurrentScreen("chats")} />
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

      {/* New Group Dialog */}
      <NewGroupDialog
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        contacts={mockUsers}
        onCreateGroup={handleCreateGroup}
      />

      {/* New Channel Dialog */}
      <NewChannelDialog
        isOpen={showNewChannel}
        onClose={() => setShowNewChannel(false)}
        contacts={mockUsers}
        onCreateChannel={handleCreateChannel}
      />

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        contacts={mockUsers}
        onSelectContact={handleSelectContact}
        onAddContact={() => {
          setShowContactsModal(false)
          setShowAddContactModal(true)
        }}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onSave={handleAddContact}
      />

      {/* Calls Modal */}
      <CallsModal
        isOpen={showCallsModal}
        onClose={() => setShowCallsModal(false)}
        calls={calls}
        contacts={mockUsers}
        onStartNewCall={() => {
          setShowCallsModal(false)
          // In a real app, this would open a call interface
          console.log("Start new call")
        }}
        onCallContact={(userId) => {
          // In a real app, this would initiate a call
          console.log("Call contact:", userId)
        }}
      />

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={showDeleteChatModal}
        chat={chatToDelete}
        onClose={() => {
          setShowDeleteChatModal(false)
          setChatToDelete(null)
        }}
        onConfirm={(deleteForBoth) => {
          if (chatToDelete) {
            // Remove chat from list (but preserve Saved Messages)
            setChats((prev) => prev.filter((chat) => chat.id !== chatToDelete.id && chat.id !== SAVED_MESSAGES_CHAT_ID))
            // Clear messages
            setMessages((prev) => {
              const newMessages = { ...prev }
              delete newMessages[chatToDelete.id]
              return newMessages
            })
            // Close chat if it was active
            if (activeChat === chatToDelete.id) {
              setActiveChat(undefined)
            }
          }
          setShowDeleteChatModal(false)
          setChatToDelete(null)
        }}
      />

      {/* Forward Message Dialog */}
      <ForwardMessageDialog
        isOpen={showForwardDialog}
        messages={messagesToForward}
        chats={chats.filter((chat) => chat.id !== activeChat && chat.id !== SAVED_MESSAGES_CHAT_ID)}
        currentUserId={currentUser.id}
        onClose={() => {
          setShowForwardDialog(false)
          setMessagesToForward([])
        }}
        onForward={handleForwardMessages}
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
          onOpenInNewWindow={(chatId) => {
            console.log("Open in new window:", chatId)
          }}
          onArchive={(chatId) => {
            console.log("Archive chat:", chatId)
          }}
          onPin={(chatId) => {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
              )
            )
          }}
          onMute={(chatId, duration) => {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === chatId ? { ...chat, muted: true } : chat
              )
            )
            console.log("Mute chat:", chatId, duration)
          }}
          onMarkAsRead={(chatId) => {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
              )
            )
          }}
          onBlockUser={(chatId) => {
            console.log("Block user:", chatId)
          }}
          onClearHistory={(chatId) => {
            setMessages((prev) => {
              const newMessages = { ...prev }
              delete newMessages[chatId]
              return newMessages
            })
          }}
          onDelete={(chatId) => {
            const chat = chats.find((c) => c.id === chatId)
            if (chat && chat.id !== SAVED_MESSAGES_CHAT_ID) {
              setChatToDelete(chat)
              setShowDeleteChatModal(true)
            }
          }}
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
            onPinMessage={handlePinMessage}
            onForwardMessage={handleForwardMessage}
            className="w-full"
          />
        ) : (
          <EmptyState className="w-full hidden lg:flex" />
        )}
      </div>
    </div>
  )
}
