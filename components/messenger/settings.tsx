"use client"

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
  Bell,
  Lock,
  MessageSquare,
  Folder,
  Monitor,
  Globe,
  HelpCircle,
  QrCode,
  Search,
  MoreVertical,
  Camera,
  CloudDownload,
  Zap,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Edit,
  Palette,
  LogOut
} from "lucide-react"

// Import framer-motion for animations
import { AnimatePresence, motion } from "framer-motion";
// Import useRef and useState
import { useState, useEffect, useRef } from "react";

interface SettingsProps {
  onBack: () => void
  className?: string
}


const helpItems = [
  { icon: MessageCircle, label: "Ask a Question" },
  { icon: HelpCircle, label: "Telegram FAQ" },
  { icon: ShieldCheck, label: "Privacy Policy" },
]

export function Settings({ onBack, className }: SettingsProps) {
  // === STATE HOOKS FOR ACCOUNT SECTION ===
  // State for Phone and OTP
  const [phone, setPhone] = useState("09019903510"); // Example phone number
  const [phoneModal, setPhoneModal] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  
  // State for Username
  const [username, setUsername] = useState("H0lwin_P");
  const [tempUsername, setTempUsername] = useState("");
  const [usernameModal, setUsernameModal] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // State for Bio
  const [bio, setBio] = useState("Anything whose price is the loss of your peace is very expensive.");
  const [tempBio, setTempBio] = useState("");
  const [bioModal, setBioModal] = useState(false);

  // Timer logic for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval!);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpStep, timer]);

  // === NEW STATE HOOKS FOR PROFILE SECTION ===
  // Use useRef for file input element
  const fileRef = useRef<HTMLInputElement>(null); 
  // State to hold the avatar image URL or data URL
  const [avatar, setAvatar] = useState<string | null>(null); 
  // Current display name
  const [displayName, setDisplayName] = useState("H0lwin"); 
  // Temporary state for editing display name
  const [tempName, setTempName] = useState(""); 
  // Control visibility of the display name edit modal
  const [openNameModal, setOpenNameModal] = useState(false); 

  // === NEW FUNCTION FOR PROFILE SECTION ===
  // Handles the file upload process
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the first file from the input's files list
    const file = e.target.files?.[0]; 
    if (!file) return; // Exit if no file is selected

    // Create a new FileReader instance
    const reader = new FileReader();
    // Set up the onload event handler
    reader.onload = (event: ProgressEvent<FileReader>) => {
      // Update the avatar state with the result (data URL)
      // Ensure event.target and event.target.result are not null
      if (event.target?.result) {
        setAvatar(event.target.result as string); 
      }
    };
    // Read the file as a Data URL
    reader.readAsDataURL(file); 
  };

  // --- Handles opening the file input when the avatar or camera icon is clicked ---
  const openFileDialog = () => {
    // Check if fileRef.current exists before calling click()
    fileRef.current?.click(); 
  };

  // === END OF PROFILE SECTION HOOKS AND FUNCTIONS ===

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header - MODIFIED FOR DISABLED ICONS AND ACTIVE LOGOUT */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        
        {/* MODIFIED RIGHT SIDE OF HEADER */}
        <div className="flex items-center gap-3">
          
          {/* WRAPPER FOR DISABLED BUTTONS */}
          <div className="relative flex items-center gap-3">
            
            {/* QR - DISABLED */}
            <button
              disabled
              className="p-2 rounded-full bg-accent/40 blur-[1px] opacity-60 pointer-events-none"
              aria-label="QR Code"
            >
              <QrCode className="h-5 w-5 text-foreground" />
            </button>

            {/* SEARCH - DISABLED */}
            <button
              disabled
              className="p-2 rounded-full bg-accent/40 blur-[1px] opacity-60 pointer-events-none"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* MORE (General Options) - DISABLED */}
            {/* <button
              disabled
              className="p-2 rounded-full bg-accent/40 blur-[1px] opacity-60 pointer-events-none"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5 text-foreground" />
            </button> */}

            {/* OVERLAY WITH ZAP ICON */}
            {/* OVERLAY WITH ZAP ICON - MODIFIED FOR MARGIN ADJUSTMENT */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none ml-[-150px] ml-1 sm:ml-[-160px] md:ml-[-170px]">
              <div className="bg-background/40 backdrop-blur-md rounded-full p-2">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* LOGOUT DROPDOWN (ACTIVE) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="Settings Menu" // Changed label for clarity
              >
                <MoreVertical className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Info</span>
              </DropdownMenuItem> */}
{/* 
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openFileDialog(); }}>
                <Camera className="mr-2 h-4 w-4" />
                <span>Set Profile Photo</span>
              </DropdownMenuItem> */}

              {/* <DropdownMenuItem>
                <Palette className="mr-2 h-4 w-4" />
                <span>Change Profile color</span>
              </DropdownMenuItem> */}

              {/* <DropdownMenuSeparator /> */}

              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Section - UPDATED FOR IMAGE UPLOAD AND NAME EDIT */}
        <div className="flex flex-col items-center py-6 px-4 bg-card">
          <div className="relative">
            {/* AVATAR (clickable) */}
            <div
              onClick={openFileDialog} // Use the new helper function
              className="cursor-pointer"
            >
              {avatar ? (
                <img
                  src={avatar}
                  className="w-20 h-20 rounded-full object-cover"
                  alt="Profile Avatar"
                />
              ) : (
                <Avatar name={displayName} size="xl" />
              )}
            </div>

            {/* CAMERA BUTTON */}
            <button
              onClick={openFileDialog} // Use the new helper function
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
            </button>

            {/* HIDDEN INPUT */}
            <input
              type="file"
              ref={fileRef} // Assign the ref here
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/*" // Allow only image files
            />
          </div>

          {/* DISPLAY NAME (clickable) */}
          <h2
            onClick={() => {
              setTempName(displayName) // Set current display name to temp state
              setOpenNameModal(true)  // Open the modal
            }}
            className="text-xl font-semibold text-foreground mt-4 cursor-pointer hover:opacity-80 transition"
          >
            {displayName}
          </h2>

          <p className="text-sm text-muted-foreground mt-1">online</p>
        </div>

        {/* Account Section - ORIGINAL */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Account</h3>
          <div className="divide-y divide-border">
            {/* PHONE */}
            <button
              onClick={() => setPhoneModal(true)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors"
            >
              <p className="text-foreground">{phone}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tap to change phone number</p>
            </button>

            {/* USERNAME */}
            <button
              onClick={() => {
                setTempUsername(username); // Copy current username to temp state for editing
                setUsernameModal(true);
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors"
            >
              <p className="text-foreground">@{username}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Username</p>
            </button>

            {/* BIO */}
            <button
              onClick={() => {
                setTempBio(bio); // Copy current bio to temp state for editing
                setBioModal(true);
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors"
            >
              <p className="text-foreground line-clamp-2">{bio}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Bio</p>
            </button>
          </div>
        </div>

        {/* Settings Items - ORIGINAL (includes Coming Soon Section) */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Settings</h3>
          
          {/* Coming Soon Section */}
          <div className="bg-card mt-2">
            <div className="px-6 py-10 flex flex-col items-center text-center">
              
              {/* Icon */}
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground">
                Coming Soon
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                This section is currently under active development.  
                New features are being crafted to enhance your experience.
              </p>

              {/* Badge */}
              <div className="mt-4 px-3 py-1 rounded-full bg-accent text-xs text-muted-foreground">
                In Development
              </div>

            </div>
          </div>
        </div>

        {/* Help Section - ORIGINAL */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Help</h3>
          <div className="divide-y divide-border">
            {helpItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5 text-foreground flex-shrink-0" />
                <span className="flex-1 text-foreground text-left">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer - ORIGINAL */}
        <div className="py-6 text-center space-y-1">

          <p className="text-xs text-muted-foreground">
            Telegram for Android
          </p>
          <p className="text-xs text-muted-foreground">
            v12.3.1 (6385) store bundled arm64-v8a
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Developed with 💖 by{" "}
            <a
              href="https://t.me/H0lwin_P"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition"
            >
              H0lwin
            </a>{" "}
            &{" "}
            <a
              href="https://t.me/َAnes_py"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition"
            >
              Anes
            </a>
          </p>

        </div>
      </div>

      {/* === MODALS === */}

      {/* PHONE + OTP MODAL - ORIGINAL */}
      <AnimatePresence>
        {phoneModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setPhoneModal(false);
              setOtpStep(false); // Reset OTP step when closing
              setOtp(""); // Clear OTP input
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-card w-full max-w-sm p-4 rounded-xl space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {!otpStep ? (
                <>
                  <p className="font-medium text-foreground">Enter Phone Number</p>
                  <input
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                      // Basic validation for Iranian phone numbers starting with 09
                      if (val.startsWith("09")) {
                        setPhone(val.slice(0, 11)); // Limit to 11 digits
                      } else if (val.length === 11 && val.startsWith("9")) {
                        // If user types 9 directly, prepend 0
                        setPhone("0" + val);
                      } else if (val.length <= 11) {
                        setPhone(val);
                      }
                    }}
                    placeholder="09xxxxxxxxx"
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    type="tel"
                  />
                  <button
                    onClick={() => {
                      // Validate phone number before proceeding
                      if (phone.length === 11 && phone.startsWith("09")) {
                        setOtpStep(true);
                        setTimer(60); // Reset timer
                        setOtp(""); // Clear any previous OTP
                        // TODO: Add actual OTP sending logic here
                      }
                    }}
                    disabled={!(phone.length === 11 && phone.startsWith("09"))}
                    className={cn(
                      "w-full py-2 rounded-lg font-medium transition-colors",
                      (phone.length === 11 && phone.startsWith("09"))
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    Send Code
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">Enter OTP</p>
                  <input
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                      setOtp(val);
                    }}
                    className="w-full text-center text-lg tracking-widest p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="------"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {timer > 0 ? `Resend in ${timer}s` : "Didn't receive the code?"}
                  </div>
                  <button
                    onClick={() => {
                      if (otp.length === 6) {
                        // TODO: Add actual OTP verification logic here
                        console.log("Verifying OTP:", otp);
                        setPhoneModal(false);
                        setOtpStep(false); // Reset OTP step
                        setOtp(""); // Clear OTP input
                      }
                    }}
                    disabled={otp.length !== 6}
                    className={cn(
                      "w-full py-2 rounded-lg font-medium transition-colors",
                      otp.length === 6
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    Verify
                  </button>
                  {timer <= 0 && (
                    <button
                      onClick={() => {
                        setTimer(60); // Reset timer
                        setOtp(""); // Clear OTP input on resend
                        // TODO: Add resend OTP logic here
                        console.log("Resending OTP...");
                      }}
                      className="text-sm text-primary text-center w-full"
                    >
                      Resend Code
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* USERNAME MODAL - ORIGINAL */}
      <AnimatePresence>
        {usernameModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setUsernameModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-card w-full max-w-sm p-4 rounded-xl space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="font-medium text-foreground">Edit Username</p>
              <input
                value={tempUsername}
                onChange={(e) => {
                  // Allow alphanumeric characters and underscore, cannot start with number or underscore
                  const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                  setTempUsername(val);

                  // Basic validation
                  if (val.length > 0 && !/^[a-zA-Z]/.test(val)) {
                    setUsernameError("Username must start with a letter.");
                  } else if (val.length > 0 && val.length < 4) {
                    setUsernameError("Username must be at least 4 characters long.");
                  } else if (val.length > 25) {
                    setUsernameError("Username cannot exceed 25 characters.");
                  } else {
                    setUsernameError(""); // Clear error if valid
                  }
                }}
                placeholder="Enter your username"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {usernameError && <p className="text-red-500 text-xs">{usernameError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setUsernameModal(false)}
                  className="w-full py-2 rounded-lg font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Final check before saving
                    if (!usernameError && tempUsername.length >= 4) {
                      setUsername(tempUsername); // Save the new username
                      setUsernameModal(false);
                      // TODO: Add API call to save username on backend
                    }
                  }}
                  disabled={!!usernameError || tempUsername.length < 4}
                  className={cn(
                    "w-full py-2 rounded-lg font-medium transition-colors",
                    (!usernameError && tempUsername.length >= 4)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  )}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BIO MODAL - ORIGINAL */}
      <AnimatePresence>
        {bioModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setBioModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-card w-full max-w-sm p-4 rounded-xl space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="font-medium text-foreground">Edit Bio</p>
              <textarea
                value={tempBio}
                onChange={(e) => {
                  setTempBio(e.target.value);
                }}
                placeholder="Tell us something about yourself"
                rows={4}
                maxLength={100}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="text-right text-xs text-muted-foreground">
                {tempBio.length}/100
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBioModal(false)}
                  className="w-full py-2 rounded-lg font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setBio(tempBio); // Save the new bio
                    setBioModal(false);
                    // TODO: Add API call to save bio on backend
                  }}
                  className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === NEW MODAL FOR DISPLAY NAME EDIT === */}
      <AnimatePresence>
        {openNameModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setOpenNameModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-card w-full max-w-sm p-4 rounded-xl space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="font-medium text-foreground">Edit Display Name</p>
              <input
                value={tempName}
                onChange={(e) => {
                  // Basic validation for display name (allow most characters, limit length)
                  const val = e.target.value;
                  setTempName(val);
                  // You can add more specific validation here if needed
                  if (val.length > 30) { // Example: Max 30 characters
                     // Optionally set an error state here
                  }
                }}
                placeholder="Enter your display name"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setOpenNameModal(false)}
                  className="w-full py-2 rounded-lg font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDisplayName(tempName); // Save the new display name
                    setOpenNameModal(false);
                    // TODO: Add API call to save display name on backend
                  }}
                  className="w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}