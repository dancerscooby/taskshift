# TaskShift

**Know what AI is doing to your week.**

TaskShift matches your job title to O*NET task data, lets you re-weight tasks to your actual week, and returns two deterministic scores plus an AI-native role description and three-step roadmap.

---

## How it works

1. Enter your job title on Screen 1 → Groq matches it to a seeded occupation
2. Adjust the task sliders to reflect your real week on Screen 2 (must total 100%)
3. See your scores, AI-native role description, and roadmap on Screen 3

### Scoring formula

```
Realised Exposure  = Σ(t_i × c_i × m_i)
Displacement Risk  = Σ(t_i × c_i × m_i × h_i × d_i)
```

| Variable | Meaning |
|----------|---------|
| `t_i` | Your personal time weight for that task (from sliders, normalised to 1.0) |
| `c_i` | Capability score: can AI do this task today? (0–1) |
| `m_i` | Mode weight: is AI being deployed in production for this? (0–1) |
| `h_i` | Human necessity discount: how much does this task require a human? (0–1) |
| `d_i` | Demand elasticity: does AI doing this task reduce demand for the role? (0–1) |

All numeric factors are human-authored in Supabase. The LLM matches roles and writes prose — it never assigns numbers.

### MVP scope

Two seeded occupations:
- **Art Director** (O*NET 27-1011.00) — 9 tasks
- **Sales Representative** (O*NET 41-4012.00) — 7 tasks

Unrecognised roles hit the degrade path: the closest seeded role is shown with a low-confidence banner and its full task list, so users can still re-weight and get a directional result.

---

## Architecture

```
Browser (public/index.html)
  │
  ├── POST /api/taskshift  {action: "match_role"}
  │     └─ Serverless Function (netlify/functions/taskshift.js)
  │           ├── Groq (llama-3.3-70b-versatile, temp=0, max_tokens=20) — role match
  │           └── Supabase → onet_tasks (display columns)
  │
  └── POST /api/taskshift  {action: "calculate"}
        └─ Serverless Function
              ├── Supabase → onet_tasks (all scoring columns)
              ├── Formula (deterministic, in JS)
              ├── Groq (llama-3.3-70b-versatile, temp=0.4, max_tokens=450) — prose
              └── Supabase → user_submissions (insert)
```

**Stack:** Supabase (PostgreSQL) · Groq (llama-3.3-70b-versatile) · Node.js serverless function

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key |
| `SUPABASE_KEY` | Supabase service role key |

No secrets are stored in source code.

---

## Database schema

**`onet_tasks`** — one row per task per occupation
Columns: `id`, `occupation`, `onet_code`, `task_description`, `default_weight`, `capability_score`, `mode_weight`, `human_necessity_discount`, `demand_elasticity_factor`

**`user_submissions`** — one row per completed session
Columns: `id`, `created_at`, `role_input`, `matched_occupation`, `match_confidence`, `email`, `task_weights_json`, `realised_exposure_score`, `displacement_risk_score`, `ai_native_role_text`, `roadmap_text`

Schema SQL: [`data/01_schema.sql`](data/01_schema.sql)
Seed data: [`data/02_onet_seed.sql`](data/02_onet_seed.sql)

---

## Honesty boundary

The LLM is allowed to:
- Match a free-text role to an occupation name from the allowlist
- Write the AI-native role description (prose only)
- Write the three-step roadmap (prose only)

The LLM is NOT allowed to:
- Assign capability scores, mode weights, or any numeric factor
- Compute formula outputs
- Invent task bundles for unrecognised roles

All numbers come from the seeded Supabase table. The formula runs deterministically in the serverless function.

---

## Project structure

```
public/
  index.html              — single-file frontend (3 screens)
netlify/
  functions/
    taskshift.js          — API: match_role + calculate
data/
  01_schema.sql           — Supabase schema
  02_onet_seed.sql        — 16 seed rows (Art Director + Sales Representative)
  02_onet_seed_buffer.sql — 6 additional roles (stretch)
prompts/
  call1_role_match.txt    — Groq Call 1 spec
  call2_roadmap.txt       — Groq Call 2 spec
netlify.toml              — build config + function timeout
package.json              — node engine pin (node 20)
```
