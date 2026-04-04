# Incomplete Buttons & Behaviors Audit

Date: 2026-04-04
Scope: `app/*` and `components/messenger/*`

## 1) Buttons/UI items without real action (no handler or no effect)

### `components/messenger/chat-header.tsx`
- `155`, `159`, `163`: top action buttons (Search / Phone / Video) have no `onClick`.
- `187-192`: mute duration items (`1 hour`, `4 hours`, ...) have no action.
- `203`: `Set wallpaper` has no action.
- `208`: `Export chat history` has no action.
- `215`: `Clear history` has no action.
- `220`: `Delete chat` has no action.
- `229`: `Boost group` has no action.
- `239`: `Select messages` has no action.
- `251`: `Leave group` has no action.
- `270`: `Boost channel` has no action.
- `282`: `Leave channel` has no action.

### `components/messenger/chat-info.tsx`
- `129`: mute/unmute row rendered but no handler passed.
- `141`, `142`, `143`: media rows (Photos & Videos / Files / Links) have no handler.
- `182`, `188`: danger actions (Leave group / Delete chat) have no handler.

### `components/messenger/contacts.tsx`
- `44`: header `UserPlus` button has no `onClick`.

### `components/messenger/new-chat-dialog.tsx`
- `85`: `New Contact` button has no `onClick`.

### `components/messenger/message-composer.tsx`
- `280`: voice message button is rendered without `onClick` (UI only).

### `components/messenger/profile.tsx`
- `49`: Edit icon button has no handler.
- `65`, `69`, `73`, `77`: dropdown actions (Edit Info / Set Profile Photo / Change Profile color / Log Out) have no handlers.
- `203`: `Add a post` button has no handler.
- `209`: `Send Gifts to Friends` button has no handler.

### `components/messenger/sidebar-menu.tsx`
- `103`: `Set Emoji Status` button has no handler.
- `123`: account-switch click area has empty handler body.
- `146`, `153`: `Add Account` action has empty handler body.

### `components/messenger/settings.tsx`
- `47-49`: help items rendered as buttons (`Ask a Question`, `Telegram FAQ`, `Privacy Policy`) but no click action.
- `213`: `Log Out` menu item has no handler.
- Also header QR/Search buttons are intentionally disabled (not interactive).

## 2) Handlers that are stubbed/mocked (console log / TODO)

### `components/messenger/messenger.tsx`
- `402`, `410`, `412`: add-contact flow is frontend-only and only logs.
- `592-599`: calls flow (`Start new call`, `Call contact`) only logs.
- `657-661`: chat actions (`Open in new window`, `Archive`) only log.
- `670-676`: mute action only sets `muted: true` + logs duration (no duration scheduling/unmute).
- `685-686`: block-user action only logs.

### `components/messenger/calls-modal.tsx`
- `100-101`: `Delete all` is stubbed (`console.log`) and does not persist/remove data.
- `106-107`: `Delete selected` is stubbed (`console.log`) and does not persist/remove data.

### `components/messenger/settings.tsx`
- `447`: TODO for OTP sending.
- `480`: TODO for OTP verification.
- `502`: TODO for resend OTP.
- `570`: TODO for saving username to backend.
- `631`: TODO for saving bio to backend.
- `686`: TODO for saving display name to backend.

### `components/messenger/new-group-dialog.tsx`
- `69-71`: group avatar uses `prompt` placeholder instead of file picker/upload flow.

### `components/messenger/new-channel-dialog.tsx`
- `106`: channel avatar uses `prompt` placeholder instead of file picker/upload flow.

### `components/messenger/message-bubble.tsx`
- `97-98`: image copy path is explicitly placeholder (`Copy image logic would go here`) and logs only.

## 3) Auth flows are demo-only (no real backend verification)

### `app/login/page.tsx`
- `84-92`: OTP send/verify are local-only; verify just navigates to `/`.

### `app/signup/page.tsx`
- `27-39`: signup steps are local-only; finish just navigates to `/`.

## 4) Notes for implementation priority

1. High priority: destructive/important actions currently fake (delete calls, block user, archive, logout, otp).
2. Medium priority: major UX buttons without handlers (header actions, profile actions, new contact, voice message).
3. Low priority: cosmetic placeholders (`prompt` avatar selection) and non-critical menu items.
