# HabitForge

Full-stack habit tracking SaaS with AI coaching, gamification, analytics, and a focus timer. Built with Next.js 16, Prisma v7, and Auth.js v5.

---

## Features

- **Habit Tracking** — Create, complete, and manage daily/weekly/monthly habits with streaks and XP
- **AI Coach** — Chat-based coaching with OpenAI/Groq for motivation and daily quotes
- **Gamification** — XP, levels, 14 achievements, streak tracking
- **Analytics** — Completion rates, category breakdowns, weekly/monthly trends (Recharts)
- **Pomodoro Timer** — Work/break sessions with configurable durations
- **Notifications** — Real-time bell with read/unread tracking
- **Global Search** — `Cmd+K` to search pages and habits
- **Habit Templates** — 18 pre-built templates across 10 categories
- **Batch Operations** — Multi-select archive/delete
- **Habit Sharing** — Public share links
- **Premium Plans** — Free/Pro/Teams tiers with Stripe billing
- **PWA** — Standalone install, service worker caching, push notifications
- **CSV Export** — One-click habit data export
- **Admin Panel** — Users, subscriptions, feature flags, support tickets, AI usage, revenue, audit log, security
- **Security** — XSS sanitization, SQL injection scanning, rate limiting, CSRF, 2FA, audit logging
- **Onboarding** — 4-step wizard for new users

## Tech Stack

Next.js 16 | TypeScript | PostgreSQL + Prisma v7 | Auth.js v5 | Tailwind CSS | Framer Motion | TanStack Query | Zustand | OpenAI / Groq | Recharts | Stripe | Redis / Bull | Vitest + Playwright | GitHub Actions | PWA

## Getting Started

```bash
git clone https://github.com/sonu-dev00/habit-tracker.git
cd habit-tracker
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, OAuth keys, API keys
npx prisma migrate dev
npx tsx scripts/seed.ts
npm run dev
```

## Testing

```bash
npm test          # Vitest (71 tests)
npm run test:e2e  # Playwright (38 tests)
npm run test:all  # Both
```

## Deployment

```bash
# Vercel
npm run build && vercel --prod

# Docker
docker compose up -d --build
```

Set all environment variables in Vercel project dashboard. `DATABASE_URL` required at build time.

## License

MIT
