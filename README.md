# TrackMate

A free, simple fitness tracker to help you build workout splits, log progress, and stay consistent. Built for you and your friends.

## Project Description

TrackMate is a full-stack web application that lets you create custom workout splits, log sets and reps, track personal records, and share progress with workout buddies. No subscriptions, no ads—just the tools you need to get stronger.

## Why I Built This

I was having difficulty tracking my workouts at the gym and couldn't find any suitable app that was free to use. Most options were either too complex, locked behind paywalls, or didn't fit my needs. So I decided to build one for me and my friends—a straightforward tracker that gets out of your way so you can focus on lifting.

## Features

- **Smart Workout Splits** — Choose from 3–6 day splits, customize muscle groups per day, and build your ideal routine
- **Track Progress** — Log sets, reps, and weights. Watch your strength grow with charts, PRs, and volume stats
- **Stay Consistent** — Weekly progress, streaks, and today's focus keep you accountable and motivated
- **Share with Buddies** — Add workout buddies, share personal records, and push each other to new heights
- **Profile & Goals** — Set experience level, training split, preferred days, and units (metric/imperial)
- **Stats Dashboard** — Total workouts, streak, volume, muscle distribution, strength progress charts
- **Dark/Light Theme** — System-aware theme toggle with persistent preference
- **Responsive Design** — Works on mobile and desktop with bottom nav on small screens

## Tech Stack

| Category        | Technology |
| --------------- | ---------- |
| Framework       | Next.js 16 (App Router) |
| Language        | TypeScript |
| Styling         | Tailwind CSS 4, tw-animate-css |
| Database        | PostgreSQL |
| ORM             | Drizzle ORM |
| Auth            | NextAuth.js (Credentials); bcryptjs for passwords |
| Data fetching   | SWR |
| Charts          | Recharts |
| Email           | Resend |
| Rate limiting   | Upstash Redis (`@upstash/ratelimit`, optional via env) |
| UI primitives   | Base UI (`@base-ui/react`) |
| Icons           | Lucide React |
| Utilities       | `clsx`, `tailwind-merge`, `class-variance-authority` |

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/trackmate.git
   cd trackmate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/trackmate"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Generate a secret: `openssl rand -base64 32`

4. **Run database migrations**

   ```bash
   npm run db:migrate:run
   ```

5. **Seed exercise master data (optional)**

   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
trackmate/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Static-style pages: about, privacy, terms
│   ├── api/                      # Route handlers (REST)
│   │   ├── auth/                 # NextAuth, signup, demo-login, verify-code, resend-verification
│   │   ├── buddies/            # Buddies, followers, requests, follow-back, badge, notifications
│   │   ├── exercise-master/    # Exercise catalog
│   │   ├── exercises/          # CRUD, suggest, [id]
│   │   ├── home-completions/   # Home dashboard completions
│   │   ├── profile/            # Profile API
│   │   ├── share/personal-records/  # Shared PRs, sent, [id]
│   │   ├── stats/streak/       # Streak stats
│   │   ├── users/search/       # User search
│   │   ├── verify-email/       # Email verification link handler
│   │   ├── workout-day-exercises/
│   │   ├── workout-days/[id]/
│   │   ├── workout-split/
│   │   ├── workouts/           # Workouts CRUD, [id]
│   │   └── hello/              # Health / sample route
│   ├── auth/                     # signin, signup, error (+ form components)
│   ├── buddies/                # Buddies page + client
│   ├── dashboard/              # Stats dashboard + client
│   ├── profile/                # Profile page + client
│   ├── sign-in/                # Alternate sign-in entry
│   ├── workout/                # Workout logging + client
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx
│   ├── robots.ts / sitemap.ts
│   ├── layout.tsx / page.tsx / providers.tsx
│   ├── loading.tsx / not-found.tsx
│   └── ...
├── components/                   # App + feature components
│   └── ui/                       # Shared UI (button, dialog, accordion)
├── docs/                         # Project notes (e.g. timezone)
├── drizzle/                      # Drizzle schema + SQL migrations
├── lib/                          # Auth, DB, queries, email, rate limiting, helpers
├── public/                       # Static assets
├── scripts/                      # db:migrate:run, seed, add-exercises
├── styles/                       # globals.css
├── types/                        # TypeScript augments (e.g. next-auth)
├── utils/                        # Helpers (e.g. sanitize)
├── middleware.ts                 # Next.js middleware
├── drizzle.config.ts
├── next.config.ts
└── tailwind.config.js
```

## Future Improvements

- [ ] Export workout history (CSV/PDF)
- [ ] Rest timer between sets
- [ ] Progressive overload suggestions
- [ ] PWA support for offline use
- [ ] Social feed of buddies' workouts (opt-in)
- [ ] Body weight / measurements tracking

## Author

**Dhruv** — [dpthk2024@gmail.com](mailto:dpthk2024@gmail.com)

---

Built with ❤️ for lifters who just want to track and improve.
