# Kaya 🫧

A Tamagotchi-style companion that helps an adult with ADHD stay on top of work, body, home, and friends — one tiny next thing at a time. No dying pet, no red overdue badges, no wall of tasks. Just Kaya, four gentle meters, and one suggestion at a time.

Built with React, TypeScript, Vite, Tailwind, and Framer Motion. No backend — everything lives in your browser's `localStorage`, with JSON export/import so your data is never trapped.

## Running it

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. That's it — Kaya ships with starter tasks across all four meters, so it's useful from the first tap. No sign-up, no setup wizard.

Other scripts:

```bash
npm run build      # production build (also generates the PWA service worker)
npm run preview    # serve the production build locally
npm test           # run the Vitest suite once
npm run test:watch # Vitest in watch mode
```

## Installing as an app

`npm run build && npm run preview`, then open it in Chrome/Edge/Safari and use "Add to Home Screen" / the install icon in the address bar. Kaya works offline once installed (service worker precaches the app shell).

## What you can do

- Complete the **morning check-in** (energy, up to 3 wins, one must-do) — it quietly shapes which task gets suggested all day.
- See **one next thing** on Home, with Done / Too big / Not now / Something else.
- Start a **Focus session** (body-doubling timer) from the Focus tab or with one tap from any task in Quests. A gentle "Still on it?" check at the end, never a scold.
- Start a **Side Quest** timer when you want to wander off guilt-free — Kaya just taps its watch when time's up.
- Flag a task as a **boss** (🙂 → 😬) and **Fight** it: split into 3–5 tiny steps and chip away at its HP.
- **Log water, meals, movement, and wind-down** with one tap from Home — these repeat forever, they never disappear.
- Add a **friend**, log "texted / called / hung out," and get gentle (never red, never "overdue") suggestions on who to reach out to.
- Do an optional **evening wind-down**: what got done (auto-filled), one thing you're proud of, and tomorrow's first tiny task. Kaya goes to sleep.
- Watch Kaya **level up** with a toast + sound as XP comes in from tasks, focus sessions, and boss steps.
- Step away for a few days and come back to a **"welcome back"** — meters reset to a comfortable middle, not wherever decay left them.
- **Export/import** your data as JSON, toggle sound/theme/notifications, edit your dopamine menu, and turn individual recurring self-care prompts on or off — all in Settings.

## Architecture

- `src/types/` — the shared `AppState` shape and every domain type (Task, Pet, Friend, FocusSession, Settings...).
- `src/game/` — **pure, unit-tested functions only.** Meter decay/recovery, the next-task picker, XP curve, boss HP, keyword categorizer, streak/welcome-back math, quiet-hours/nudge-cap logic. No React, no side effects — see `*.test.ts` next to each file (113 tests total).
- `src/data/` — static content: starter tasks, boss-battle templates, dopamine menu defaults, pet dialogue, meter/recurring metadata.
- `src/storage/` — a small `localStorage` wrapper, a versioned schema with a `migrate()` escape hatch, and export/import helpers. Swapping in a real backend later means changing only this folder.
- `src/state/` — a single `useReducer` store (`store.tsx`) exposed via `useAppState()` / `useAppDispatch()`, plus small sibling providers for navigation (`navigation.tsx`) and toasts (`toast.tsx`). All game-balance math (XP awards, meter recovery amounts) happens here by calling into `src/game/`.
- `src/hooks/` — `useSound` (WebAudio-synthesized blips, no asset files), `useNotifications` (wraps the Notifications API), `useReducedMotion`, `useThemeSync`.
- `src/components/` — grouped by feature (`home/`, `focus/`, `boss/`, `friends/`, `checkin/`, `quests/`, `pet/`, `meters/`, `shared/`).

## Design decisions worth knowing about

- **"Welcome back" threshold**: the spec says "gone 1+ days," which read literally would fire every single morning. I interpreted it as *at least one full day skipped entirely* (a 2+ calendar-day gap) — see `WELCOME_BACK_GAP_DAYS` in `game/streak.ts`. Below that, meters just decay normally; at or above it, meters reset to a neutral middle and a one-time warm banner shows.
- **Recurring self-care tasks never get a permanent `completedAt`.** They track `lastDoneAt` instead, so "drink water" can be logged forever without vanishing from Quests. See `LOG_RECURRING` vs `COMPLETE_TASK` in `state/store.tsx`.
- **Next-task picker** (`game/nextThing.ts`) scores every open task on meter deficit, energy match, time-of-day fit, and a small random factor — body tasks get an extra boost when the Body meter is under 50, standing in for real per-task "last done" interval tracking.
- **Sound** is synthesized with the WebAudio API (short sine-wave blips) rather than shipped as audio files — zero extra assets, trivially mutable, and easy to keep "quiet" by design.
- **Notifications** are a client-only `setInterval` + Notifications API combo (water reminders, focus/side-quest end). There's no service-worker push, so nudges only fire while the tab is open — see Next steps.

## Next-step ideas

- **Real push notifications.** Today's reminders only fire while the tab is open. A service-worker push + a tiny backend (or a push-as-a-service provider) would let Kaya nudge you even when the app is closed.
- **Calendar sync** (Google/Outlook) to pull in real meetings for the Focus-task suggestions and avoid double-booking focus blocks.
- **AI task breakdown** for "Too big" and Boss Battles — right now the user types their own tiny steps or picks a generic template; an LLM call could suggest steps tailored to the actual task text.
- **Cross-device sync.** The `storage/` module is already isolated behind a small interface specifically so a real backend (or something like Supabase/Firebase) can be swapped in without touching game logic or components.
- **Cosmetic unlocks shop.** `Pet.unlockedItemIds` / `equippedItemId` already exist in the data model as a hook for hats/room decor/backgrounds, but there's no shop UI yet — XP currently only drives leveling.
- **Smarter recurring intervals.** Self-care "overdue" detection today is approximate (meter-deficit driven); storing a real target interval per recurring task and using `lastDoneAt` directly would make the next-task picker and water reminders more precise.
- **Richer rabbit-hole detection.** The side-quest/focus-session model is manual (you decide when to start one); detecting actual tab-switching or idle time could make the "gently notice you've wandered" promise more automatic.
