# Timezone Handling in TrackMate

This document explains how dates and timezones are handled across the application.

## Overview

- **Server**: Runs in the deployment environment's timezone (often UTC on Vercel).
- **Client**: Uses the user's browser timezone via `new Date()` and `getFullYear()`, `getMonth()`, `getDate()`.
- **Storage**: All dates are stored as `YYYY-MM-DD` strings. No timezone is persisted.

## Key Principles

1. **Avoid `toISOString()` for local dates**: `date.toISOString().slice(0, 10)` returns the UTC date, which can differ from the user's local date (e.g. 23:00 in Sydney is already the next day in UTC).
2. **Use `toLocalDateString()` in `lib/home-utils.ts`**: Uses `getFullYear()`, `getMonth()`, `getDate()` to build `YYYY-MM-DD` in the execution context's timezone.
3. **Client-side correction**: The home page fetches data client-side when `clientToday` is set, ensuring the user sees the correct week and "today" for their timezone.

## Where Dates Are Used

### Home Page (`app/page.tsx`)

- **Server render**: Uses `getWeekStartEnd()` and `getTodayDate()` at request time. On Vercel (UTC), this may show the wrong week for users in other timezones (e.g. Australia).
- **Client correction**: `HomeDashboard` sets `clientToday` in `useEffect` (client-side), then calls `fetchWorkouts()` which fetches from `/api/workouts` and `/api/home-completions`. The client uses `getTodayDate()` and `getWeekStartEnd()` from `home-utils`, which run in the browser's timezone.
- **Result**: Initial render may briefly show server-timezone data; the client fetch corrects it.

### Home Completions API (`app/api/home-completions/route.ts`)

- **GET**: Accepts `start` and `end` query params. If omitted, uses `getWeekStartEnd()` (server timezone). Clients should pass `start` and `end` from their local `getWeekStartEnd()` for correct results.
- **POST/DELETE**: Accept a `date` string. The client sends the date in `YYYY-MM-DD` from their local context.

### Home Dashboard (`components/HomeDashboard.tsx`)

- Uses `clientToday` (set client-side) for all date-dependent logic: today's focus, weekly progress, completion checkbox.
- `fetchWorkouts()` uses `getWeekStartEnd()` and `getTodayDate()` which run in the browser when the callback executes.

## Recommendations

- **For API consumers**: pass `start` and `end` to `/api/home-completions` when the client is in a different timezone than the server.
- **For new features**: prefer client-side date logic when the user's "today" matters; use `lib/home-utils` for consistent formatting.
