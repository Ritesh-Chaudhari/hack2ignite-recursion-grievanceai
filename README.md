# 🏛️ Grievance AI

**AI-powered public grievance registration, classification, prioritization, and resolution tracking platform.**

> **Problem statement AI-04** — *"Design an AI-powered public grievance analysis and resolution recommendation platform"* · **Hack 2 Ignite**, GH Raisoni International Skill Tech University · **Team Recursion**

🔗 **Repository:** [github.com/Ritesh-Chaudhari/hack2ignite-recursion-grievanceai](https://github.com/Ritesh-Chaudhari/hack2ignite-recursion-grievanceai)

---

## 📖 Overview

GrievanceAI lets citizens report civic issues — water, roads, electricity, sanitation, safety — in **any language they're comfortable with** (English, हिंदी, मराठी, and more). The moment a complaint is submitted, the **Google Gemini API** detects the language used, classifies the category, scores its priority, writes a crisp English summary, and routes it to the responsible municipal department.

Officers triage everything from a live dashboard with KPI cards, SLA monitoring, filters, duplicate clustering, analytics charts, and CSV export — while citizens watch each complaint move from *Pending* → *In Progress* → *Resolved* on an animated timeline.

### The workflow in 3 steps

1. **Submit in your language** — the citizen files a grievance with a title, description, and location (no login-gated language selector; AI auto-detects the written language).
2. **AI triages instantly** — Gemini classifies, prioritizes, and summarizes; duplicate detection groups similar nearby complaints so officers see patterns, not noise.
3. **Track to resolution** — the routed department picks it up; SLA clocks run per priority, and citizens follow every status change in real time.

---

## ✨ Key features

### 👤 Citizens

- 🌐 **Language-free submission** — write the complaint in any language (Hindi, Marathi, English, or anything else); the AI detects the actual language used — no selector needed
- 🧠 **Instant AI triage** — an animated multi-stage "Gemini is triaging…" overlay (reading → language → category → priority → summary) makes the AI analysis visible
- 📝 **AI summary** — every grievance gets a neutral 1–2 sentence English summary, regardless of input language
- 🎯 **Instant acknowledgment** — confirmation screen with reference ID, classification, priority, routed department, AI summary, and any similar reports grouped with yours
- 🔍 **Two ways to track** — a personal **My Dashboard** with per-complaint status timelines, or a public **Track Status** lookup by reference ID (no login required)
- 🔗 **Duplicate/similar detection** — nearby complaints in the same category are clustered (token-overlap matching on location + title)

### 🛡️ Officers

- 📊 **Officer dashboard** — KPI cards (total, urgent, open cases, SLA breaches, resolution rate) plus analytics charts (Recharts): grievances by category, priority mix, and a 14-day trend line
- 🚨 **SLA monitoring** — every priority carries a resolution deadline (Urgent 24h · High 72h · Medium 7d · Low 14d); breached cases are flagged in red on the queue
- 🎛️ **Powerful queue controls** — search across title/location/summary/submitter, filter by status/category/priority, sort Urgent-first or newest, paginate 20 at a time
- 📋 **All Grievances page** — a dedicated list view separate from the analytics dashboard
- ✏️ **Detail drawer** — open any grievance to read the full complaint and update status, priority, or category (auto-saves `updatedAt`)
- ⬇️ **CSV export** — one click downloads the current (filtered) view as `grievances-<date>.csv`
- 🛟 **Demo data loader** — "Load demo data" seeds 10 realistic multi-language grievances; data also auto-seeds on first dashboard load if the database is empty

### 🔐 Platform

- 👥 **Role-based UI** — Citizens and Officers see different navigation after login; officers cannot file grievances, and unauthorized users are redirected from protected pages
- 🚀 **Immediate redirect** — login/signup sends officers straight to `/admin` and citizens to `/my-grievances` with no intermediate spinner page
- 🛡️ **Graceful degradation** — if the Gemini API fails, times out (15 s), or has no key configured, submissions still save and fall back to a keyword-heuristic triage (Devanagari script detection, keyword classification) marked for manual officer review
- 🔒 **Security hardening** — scrypt-hashed passwords, httpOnly JWT session cookies (`jose`), input sanitization (HTML stripped, length caps), in-memory rate limiting, CORS middleware on all `/api/*` routes, and no password hashes in auth responses

---

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, server + client components, API routes, edge middleware) |
| Language | TypeScript (strict) |
| UI | **Tailwind CSS v4** custom design system, skeleton loaders, CSS animations |
| Database | **MongoDB Atlas** (Mongoose, cached connection, serverless-ready) with a local JSON fallback for zero-setup demos |
| AI | **Google Gemini API** (`@google/genai`, structured JSON output, `gemini-2.5-flash`) |
| Charts | **Recharts** (lazy-loaded to keep the initial bundle small) |
| Auth | Email + password (scrypt hashing, HS256 JWT session cookies via `jose`) |

> 📌 Next.js was upgraded from 15 to 16 as part of the security patching pass ([React Server Components CVE fix](https://github.com/advisories) + latest stable).

---

## 🚀 Setup & installation

### Prerequisites

- Node.js 18.18+ (20+ recommended)
- A **MongoDB** database — local (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A **Gemini API key** (free) — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Ritesh-Chaudhari/hack2ignite-recursion-grievanceai.git
cd hack2ignite-recursion-grievanceai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
#    → open .env.local and set:
#      MONGODB_URI=mongodb://localhost:27017   (or your Atlas URI)
#      GEMINI_API_KEY=your_actual_key

# 4. Run the dev server
npm run dev
# → http://localhost:3000
```

### Logging in

- **Sign up** as a Citizen from the signup page, **or**
- Use the one-click **demo accounts** on the login page:
  - 🛡️ **Officer** — `officer@grievance.ai` / `demo1234`
  - 👤 **Citizen** — `citizen@grievance.ai` / `demo1234`
  - (These are created idempotently by `POST /api/demo-accounts` the first time a demo login is clicked.)
- On the officer dashboard, hit **"Load demo data"** to populate 10 sample grievances (skipped automatically if ≥5 grievances already exist).

### Production build

```bash
npm run build
npm start
```

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` strict type check |

---

## 🔐 Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | **Yes in production** | MongoDB connection string. Also accepted: `MONGODB_URL`. In production a connection failure is a hard error; in development the app falls back to the local JSON store at `./data/grievance-ai-data.json` (not supported on serverless hosts). Values are auto-trimmed and surrounding quotes stripped. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI triage. Without it, submissions use the keyword-heuristic fallback instead of AI. |
| `AUTH_SECRET` | **Yes in production** | JWT signing secret for session cookies. Dev-only default exists; generate one with `openssl rand -hex 32`. |
| `GEMINI_MODEL` | Optional | Gemini model override (default: `gemini-2.5-flash`). |

> ⚠️ **Never commit real values.** `.env.local` is git-ignored; keep it that way. Rotate any key that is ever committed accidentally.

---

## 🗺️ Application map

### Pages

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page — features, how-it-works, categories, role explanations |
| `/submit` | Citizen | Grievance submission form with animated AI triage overlay + confirmation screen |
| `/my-grievances` | Citizen | Personal dashboard — stats cards, status timeline per complaint |
| `/track` | Public | Track any grievance by reference ID (no login required) |
| `/login` · `/signup` | Public | Auth (signup creates citizen accounts; officers use the demo login) |
| `/admin` | Officer | KPI dashboard, analytics, SLA flags, demo data loader |
| `/admin/grievances` | Officer | All-grievances queue — filters, sorting, pagination, CSV export, detail drawer |

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create an account (scrypt hash) |
| `/api/auth/login` | POST | Authenticate and set the JWT session cookie |
| `/api/auth/logout` | POST | Clear the session |
| `/api/auth/me` | GET | Current session user (for the client auth provider) |
| `/api/grievances` | POST | Submit a grievance → sanitize → AI triage → duplicate check → store |
| `/api/grievances` | GET | List grievances (all for officers, own for citizens) |
| `/api/grievances/[id]` | GET | Fetch one grievance (owner or officer only) |
| `/api/grievances/[id]` | PATCH | Officer-only update of status / priority / category |
| `/api/demo-accounts` | POST | Idempotently create the two demo accounts (same-origin guarded) |
| `/api/seed` | GET · POST | Demo data seeder — auto-seeds on first dashboard load, manual via button |

All API responses pass through edge **middleware** that handles CORS preflights and restricts cross-origin API access in production.

### Project structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── submit/                  # Citizen submission wizard (+ AI animation)
│   ├── my-grievances/           # Citizen dashboard + status timelines
│   ├── track/                   # Public reference-ID lookup
│   ├── admin/                   # Officer dashboard + All Grievances page
│   ├── login/ · signup/         # Auth pages
│   └── api/
│       ├── auth/                # register · login · logout · me
│       ├── grievances/          # POST (AI triage) · GET · GET/PATCH [id]
│       ├── demo-accounts/       # Idempotent demo user creation
│       └── seed/                # Demo data loader (prototype only)
├── components/                  # Navbar, badges, timeline, drawer, analytics, auth provider
├── lib/
│   ├── ai.ts                    # Gemini structured-output triage + heuristic fallback
│   ├── store.ts                 # MongoDB (Mongoose) ⇄ local JSON data layer
│   ├── auth.ts · session.ts     # scrypt hashing · JWT cookie sessions
│   ├── sla.ts                   # Per-priority SLA deadlines & breach detection
│   ├── similarity.ts            # Duplicate/similar grievance clustering
│   ├── sanitize.ts · rate-limit.ts · api-auth.ts · env.ts   # Security & config
│   ├── export-csv.ts            # Dashboard CSV export
│   ├── constants.ts · types.ts  # Categories, priorities, departments, models
│   └── i18n.ts · translations/  # en/hi/mr locale infrastructure (lazy-loaded JSON)
└── middleware.ts                # CORS for /api/* routes (edge)
```

---

## 🗄️ Data model

**User** — `id · name · email (unique) · role (citizen | admin) · passwordHash (scrypt:salt:key) · createdAt`

**Grievance** — `id (UUID) · title · description · language (detected) · category (Water | Roads | Electricity | Sanitation | Safety | Other) · priority (Low | Medium | High | Urgent) · status (Pending | In Progress | Resolved) · location · submittedBy · submitterName · createdAt · updatedAt · aiSummary · aiProcessed · duplicateOf[]`

**Department routing** — each category maps to a fixed department (e.g. Water → *Water Supply & Sewerage Department*), shown on the confirmation screen, queue, and timelines.

**SLA deadlines** — Urgent 24 h · High 72 h · Medium 168 h (7 d) · Low 336 h (14 d), enforced client-side with visual breach flags.

---

## 🤖 How the AI triage works

Every submission triggers one structured-output call to `gemini-2.5-flash` (temperature 0.2, 15 s timeout) with a JSON schema enforcing:

1. **`detectedLanguage`** — the language actually used in the text (English / Hindi / Marathi)
2. **`category`** — exactly one of the six categories
3. **`priority`** — judged from impact, scale, and safety risk (Urgent = immediate danger to life/health; High = severe area-wide disruption; Medium = recurring multi-day issues; Low = cosmetic)
4. **`summary`** — a neutral 1–2 sentence English summary mentioning what, where, and impact

If Gemini is unavailable or errors out, a **keyword-heuristic fallback** takes over: Devanagari script detection distinguishes Hindi/Marathi via marker words, category is matched against multilingual keyword lists, and priority from urgency keywords. These grievances are stored with `aiProcessed: false` so officers know to review them manually — **the portal never loses a submission to an AI outage.**

---

## 🛠️ Development notes

- **Serverless-ready store** — the Mongoose connection is cached on `globalThis` to survive hot reloads and serverless invocations; the local JSON fallback is dev-only and deliberately throws in production to prevent silent data loss on Vercel.
- **Security posture** — password hashes never leave the server in API responses; all user text is sanitized (HTML stripped, length-capped) before storage; rate limiting is in-memory per IP (swap for Redis in production); auth routes set `httpOnly · sameSite=lax · secure` cookies; JWT sessions expire after 7 days.
- **Performance** — Recharts and the grievance drawer are lazy-loaded with `Suspense`; lists paginate at 20 items; the dashboard shows skeleton loaders while fetching.
- **i18n** — translations for `en` / `hi` / `mr` are lazy-loaded JSON chunks under `src/lib/translations/`; the AI path auto-detects language per complaint, so no manual language selection is needed in the UI.

## 📜 Changelog highlights

Recent development (see `git log` for the full history):

- **feat** — landing page, auth pages, app shell (Tailwind v4 design system)
- **feat** — grievance submission with AI triage + citizen status tracking
- **feat** — officer dashboard with analytics, filters, drawer, README
- **fix** — stopped leaking password hashes in auth responses; relaxed demo seed threshold
- **fix** — React Server Components CVE patched; Next.js upgraded to latest secure version
- **fix** — serverless MongoDB store, environment-variable validation, production error messaging
- **feat** — role-based UI overhaul: citizen/officer navigation split, immediate login/signup redirects, All Grievances page
- **fix** — text-contrast and readability pass across all pages (dark text on light surfaces, black logo)

---

## 👥 Team Recursion

| Member | Role |
|---|---|
| Ritesh Chaudhari | Team lead · Full-stack development & AI integration |
| *(add teammates here)* | Frontend & UX |
| *(add teammates here)* | Database & dashboard |
| *(add teammates here)* | Testing & demo prep |

## 🙏 Acknowledgments

Built for **Hack 2 Ignite** at GH Raisoni International Skill Tech University — thanks to the organizers for problem statement **AI-04**. Powered by the **Google Gemini API**.

## 🤖 AI usage disclosure

Per hackathon rules, we disclose:

1. **Freebuff** was used as an AI coding agent to help build and scaffold this application.
2. The **Google Gemini API** is used at *runtime within the application* for grievance classification, priority scoring, language detection, and summarization.
