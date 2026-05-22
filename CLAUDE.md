# OriDesk — Project Context

> **How to use this file:** At the start of every new Copilot session, say:
> _"Read CLAUDE.md and get up to speed."_

---

## What is OriDesk?
A multi-tenant AI-powered customer support helpdesk SaaS built for **Ori Global Ltd**.
Businesses (Clients) embed a live chat widget on their site. Customers send messages → tickets are created → Agents reply → AI assists with suggestions.

## Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL via **Prisma ORM**
- **Auth:** NextAuth v5 (credentials, JWT sessions)
- **AI:** OpenAI GPT (sentiment analysis, reply suggestions, CareScore)
- **Styling:** Tailwind CSS
- **Email:** Custom (see `src/lib/email.ts`)
- **Deploy:** Vercel

---

## User Roles
| Role | Description |
|---|---|
| `ADMIN` | Ori Global Ltd staff — manages all clients & agents |
| `CLIENT` | Businesses using OriDesk — see their own tickets |
| `AGENT` | Support agents assigned to clients — reply to tickets |

Route protection is in `src/middleware.ts`. Layouts enforce role checks too.

---

## Pages Built ✅

### Auth (`/src/app/(auth)/`)
- `/login` — credentials sign in, redirects by role
- `/register` — client self-registration
- `/agent-register` — agent self-registration

### Client Dashboard (`/client/`)
- `/client/dashboard` — stats, recent tickets, widget embed reminder
- `/client/tickets` — filterable ticket list (status + priority)
- `/client/agents` — view assigned agents
- `/client/knowledge-base` — add/delete KB articles used by AI
- `/client/settings` — widget embed code, brand colour, AI tone
- `/client/onboarding` — post-registration setup

### Agent Dashboard (`/agent/`)
- `/agent/dashboard` — stats, assigned tickets
- `/agent/tickets` — filterable ticket list
- `/agent/tickets/[id]` — full chat view, AI suggestions, resolve ticket
- `/agent/settings` — bio, country, phone

### Admin Dashboard (`/admin/`)
- `/admin/dashboard` — platform overview stats
- `/admin/clients` — all client companies table
- `/admin/agents` — all agents, approve/suspend inline
- `/admin/tickets` — all tickets across all clients
- `/admin/settings` — platform stats + system info

---

## API Routes (`/src/app/api/`)
| Route | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler |
| `/api/auth/register` | POST | Client self-registration |
| `/api/agents/register` | POST | Agent self-registration |
| `/api/agents/profile` | GET, PATCH | Agent profile (bio, phone, country) |
| `/api/admin/agents` | PATCH | Admin approve/suspend agent |
| `/api/clients/profile` | GET, PATCH | Client profile (website, brand colour, tone) |
| `/api/clients/knowledge-base` | GET, POST, DELETE | KB article management |
| `/api/tickets` | GET, POST | List tickets / create from widget |
| `/api/tickets/[id]` | GET, PATCH | Get ticket / reply / AI suggest / resolve |
| `/api/widget/config` | GET | Widget config by widgetKey |
| `/api/widget/messages` | GET | Poll messages for widget |
| `/api/widget/reply` | POST | Customer reply via widget |

---

## Key Concepts

### Data Privacy / Masking
Agents **never** see real customer names/emails. `src/lib/masking.ts` masks them on ticket creation. The API strips real data for AGENT role responses.

### CareScore™
A proprietary score (0–100) calculated by AI based on agent response quality, speed, and sentiment resolution. Stored on `AgentProfile`.

### Widget Key
Each `ClientProfile` has a unique `widgetKey`. The embeddable chat widget uses this to identify which client's branding/config to load.

### AI Features (in `src/lib/ai.ts`)
- `analyseSentiment(message)` — returns: positive / neutral / negative / angry
- `generateReplySuggestion({...})` — context-aware reply draft using KB + history
- `calculateCareScore({...})` — scores agent performance after resolution

---

## What's Left to Build ❌
- Nothing major — core is complete ✅

## Recently Completed ✅
- **Chat Widget UI** — `/app/widget/page.tsx` (iframe-hosted chat UI)
- **Widget embed script** — `public/widget.js` (injected via `<script>` tag on client sites)
- **All widget APIs** — `/api/widget/config`, `/api/widget/messages`, `/api/widget/reply`
- **Agent tickets list** — `/agent/tickets`
- **All admin pages** — clients, agents (approve/suspend), tickets, settings
- **All client pages** — tickets, agents, knowledge base, settings
- **Agent settings** — `/agent/settings`

---

## Important Files
- `prisma/schema.prisma` — full DB schema
- `src/lib/auth.ts` — NextAuth config
- `src/lib/utils.ts` — shared helpers (cn, formatDate, colour maps)
- `src/lib/masking.ts` — customer data masking
- `src/middleware.ts` — route protection

---

## Dev Notes
- Run `npm run dev` to start. Port 3000 default.
- Database URL is in `.env` (not committed).
- A persistent `next-server` process sometimes holds port 3002 — just use whatever port Next.js picks.
