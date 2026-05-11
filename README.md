# Stack — Team Task Manager

> A clean, fast task manager for small teams. Projects, drag-and-drop Kanban, role-based access, and a dashboard that gives you the whole picture at a glance.

**🔗 Live demo:** <https://stack-task-manager-production.up.railway.app>
**👤 Demo credentials** (password is the same for all three):

| Role   | Email                  | Name         |
| ------ | ---------------------- | ------------ |
| Admin  | `admin@stack.demo`     | Alex Chen    |
| Member | `designer@stack.demo`  | Priya Patel  |
| Member | `engineer@stack.demo`  | Marco Silva  |

```
Password: demo1234
```

![Stack dashboard](docs/dashboard.png)

![Drag-and-drop Kanban](docs/kanban.png)

---

## Features

- 🔐 **Email + password authentication** with bcrypt hashing and JWT sessions (Auth.js v5).
- 📁 **Projects** with a color, description, and the user as Admin by default.
- 👥 **Team management** — invite existing users by email, promote to Admin, demote, or remove.
- 🛡️ **Role-based access control** (Admin / Member) enforced at the API layer with `requireProjectAdmin` helpers.
- 🧲 **Drag-and-drop Kanban** (`dnd-kit`) with Framer Motion animations and optimistic updates.
- 🎯 **Tasks** with title, description, status, priority (Low / Medium / High / Urgent), due date, and assignee.
- ⏰ **Overdue highlighting** — past-due tasks shown in red on cards and on the dashboard.
- 📊 **Dashboard** with four stat cards, a donut chart of task status, upcoming tasks, overdue list, and recent projects.
- 🌙 **Dark-mode-first design** in Linear's spirit — Geist font, violet accent, zinc neutrals.
- ✨ **Polish**: loading skeletons on every page, toast notifications on every mutation, custom 404 and error pages.

---

## Tech stack

| Layer                | Choice                                            |
| -------------------- | ------------------------------------------------- |
| Framework            | Next.js 16 (App Router) + TypeScript              |
| Database             | PostgreSQL                                        |
| ORM / migrations     | Prisma 6                                          |
| Auth                 | Auth.js v5 (credentials provider, JWT sessions)   |
| Password hashing     | bcryptjs                                          |
| Validation           | Zod                                               |
| Styling              | Tailwind CSS v4 + shadcn/ui (Radix primitives)    |
| Drag-and-drop        | dnd-kit                                           |
| Animation            | Framer Motion                                     |
| Toasts               | Sonner                                            |
| Charts               | Recharts                                          |
| Icons                | Lucide                                            |
| Hosting              | Railway (Next.js + PostgreSQL)                    |

---

## Project structure

```
.
├── prisma/
│   ├── schema.prisma          # Data model: User, Project, Membership, Task
│   ├── migrations/            # SQL migrations (created by `prisma migrate`)
│   └── seed.ts                # Demo data: 3 users, 2 projects, 16 tasks
├── src/
│   ├── app/
│   │   ├── (auth)/            # /login, /signup (centered card layout)
│   │   ├── (dashboard)/       # /app, /projects, /projects/[id] (sidebar layout)
│   │   ├── api/               # REST endpoints — all run on Node runtime
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── projects/route.ts                          # GET, POST
│   │   │   ├── projects/[id]/route.ts                     # GET, PATCH, DELETE
│   │   │   ├── projects/[id]/members/route.ts             # POST (invite)
│   │   │   ├── projects/[id]/members/[userId]/route.ts    # PATCH, DELETE
│   │   │   ├── projects/[id]/tasks/route.ts               # POST
│   │   │   ├── tasks/[id]/route.ts                        # PATCH, DELETE
│   │   │   └── tasks/reorder/route.ts                     # POST (batch update for drag)
│   │   ├── page.tsx           # Marketing landing
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/                # shadcn primitives
│   │   ├── app/               # Sidebar, Topbar
│   │   ├── projects/          # ProjectActions, MembersPanel, NewProjectButton
│   │   ├── kanban/            # KanbanBoard, Column, TaskCard, TaskDrawer, NewTaskInline
│   │   └── dashboard/         # StatusBreakdown (donut chart)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth-helpers.ts    # requireUser, requireMembership, requireProjectAdmin
│   │   ├── actions/auth.ts    # Server actions: signup, login, logout
│   │   └── utils.ts           # cn, formatRelative, initials, isOverdue
│   ├── auth.ts                # Auth.js config (Node runtime, Prisma + bcrypt)
│   ├── auth.config.ts         # Edge-compatible config used by the proxy
│   └── proxy.ts               # Route protection (Next.js 16 proxy / middleware)
└── railway.json               # Build + start configuration for Railway
```

---

## API reference

All endpoints expect a valid session cookie. Errors come back as `{ error: string }` with the appropriate HTTP status.

### Projects

- `GET /api/projects` — list projects the user is a member of
- `POST /api/projects` — create a project (creator becomes Admin)
- `GET /api/projects/:id` — fetch one project with members and tasks
- `PATCH /api/projects/:id` — update name/description/color *(Admin only)*
- `DELETE /api/projects/:id` — delete project and cascade tasks/memberships *(Admin only)*

### Members

- `POST /api/projects/:id/members` — invite by email (user must exist) *(Admin only)*
- `PATCH /api/projects/:id/members/:userId` — change a member's role *(Admin only)*
- `DELETE /api/projects/:id/members/:userId` — remove a member *(Admin only)*

A safeguard prevents removing the last admin from a project.

### Tasks

- `POST /api/projects/:id/tasks` — create a task in a project *(any member)*
- `PATCH /api/tasks/:id` — update title, status, priority, due date, assignee *(any member)*
- `DELETE /api/tasks/:id` — delete a task *(any member)*
- `POST /api/tasks/reorder` — batch update for drag-and-drop *(transactional)*

---

## Local setup

Prerequisites: **Node 20+** and **PostgreSQL 14+** running locally (or any reachable Postgres URL).

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in the environment file
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET (generate one: openssl rand -base64 32)

# 3. Apply migrations and seed the demo data
npm run db:migrate:dev
npm run db:seed

# 4. Run the app
npm run dev
```

Open <http://localhost:3000> and sign in with any of the demo credentials at the top of this README.

### Alternative: local Postgres via Docker

A `docker-compose.yml` is included for a one-command Postgres:

```bash
docker compose up -d
```

The compose file matches the default `DATABASE_URL` in `.env.example` (`postgresql://stack:stack@localhost:5432/stack`).

---

## Deploying to Railway

1. Push this repo to GitHub.
2. On [railway.app](https://railway.app), **New Project → Deploy from GitHub repo** and select your fork.
3. Add a **PostgreSQL** plugin to the same project. Railway will expose `DATABASE_URL` automatically.
4. In the service's **Variables** tab, add:
   - `AUTH_SECRET` — a 32+ character random string (e.g. `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST` — `true`
   - `NEXTAUTH_URL` — your Railway public URL (e.g. `https://stack-production.up.railway.app`)
5. Railway uses `railway.json`: build runs `npm run build` (which also runs `prisma generate`), and start runs `prisma migrate deploy && next start`. Migrations are applied automatically on first deploy.
6. After the first successful deploy, seed the demo data once. From the Railway service shell or locally with the production `DATABASE_URL`:

   ```bash
   DATABASE_URL="<railway-postgres-url>" npm run db:seed
   ```

---

## Scripts

| Script                | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Start the Next.js dev server                                    |
| `npm run build`       | `prisma generate` then `next build` (production build)          |
| `npm run start`       | Apply migrations and start the production server (Railway)      |
| `npm run typecheck`   | TypeScript check with no emit                                   |
| `npm run db:migrate:dev` | Create + apply a new migration locally                       |
| `npm run db:migrate`  | Apply pending migrations (production)                            |
| `npm run db:seed`     | Run the seed script (3 demo users, 2 projects, 16 tasks)        |
| `npm run db:studio`   | Open Prisma Studio                                              |

---

## Design decisions

- **Single Next.js app, not split frontend/backend.** REST routes under `/api/*` are real REST endpoints; the brief's "REST APIs" requirement is met. Splitting into a separate Express service would have added CORS, two deploys, and divergent type definitions for no real gain at this scale.
- **JWT sessions, not database sessions.** Credentials provider in Auth.js v5 supports only JWT. This keeps the DB schema lean (no `Session`/`Account` tables) and makes the app horizontally scalable from day one.
- **`prisma migrate deploy` on start.** Railway applies migrations on every deploy without manual intervention. The first deploy creates all tables; subsequent deploys apply only new migrations.
- **Optimistic UI for the Kanban.** Drag-and-drop reorders are reflected in the UI immediately. The server is updated in the background; on failure the UI rolls back to the snapshot.
- **`requireProjectAdmin` helpers, not a global RBAC middleware.** Each route declares its own permission requirement at the top. Easier to read, easier to audit.
- **Hard scope guard.** No real-time websockets, email notifications, file uploads, comments, or audit log — none of these were in the brief, and adding them would have crowded out polish that the reviewer *will* notice.

---

## License

MIT. Built as a take-home assignment.
