# TaskShift

**Know what AI is doing to your week.**

TaskShift matches your job title to O*NET task data, lets you re-weight the tasks to your actual week, and returns two deterministic scores plus an AI-native role description and three-step roadmap.

**Live:** https://taskshift-100x.netlify.app  
**GitHub:** https://github.com/dancerscooby/taskshift

---

## How it works

1. Enter your job title and email on Screen 1 → Groq matches it to a seeded occupation
2. Adjust the task sliders to reflect your real week on Screen 2 → totals must reach 100%
3. See your scores, AI-native role description, and roadmap on Screen 3

### Scoring formula

```
Realised Exposure  = Σ(t_i × c_i × m_i)
Displacement Risk  = Σ(t_i × c_i × m_i × h_i × d_i)
```

- `t_i` — your personal time weight for that task (from sliders, normalised to 1.0)
- `c_i` — capability score: can AI do this task today? (0–1)
- `m_i` — mode weight: is it being deployed in production? (0–1)
- `h_i` — human necessity discount: how much does this task require a human? (0–1)
- `d_i` — demand elasticity: does AI doing this task reduce demand for the role? (0–1)

All four numeric factors are human-authored in Supabase. The LLM matches roles and writes prose — it never assigns numbers.

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
  │     └─ Netlify Function (netlify/functions/taskshift.js)
  │           ├── Groq (llama-3.3-70b-versatile, temp=0, max_tokens=20) — role match
  │           └── Supabase → onet_tasks (display columns)
  │
  └── POST /api/taskshift  {action: "calculate"}
        └─ Netlify Function
              ├── Supabase → onet_tasks (all scoring columns)
              ├── Formula (deterministic, in JS)
              ├── Groq (llama-3.3-70b-versatile, temp=0.4, max_tokens=450) — prose
              └── Supabase → user_submissions (insert)
```

**Stack:** Netlify (serverless) · Supabase (PostgreSQL) · Groq (llama-3.3-70b-versatile)

---

## Local development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local dev server (runs functions at /.netlify/functions/*)
netlify dev

# Open http://localhost:8888
```

The function reads `GROQ_API_KEY` and `SUPABASE_KEY` from environment variables (falls back to embedded values for local dev — replace before sharing publicly).

---

## Deploy

```bash
netlify deploy --prod
```

The site auto-deploys from this repo. Set `GROQ_API_KEY` and `SUPABASE_KEY` as environment variables in the Netlify dashboard to remove the embedded fallbacks.

---

## Database schema

**`onet_tasks`** — one row per task per occupation  
Columns: `id`, `occupation`, `onet_code`, `task_description`, `default_weight`, `capability_score`, `mode_weight`, `human_necessity_discount`, `demand_elasticity_factor`

**`user_submissions`** — one row per completed session  
Columns: `id`, `created_at`, `role_input`, `matched_occupation`, `match_confidence`, `email`, `task_weights_json`, `realised_exposure_score`, `displacement_risk_score`, `ai_native_role_text`, `roadmap_text`

Schema SQL: [`data/01_schema.sql`](data/01_schema.sql)  
Seed data: [`data/02_onet_seed_runners.sql`](data/02_onet_seed_runners.sql)

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
  02_onet_seed_runners.sql — 16 seed rows (Art Director + Sales Representative)
prompts/
  call1_role_match.txt    — Groq Call 1 spec
  call2_roadmap.txt       — Groq Call 2 spec
netlify.toml              — build config + function timeout
```
