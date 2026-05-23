<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/status-active-success?style=flat-square">
  <img alt="Status" src="https://img.shields.io/badge/status-active-success?style=flat-square">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
</picture>

# HabitForge

**Build better habits, track progress, and level up — one day at a time.**

HabitForge is a full-stack habit tracking SaaS with gamification, AI coaching, analytics, and a focus timer. Built with Next.js 16, Prisma v7, and Auth.js v5.

![HabitForge Preview](https://github.com/sonu-dev00/habit-tracker/raw/main/public/icon.svg)

---

## ✨ Features

- **Habit Tracking** — Create, complete, and manage daily/weekly/monthly habits with streaks and XP
- **AI Coach** — Chat with an AI coach for motivation, tips, and daily quotes (OpenAI/Groq)
- **Gamification** — Earn XP, level up, unlock 14 achievements, compete on streaks
- **Analytics** — Track completion rates, category breakdowns, weekly/monthly trends with interactive charts
- **Pomodoro Timer** — Built-in focus timer with work/break/long-break sessions
- **Notifications** — Real-time notification bell with read/unread tracking
- **Global Search** — `⌘K` to search pages and habits instantly
- **Habit Templates** — Pre-built templates across 10 categories — one-click to add
- **Batch Operations** — Select and archive/delete multiple habits at once
- **Habit Sharing** — Share habits with friends via unique links
- **Achievements** — 14 achievements across streaks, completions, XP, and habits created
- **Premium Plans** — Free/Pro/Teams tiers with feature gating
- **PWA Support** — Install as standalone app, service worker caching, push notifications
- **CSV Export** — Export your habit data anytime
- **Onboarding Wizard** — 4-step guided tour for new users
- **Admin Panel** — Manage users, subscriptions, feature flags, support tickets, AI usage, revenue
- **Security** — XSS sanitization, SQL injection scanning, rate limiting, CSRF protection, audit logging
- **2FA** — Two-factor authentication via TOTP

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma v7 |
| Auth | Auth.js v5 (NextAuth) — Google, GitHub, Credentials |
| Styling | Tailwind CSS, Framer Motion |
| State | TanStack Query, Zustand |
| AI | OpenAI / Groq API |
| Charts | Recharts |
| Payments | Stripe |
| Queue | Redis / Bull |
| Testing | Vitest, Playwright |
| CI/CD | GitHub Actions |
| PWA | Service Worker + Web Manifest |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.9+
- PostgreSQL (local or remote)
- A Google/GitHub OAuth app (for social login)
- OpenAI or Groq API key (for AI features)
- Stripe account (for billing)

### Setup

```bash
# Clone the repo
git clone https://github.com/sonu-dev00/habit-tracker.git
cd habit-tracker

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/habitforge"
AUTH_SECRET="generate-a-random-secret"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk-..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
```

### Database

```bash
# Run migrations
npx prisma migrate dev

# Seed the database (admin user, feature flags, etc.)
npx tsx scripts/seed.ts
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're in.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/        # Admin panel pages
│   ├── (auth)/         # Login, register, forgot-password
│   ├── (dashboard)/    # Main app pages (habits, analytics, ai-chat, pomodoro, etc.)
│   ├── api/            # API route handlers
│   └── shared/         # Public shared habit pages
├── components/
│   ├── layout/         # Dashboard layout, navbar, sidebar, providers
│   └── ui/             # Reusable components (toast, modal, button, etc.)
├── lib/
│   ├── hooks/          # TanStack Query hooks
│   ├── achievements.ts # Achievement definitions & unlock logic
│   ├── api-guard.ts    # Auth/Pro/Admin route guards
│   ├── ai-cache.ts     # AI response caching
│   ├── billing.ts      # Plan & feature definitions
│   └── validation.ts   # Zod schemas
├── store/              # Zustand stores
└── test/               # Vitest test files
```

---

## 🧪 Testing

```bash
# Unit & integration tests (Vitest)
npm test

# E2E tests (Playwright — requires running app)
npm run test:e2e

# Run everything
npm run test:all
```

71 unit/integration tests across 9 test files, plus 38 E2E tests across 3 spec files.

---

## 📊 Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build (standalone) |
| `npm test` | Run Vitest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Lint with Biome |
| `npm run security:sql-scan` | Scan for SQL injection vulnerabilities |
| `npm run security:observatory` | Run Mozilla Observatory scan |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## 🚢 Deployment

**Vercel** (recommended):

```bash
npm run build
vercel --prod
```

Set all environment variables in Vercel project dashboard. `DATABASE_URL` is required at build time.

**Docker**:

```bash
docker compose up -d --build
```

Starts the app with PostgreSQL and Redis. Run `npx tsx scripts/seed.ts` after first migration.

---

## 🤝 Contributing

This is a personal project, but feel free to open issues or submit PRs if something catches your eye.

---

## 📄 License

MIT — use it, tweak it, ship it.
