# Project Architecture

This project now follows a feature-based structure for business domains and a shared layer for reusable UI/utilities.

## Top-Level Structure

- `app/`
  Next.js app router pages and layouts.
- `features/`
  Feature domains with their own components and logic.
- `components/ui/`
  Shared generic UI primitives.
- `lib/`
  Shared non-feature-specific helpers and types.
- `public/`
  Static assets.

## Feature Layout

- `features/auth/`
  - `components/` auth-specific UI building blocks.
  - `lib/` auth-specific logic (OTP/session demo storage).
- `features/messenger/`
  - `components/` messenger-specific components and flows.

## Import Conventions

- Use `@/features/...` for feature modules.
- Use `@/components/ui/...` for shared UI primitives.
- Use `@/lib/...` for cross-feature helpers/types.

## Notes

- Empty legacy folders may still exist if your environment blocks folder deletion by policy.
- They are safe to remove once deletion is allowed.
