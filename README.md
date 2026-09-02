# CBT Examination & Live Proctoring Platform

> An enterprise-grade, high-concurrency Computer-Based Testing (CBT) and real-time proctoring engine. Designed for standardized national-level examinations (JEE, NEET, MHT-CET) with a distinctive **"Vintage Technical Instrument & Academic Journal"** aesthetic.

---

## ⚡ Quick Start for Collaborators

Follow these steps to set up and run the platform locally on your machine.

### 1. Prerequisites
- **Node.js**: v18+ installed ([nodejs.org](https://nodejs.org))
- **PostgreSQL**: v14+ installed and running locally on port `5432` ([postgresql.org](https://www.postgresql.org))
- **Git**: Installed

### 2. Installation
Clone the repository and install all dependencies (root, client, and server workspaces):
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd cbt
npm install
```

### 3. Configure Environment Variables
Copy the example environment file into `server/.env`:
```bash
cp server/.env.example server/.env
```
Open `server/.env` and ensure the database credentials match your local PostgreSQL setup:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cbt_db?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
PORT=8080
HOST="0.0.0.0"
CLIENT_URL="http://localhost:8080"
```

### 4. Initialize Database & Seed Demo Data
Create the database tables and populate standard mock exams, questions, and test accounts:
```bash
# Generate Prisma Client & push schema to database
npm run db:generate
cd server && npx prisma db push

# Seed demo exams, subjects, questions, and test users
npm run db:seed
```

### 5. Build & Launch
Build the frontend client bundle and start the unified server on **port 8080**:
```bash
npm run start
```
Open your browser and navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🔑 Pre-Configured Test Accounts

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Chief Proctor / Admin** | Rajat Kolhapure | `admin@cbt.com` | `admin123` | Full administrative control, live proctoring terminal |
| **Student 1** | Priya Sharma | `student@cbt.com` | `student123` | Roll No: `CET-2026-0001` |
| **Student 2** | Parth Jagdale | `parth@cbt.com` | `student123` | Roll No: `CET-2026-0004` |

> ⚠️ **Notice**: Public user self-registration is strictly disabled. New candidates must be created by the administrator.

---

## 🏛️ System Architecture

```
cbt/
├── client/                     # Frontend (React 18, TypeScript, Vite, Tailwind v4)
│   ├── src/
│   │   ├── components/exam/    # Stopwatch Header, Folder Tabs, Paper Canvas, Palette
│   │   ├── hooks/              # useExamTimer, useExamIntegrity, useNetworkStatus
│   │   ├── pages/admin/        # LiveMonitoringPage (Dual-Mode Telemetry Terminal)
│   │   ├── pages/exam/         # ExamPage (Fullscreen Secured Canvas)
│   │   └── services/           # hardwareTelemetry.ts (WebGL & VM Fingerprinting)
│   └── dist/                   # Built production static assets
├── server/                     # Backend (Node.js, Express, TypeScript, Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & enums
│   │   └── seed.ts             # Demo database seeder
│   └── src/
│       ├── controllers/        # Auth, Admin, Attempt, Exam, Proctoring
│       ├── routes/             # API routes under /api/*
│       └── services/           # admin.service, attempt.service, auth.service
├── .antigravity/
│   └── rules.md                # Shared AI coding rules & design tokens
├── START_CBT.bat               # 1-Click launcher (Server + Tunnel + Browser)
├── STOP_CBT.bat                # 1-Click shutdown
└── package.json                # Workspaces configuration
```

---

## 🛡️ Core Capabilities & Features

1. **Single-Port Architecture**:
   - Both the API and static React frontend run on **port 8080** for zero-CORS issues and instant Cloudflare tunneling.
2. **Strict Anti-Cheat & 5-Minute Absence Auto-Submit**:
   - Enforces fullscreen mode.
   - If a candidate leaves the exam window (`WINDOW_BLUR`, tab switch, minimization), a **5-minute (300s) countdown overlay** activates.
   - If they return within 5 minutes, the timer cancels. If 5 minutes elapse, the exam auto-submits.
   - Suppresses DevTools (`F12`, `Ctrl+Shift+I`, `Ctrl+U`), copy, paste, cut, drag, and context menu.
   - Tracks cursor coordinates to detect mouse teleportation (host-guest VM switching).
3. **Pre-Exam Hardware & VM Fingerprinting**:
   - Executes immediately post-login.
   - Inspects WebGL unmasked renderer strings against known hypervisors (`virtualbox`, `vmware`, `qemu`, `swiftshader`, etc.).
   - Captures screen geometry, multi-monitor configuration, CPU cores, and device memory.
4. **Dual-Mode Live Proctoring Terminal (`/admin/live`)**:
   - **Mode 1 (Command Center)**: High-density card grid for monitoring large cohorts with live progress bars and LED status indicators.
   - **Mode 2 (Personal Focus)**: 1-on-1 deep-dive with live answer heatmap matrix, chronological integrity stream, custom warning dispatch, time extension (`+5` to `+30` min), and force termination.
5. **Design System**:
   - "Vintage Technical Instrument & Academic Journal" theme.
   - Warm newsprint paper canvas (`#FBF9F5`), crisp ink rules (`#1C1D21`), tactile offset shadows (`shadow-[2px_2px_0px_0px_#1C1D21]`), and mechanical push-buttons (`.btn-tactile`).

---

## 🤝 Collaborating with Git & Antigravity

See [**`CONTRIBUTING.md`**](file:///c:/Users/rmk19/OneDrive/Documents/cbt/CONTRIBUTING.md) for our team branch workflow, AI coding rules, and database migration guidelines.
