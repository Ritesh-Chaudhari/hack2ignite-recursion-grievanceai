# 🏛️ Grievance AI

**AI-powered public grievance registration, analysis, and resolution tracking platform.**

> **Problem statement AI-04** — *"Design an AI-powered public grievance analysis and resolution recommendation platform"* · Hack 2 Ignite, GH Raisoni International Skill Tech University · **Team Recursion** (4 members)

---

## 📖 Overview

GrievanceAI lets citizens report civic issues — water, roads, electricity, sanitation, safety — in **English, Hindi, or Marathi**. The moment a complaint is submitted, the **Google Gemini API** classifies it, scores its priority, writes a crisp English summary, and routes it to the responsible department. Officers triage everything from a live dashboard with filters, duplicate clustering, and analytics, while citizens watch their complaint move from *Pending* to *Resolved*.

## ✨ Key features

- 🌐 **Multilingual submission** — file complaints in English, हिंदी, or मराठी; AI detects the actual language used
- 🧠 **AI classification & priority scoring** — Gemini assigns category (Water / Roads / Electricity / Sanitation / Safety / Other) and priority (Low / Medium / High / Urgent) with structured JSON output
- 📝 **AI summarization** — every grievance gets a 1–2 sentence English summary so officers can scan complaints without reading full text
- 🎯 **Instant acknowledgment** — confirmation screen with reference ID, classification, priority, routed department, and the AI summary
- 🔗 **Duplicate/similar detection** — nearby complaints in the same category are grouped so officers see patterns, not noise
- 🛡️ **Officer dashboard** — filter by status / category / priority, priority-sorted queue, detail drawer with status updates (Pending → In Progress → Resolved)
- 📊 **Analytics** — grievances by category, priority mix, and 14-day trend charts (Recharts)
- 📍 **Citizen tracking** — personal page with an animated status timeline per complaint
- 🛟 **Graceful degradation** — if the Gemini API fails or no key is configured, submissions still save and fall back to keyword-based triage marked for manual officer review

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, server + client components, API routes) |
| Language | TypeScript (strict) |
| Styling | **Tailwind CSS v4** + custom design system, Framer Motion animations |
| Database | **MongoDB** (Mongoose) with automatic local JSON fallback for zero-setup demos |
| AI | **Google Gemini API** (`@google/genai`, structured output, `gemini-2.5-flash`) |
| Charts | **Recharts** |
| Auth | Email + password (scrypt hashing, JWT session cookies via `jose`) |

## 🤖 AI usage disclosure

Per hackathon rules, we disclose:

1. **Freebuff** was used as an AI coding agent to help build and scaffold this application.
2. The **Google Gemini API** is used at *runtime within the application* for grievance classification, priority scoring, language detection, and summarization.

## 🚀 Setup & installation

### Prerequisites
- Node.js 18.18+ (20+ recommended)
- A Gemini API key (free) — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- *Optional:* MongoDB (local or Atlas). Without it the app uses a built-in local file store.

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd grievance-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
#    → open .env.local and set GEMINI_API_KEY=your_actual_key

# 4. Run the dev server
npm run dev
# → http://localhost:3000
```

Then create an account (choose **Citizen** or **Officer** at signup), or use the one-click demo accounts on the login page. Officers can hit **“Load demo data”** on the dashboard to populate sample grievances.

### Production build

```bash
npm run build
npm start
```

## 🔐 Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key. Without it, submissions use heuristic triage. |
| `MONGODB_URI` | Yes | MongoDB connection string (`mongodb://localhost:27017` or Atlas). Omit to use the local JSON fallback store. |
| `AUTH_SECRET` | No | JWT signing secret for session cookies (has a dev-only default — set a strong value in production). |
| `GEMINI_MODEL` | No | Gemini model override (default: `gemini-2.5-flash`). |

> ⚠️ **Never commit real values.** `.env.local` is git-ignored; keep it that way. Rotate any key that is ever committed accidentally.

## 🗂️ Project structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── submit/                  # Citizen submission wizard (+ AI animation)
│   ├── my-grievances/           # Citizen tracking + status timelines
│   ├── admin/                   # Officer dashboard, filters, analytics
│   ├── login/ · signup/         # Auth pages
│   └── api/
│       ├── auth/                # register · login · logout · me
│       ├── grievances/          # POST (AI triage) · GET · PATCH [id]
│       └── seed/                # Demo data loader (prototype only)
├── components/                  # Navbar, badges, timeline, drawer, charts
└── lib/                         # types · constants · ai (Gemini) · store · auth · session · similarity
```

## 👥 Team Recursion

| Member | Role |
|---|---|
| *(placeholder)* | Team lead · Backend & AI integration |
| *(placeholder)* | Frontend & UX |
| *(placeholder)* | Database & dashboard |
| *(placeholder)* | Testing & demo prep |

## 🙏 Acknowledgments

Built for **Hack 2 Ignite** at GH Raisoni International Skill Tech University — thanks to the organizers for problem statement **AI-04**. Powered by the Google Gemini API.
