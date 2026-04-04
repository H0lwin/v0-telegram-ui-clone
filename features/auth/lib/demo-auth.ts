export const OTP_STORAGE_KEY = "tg_demo_otp"
export const USERS_STORAGE_KEY = "tg_demo_users"
export const SESSION_STORAGE_KEY = "tg_demo_session"

export type OtpPayload = {
  phone: string
  code: string
  expiresAt: number
}

export type AuthUser = {
  phone: string
  username: string
  displayName: string
}

export function normalizeIranPhone(value: string): string {
  let normalized = value.replace(/\D/g, "")
  if (normalized.length > 11) normalized = normalized.slice(0, 11)
  return normalized
}

export function isValidIranPhone(phone: string): boolean {
  return phone.length === 11 && phone.startsWith("09")
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function requestOtp(phone: string): string {
  const code = generateOtpCode()
  const payload: OtpPayload = {
    phone,
    code,
    expiresAt: Date.now() + 2 * 60 * 1000,
  }
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(payload))
  return code
}

export function readStoredOtp(): OtpPayload | null {
  const raw = localStorage.getItem(OTP_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OtpPayload
  } catch {
    return null
  }
}

export function validateOtp(phone: string, code: string): { ok: true } | { ok: false; error: string } {
  const payload = readStoredOtp()
  if (!payload) {
    return { ok: false, error: "No verification code was requested." }
  }
  if (payload.phone !== phone) {
    return { ok: false, error: "This code is for a different phone number." }
  }
  if (Date.now() > payload.expiresAt) {
    return { ok: false, error: "Code expired. Request a new code." }
  }
  if (payload.code !== code) {
    return { ok: false, error: "Incorrect code." }
  }
  return { ok: true }
}

export function saveSession(payload: Record<string, unknown>) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      ...payload,
      loggedInAt: Date.now(),
    })
  )
}

export function upsertDemoUser(user: AuthUser) {
  const raw = localStorage.getItem(USERS_STORAGE_KEY)
  const users = raw ? (JSON.parse(raw) as AuthUser[]) : []
  const nextUsers = [...users.filter((item) => item.phone !== user.phone), user]
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers))
}
