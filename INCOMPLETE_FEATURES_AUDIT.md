# Incomplete Buttons & Behaviors Audit

Date: 2026-04-04 (updated)
Scope: `app/*` and `components/messenger/*`

## Status Summary

Most previously reported incomplete actions are now implemented.

Implemented since last audit:
- Chat header actions (search, call/video call, mute durations, export history, clear, delete, leave/report/boost)
- Chat info actions (mute toggle, media shortcuts, leave/delete)
- New Contact actions in dialogs/contacts
- Voice message button action
- Group/Channel avatar upload via file picker (removed prompt fallback)
- Calls modal delete-all/delete-selected with real state updates
- Settings OTP send/verify/resend demo flow (removed TODO/console stubs)
- Settings help links and logout action
- Profile actions (edit info, set photo, color change, logout, add post, send gift)
- Sidebar actions (emoji status switch, account switch, add account)
- Login/Signup OTP demo verification and local session persistence
- Archive flow improved with visible `Archived` section in chat list
- Open-in-new-window supports `?chat=<id>` deep-link selection

## Remaining Non-Blocking Gaps

1. Backend integration (currently local/demo state)
- Auth, contacts, calls, chat actions are state/localStorage based.
- No server persistence, no real API contract.

2. Telegram parity edge-cases
- Archived chats are implemented as a visible section, not full Telegram archive folder behavior.
- Voice message is currently represented as a demo text message, not audio recording/upload.
- Some advanced Telegram-specific flows (wallpaper picker UI, full media browser, account sync) are simplified.

3. Accessibility/UX polish opportunities
- Additional keyboard shortcuts and focus-trap polish can be added for desktop parity.
- Mobile-specific interaction polish can be expanded (long-press/gesture parity).

## Technical Health Check

- `npm run build`: pass
- `npx tsc --noEmit`: pass
- No remaining `TODO`, `console.log`, `prompt`, or `In a real app` markers in audited scope.
