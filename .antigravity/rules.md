# CBT Platform — Antigravity Assistant Rules & Architecture Guidelines

> **Purpose**: This file defines authoritative architectural rules, design tokens, security constraints, and coding standards for all AI assistants (Antigravity) working on this codebase.

---

## 1. System Architecture & Topology

- **Single Port Server (Port 8080)**:
  - Express.js backend runs on port 8080.
  - In production (`npm run serve`), Express serves the compiled React single-page application directly from `client/dist`.
  - All API routes are prefixed under `/api/*`.
- **Database & ORM**:
  - PostgreSQL running on port 5432 (database name: `cbt_db`).
  - Managed exclusively through Prisma ORM (`server/prisma/schema.prisma`).
  - Do not create or run raw manual SQL statements without a Prisma migration.
- **Client App**:
  - React 18, Vite 8, TypeScript, Tailwind CSS v4, Lucide React Icons, KaTeX for math formulas.

---

## 2. Design System: "Vintage Technical Instrument & Academic Journal"

All UI changes must adhere strictly to this theme. **Do NOT introduce modern generic AI aesthetics** (such as floating pastel pills, glowing rounded cards, or purple/indigo gradient backdrops).

### Typography
- **Academic Serif (`font-serif`)**: `"Newsreader"`, `"Playfair Display"`, `"Georgia"`. Used for formal mastheads, exam titles, and question headers.
- **Technical Monospace (`font-mono`)**: `"IBM Plex Mono"`, `"JetBrains Mono"`, `"Courier New"`. Used for clocks, timers, coordinates, telemetry data, question numbers, and status stamps.
- **High-Contrast Body (`font-sans`)**: `"Inter"`, sans-serif. Used for question text, formulas, and general copy.

### Color Tokens
- **Backgrounds**: Warm Newsprint / Parchment `#FBF9F5` (Canvas), `#FFFFFF` (Paper card), Inset Wells `#F4EFEA` and `#EAE3D9`.
- **Borders & Rules**: Crisp ink line `#1C1D21` (Light mode) and `#2E323B` (Terminal mode).
- **Inks & Accents**:
  - Primary Action / Masthead: Deep Royal Ink `#1A2B4C`.
  - Highlights / Review / Active Tabs: Vintage Ochre Gold `#C88A2D`.
  - Success / Answered / Clean Hardware: Muted Emerald Signal `#236B47`.
  - Violations / Alerts / Terminations: Muted Crimson `#A83232`.
  - Secondary Warning: Amber Lamp `#D97706`.

### Edges & Micro-Interactions
- **Sharp / Subtle Corners**: Use `rounded-none`, `rounded-xs`, or `rounded-sm`. Avoid large rounded pills (`rounded-2xl`, `rounded-full`).
- **Tactile Offset Shadows**: Use `.shadow-tactile` (`shadow-[2px_2px_0px_0px_#1C1D21]`) and `.btn-tactile`.
- **Mechanical Depress**: Buttons must physically depress on click:
  `active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`.
- **Snappy Transitions**: Use fast cubic-bezier curves: `transition-all duration-75 ease-[cubic-bezier(0.16,1,0.3,1)]`.

---

## 3. Strict Security & Business Logic Rules

1. **Administrator Identity**:
   - The chief administrator and proctor name is **Rajat Kolhapure** (`admin@cbt.com`).
2. **Registration Lockdown**:
   - Public candidate registration is **strictly disabled**.
   - `POST /api/auth/register` must return `403 Forbidden`. Do not re-enable public registration forms.
3. **Pre-Exam Hardware & VM Telemetry**:
   - Hardware detection must run immediately post-login in `AuthContext.tsx` / `LoginPage.tsx`.
   - Results are stored in the `HardwareProfile` database table and surfaced in the admin monitoring console.
4. **Anti-Cheat & 5-Minute Absence Protection**:
   - Fullscreen is mandatory during exams.
   - If a student leaves the exam window (`blur`, `visibilitychange`, `fullscreenchange`), a **5-minute (300s) countdown** begins.
   - If they do not return within 5 minutes, the exam auto-submits and evaluates.
   - If they return in time, the timer resets and the overlay clears.
   - Copy, cut, paste, drag, context menu, and DevTools shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+U`) are suppressed.

---

## 4. AI Pair-Programming Etiquette (Teamwork on Git)

When making code changes in this repository:
- **Localize Edits**: Touch *only* the specific files needed for the requested feature. Do not randomly format, re-order imports, or refactor shared layout files (`App.tsx`, `index.css`, `schema.prisma`) unless explicitly requested.
- **Check Compilation**: Always run `npm run build` in `client` and `npm run build` in `server` before concluding a task. Never leave broken TypeScript types.
- **Database Migrations**: When updating `schema.prisma`, use `npx prisma migrate dev --name <migration_name>` so SQL migration files are generated for version control.
