# TaskShift — Project Overview

## What it is

TaskShift answers one question: **what is AI actually doing to your working week?**

A user enters their job title and email. The app matches it to a seeded occupation, presents the major tasks for that role, and lets the user re-weight those tasks to reflect how they actually spend their time. It then computes two deterministic scores — Realised Exposure and Displacement Risk — and generates a personalised AI-native role description and three-step career roadmap.

The core insight the product is testing: most AI-impact tools operate at the job level ("this role is 40% automatable"). TaskShift operates at the task level, personalised to the individual's actual week. Two people with the same job title can get meaningfully different scores.

---

## Design principles

**The honesty boundary** is the most important architectural decision in the project.

The LLM is allowed to:
- Match a free-text role to an occupation name from the supported list
- Write the AI-native role description (prose only)
- Write the three-step career roadmap (prose only)

The LLM is NOT allowed to:
- Assign any numeric factor (capability score, mode weight, etc.)
- Compute formula outputs
- Invent a task bundle for an unrecognised role

All numbers — every `capability_score`, `mode_weight`, `human_necessity_discount`, and `demand_elasticity_factor` — are human-authored in Supabase, sourced from published AI-exposure research (Felten et al. 2023, McKinsey State of AI 2023). The formula runs deterministically in `server.js`. The LLM has no path to influence the scores.

This boundary exists because LLM-assigned numbers would not be credible, reproducible, or auditable. The research-backed, human-reviewed data is the defensible foundation.

---

## User flow (three screens)

**Screen 1 — Role input**
User types their job title and email address. The server calls Groq (llama-3.3-70b-versatile, temp=0, max_tokens=30) to match it to one of the seeded occupations. If no match exists, the user sees a `NO_MATCH` state listing the currently supported occupations — they can click any to populate the field and try again.

**Screen 2 — Task re-weighting**
The matched occupation's tasks are displayed as sliders. Default weights sum to 100%. The user adjusts to reflect their actual week. The total must stay at 100%.

**Screen 3 — Results**
Two score cards: Realised Exposure (how much of the role is AI-exposed today) and Displacement Risk (how much does that exposure actually threaten the role). Below those: the AI-native role description (what an AI-augmented version of this role looks like) and a three-step roadmap toward lower-displacement tasks.

---

## Scoring formula

```
Realised Exposure  = Σ(t_i × c_i × m_i)
Displacement Risk  = Σ(t_i × c_i × m_i × h_i × d_i)
```

| Variable | Meaning | Source |
|---|---|---|
| `t_i` | Personal time weight for task i, normalised to 1.0 | User (sliders) |
| `c_i` | Capability score: can AI do this task today? | Human-authored in Supabase |
| `m_i` | Mode weight: is AI deployed in production for this? | Human-authored in Supabase |
| `h_i` | Human necessity discount: how much does this task require a human? | Human-authored in Supabase |
| `d_i` | Demand elasticity: does AI doing this reduce demand for the role? | Human-authored in Supabase |

Both scores are bounded to [0, 1]. A high Realised Exposure with low Displacement Risk means the role is AI-touched but structurally resilient. A high Displacement Risk signals that the AI-exposed tasks are the ones that justify hiring for the role.

---

## Architecture

```
Browser (public/index.html)
  │
  └── POST /api/taskshift
        └─ Express server (server.js)
              │
              ├── match_role action
              │     ├── Groq Call 1 (temp=0, max_tokens=30) — role matching
              │     └── Supabase → onet_tasks (task list)
              │
              └── calculate action
                    ├── Supabase → onet_tasks (all scoring columns)
                    ├── Deterministic formula (in server.js)
                    ├── Groq Call 2 (temp=0.4, max_tokens=450) — prose
                    └── Supabase → user_submissions (insert)
```

**Stack:** Node.js (Express) · Supabase (PostgreSQL, REST API) · Groq (llama-3.3-70b-versatile)

The server is platform-agnostic. `npm start` runs it locally; `PORT` env var sets the port for deployment to Railway, Render, Fly.io, or equivalent.

---

## Current dataset

10 occupations, 56 task rows in Supabase (`onet_tasks`):

| Occupation | O*NET Code | Tasks |
|---|---|---|
| Accountant | 13-2011.01 | 5 |
| Art Director | 27-1011.00 | 9 |
| Customer Service Representative | 43-4051.00 | 5 |
| Data Analyst | 15-2041.00 | 5 |
| Graphic Designer | 27-1024.00 | 5 |
| Marketing Manager | 11-2021.00 | 5 |
| Project Manager | 11-9199.01 | 5 |
| Registered Nurse | 29-1141.00 | 5 |
| Sales Representative | 41-4012.00 | 7 |
| Software Developer | 15-1252.00 | 5 |

The occupation list is loaded from Supabase at startup. No occupations are hardcoded in `server.js`. Adding a new occupation requires only seeding `onet_tasks` — no code changes.

---

## Key files

| File | Purpose |
|---|---|
| `server.js` | All backend logic: startup, occupation loading, match_role, calculate |
| `public/index.html` | Complete frontend — three screens, all JS inline |
| `data/01_schema.sql` | Supabase table definitions (`onet_tasks`, `user_submissions`) |
| `data/02_onet_seed_runners.sql` | Original 2-occupation seed (Art Director, Sales Representative) |
| `data/03_onet_seed_expansion.sql` | 8-occupation expansion seed |
| `netlify/functions/taskshift.js` | Archived original submission — do not modify or redeploy |
| `ROADMAP.md` | How the dataset and matching strategy scale to full O*NET |
| `.env.example` | Required environment variables (`GROQ_API_KEY`, `SUPABASE_KEY`) |

---

## What is deliberately out of scope

- **LLM-assigned scores.** The honesty boundary is a hard constraint, not a convenience. Scores come from research literature, not language models.
- **User accounts / authentication.** Email is stored as a reveal-gate for the roadmap screen only — it is not used for login, delivery, or tracking.
- **Real-time O*NET sync.** The dataset is a curated subset, not a live mirror. See `ROADMAP.md` for the import path.
- **Netlify.** The submitted hackathon deployment (`taskshift-100x.netlify.app`) is archived and must not be modified. All active development is on the Express server.

---

## Development status

Branch: `dev` (active development)
Branch: `master` (archived hackathon submission — do not modify)

Not yet deployed beyond the archived submission. Deployment target: Railway, Render, or Fly.io when the product is ready.

To run locally:
```
cp .env.example .env   # fill in GROQ_API_KEY and SUPABASE_KEY
npm install
npm run dev            # node --watch server.js
```
