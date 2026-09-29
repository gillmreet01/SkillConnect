# SkillConnect

A full-stack freelancing marketplace connecting clients with freelancers for
project-based work. Clients post projects, freelancers send proposals, and both
sides review each other when the work is done.

> Originally built with HTML, CSS, JavaScript, PHP and MySQL at an
> inter-university hackathon. This repo is a ground-up rebuild on a modern,
> typed stack.

## Tech stack

- **Next.js** (App Router, React Server Components) + **TypeScript**
- **PostgreSQL** with **Prisma** ORM and migrations
- **Tailwind CSS**
- Custom auth: bcrypt password hashing, signed JWT session cookies (`jose`), Zod validation
- **Vitest** unit tests
- **GitHub Actions** CI: lint, typecheck, unit tests, migrate, seed and build against a real Postgres

## Features

- [x] Relational data model: users (client / freelancer roles), freelancer profiles, skills, projects, proposals, reviews
- [x] Open-projects feed rendered on the server from Postgres
- [x] Sign-up / login with client and freelancer roles, role-specific dashboards
- [x] Clients post projects (title, description, budget, deadline, skills)
- [x] Anyone can browse open projects, filter by skill and budget, and open a project page
- [ ] Freelancers submit proposals; clients accept or reject them
- [ ] Accept a proposal → project moves through `OPEN → IN_PROGRESS → SUBMITTED → COMPLETED`
- [ ] Two-way reviews and ratings after completion

## Authentication

Built on Next.js's recommended pattern instead of an auth library, so every
piece is visible in the code:

- **Sign-up / login** are Server Actions validated with Zod (`src/app/actions/auth.ts`).
  Passwords are hashed with bcrypt. Login returns the same error for an unknown
  email and a wrong password, and compares against a dummy hash so both take
  the same time.
- **Sessions** are HS256-signed JWTs in an `httpOnly`, `SameSite=Lax` cookie
  that lasts 7 days (`src/lib/session.ts`).
- **Authorization** happens in two layers:
  - `src/proxy.ts` does a fast cookie-only check that redirects signed-out users
    away from dashboards.
  - The data access layer (`src/lib/dal.ts`) re-checks the user against the
    database on every page and action (`requireUser`, `requireRole`), so a
    deleted account or the wrong role can't get through.

## Data model

```
User ─┬─ 1:1 ── FreelancerProfile ── n:m ── Skill
      ├─ 1:n ── Project (as client) ── n:m ── Skill
      ├─ 1:n ── Project (as assigned freelancer)
      ├─ 1:n ── Proposal ── n:1 ── Project      (one per freelancer per project)
      └─ 1:n ── Review   ── n:1 ── Project      (one per author per project)
```

Money is stored as integer cents. See [`prisma/schema.prisma`](prisma/schema.prisma).

## Getting started

Requires Node.js 20+ and a PostgreSQL database (local, Docker, or a free hosted
one such as Neon or Supabase).

```bash
git clone https://github.com/gillmreet01/SkillConnect.git
cd SkillConnect
npm install                 # also generates the Prisma client
cp .env.example .env        # then set DATABASE_URL and SESSION_SECRET
npm run db:migrate          # create the tables
npm run db:seed             # load demo data
npm run dev                 # http://localhost:3000
```

No local Postgres? Start one with Docker:

```bash
docker run -d --name skillconnect-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=skillconnect postgres:16
```

### Demo accounts

All seeded accounts use the password `password123`.

| Role       | Email               |
| ---------- | ------------------- |
| Client     | `client@demo.dev`   |
| Freelancer | `dev@demo.dev`      |
| Freelancer | `designer@demo.dev` |

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | Production build                      |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | Generate route types and run `tsc`    |
| `npm test`          | Unit tests (Vitest)                   |
| `npm run db:migrate`| Create/apply migrations in development|
| `npm run db:seed`   | Reset and load demo data              |
| `npm run db:reset`  | Drop the database, re-migrate, re-seed|
