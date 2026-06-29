# TaskShift — Expansion Roadmap

This document describes how the project scales from 10 occupations to full O*NET coverage. No code changes are needed now — the architecture is already designed for each phase. Pick this up whenever the dataset needs to grow.

---

## Current state (10 occupations, ~56 task rows)

**How it works today:**
- Occupations live entirely in Supabase (`onet_tasks`). `server.js` never lists them.
- On startup, `loadOccupations()` reads distinct occupation names from the DB and caches them in `occupations[]`.
- `buildMatchPrompt()` generates the Groq Call 1 system prompt from that list at runtime.
- Adding a new occupation = insert rows into `onet_tasks`, restart the server. Zero code changes.

**Bottleneck:** The occupation list is sent verbatim in every Groq Call 1 prompt. This works well to ~50 occupations (~600 tokens). Beyond that, prompt cost and latency increase and reliability may drop.

---

## Phase 1 — 50 occupations

**What changes:** Nothing in `server.js`. Add rows to `onet_tasks`.

**How to add data:**

Option A (manual): Write additional `data/0N_onet_seed_*.sql` files following the same pattern as `03_onet_seed_expansion.sql`. Run them in the Supabase SQL Editor.

Option B (scripted): Create `scripts/import_onet.js`. O*NET publishes annual database downloads at [onetcenter.org/database.html](https://www.onetcenter.org/database.html). The relevant files are:
- `Task Statements.txt` — occupation code, title, task description, importance and frequency ratings
- Use `importance × frequency` (normalised to 1.0 per occupation) to derive `default_weight`
- Import occupation name, `onet_code`, task descriptions, and `default_weight`

**Scoring factor constraint (critical):** The 4 scoring columns — `capability_score`, `mode_weight`, `human_necessity_discount`, `demand_elasticity_factor` — are not in the O*NET database. They require human judgement and cannot be auto-imported. Two options:
1. Seed them as `NULL` and display a "scoring not yet calibrated" banner in the UI for those occupations
2. Apply a conservative default (e.g., `capability_score=0.5, mode_weight=0.4, human_necessity_discount=0.7, demand_elasticity_factor=0.4`) and mark rows as `needs_review=true` (requires adding this column to `onet_tasks`)

**Files to touch:** `data/` only (or new `scripts/import_onet.js`). `server.js` — none.

---

## Phase 2 — 100 occupations

**What changes:** `buildMatchPrompt()` in `server.js` — replace or supplement the list-in-prompt approach.

At ~100 occupations the Groq system prompt becomes long (~1,200 tokens just for the list). More importantly, LLMs can lose precision when choosing from long lists at temperature 0.

**Recommended approach — embedding-based matching:**

1. Enable the `pgvector` extension in Supabase (free tier supports it).
2. Add a column `title_embedding vector(1536)` to `onet_tasks` (or a separate `onet_occupations` table).
3. Pre-compute embeddings for each occupation title (+ optionally a short description) using OpenAI `text-embedding-3-small` or a comparable model.
4. At query time, embed the user's role input and run a nearest-neighbour search:
   ```sql
   SELECT occupation FROM onet_tasks
   ORDER BY title_embedding <=> $1   -- pgvector cosine operator
   LIMIT 1;
   ```
5. Validate the result exists in the live `onet_tasks` table before returning.
6. Use a similarity threshold to distinguish confident matches from `no_match`.

**What stays the same:** `fetchTasks()`, the formula, `calculate` action, Supabase write — everything downstream is unaffected. Only the match step in `buildMatchPrompt()` changes.

**Extension point in code:** The comment block above `buildMatchPrompt()` in `server.js` marks this seam exactly. Replace the function body; the rest of the `match_role` handler does not change.

---

## Phase 3 — Full O*NET (~1,000 occupations)

O*NET covers 1,016 occupations (2024 release). This phase requires:

1. **Automated import pipeline** (`scripts/import_onet.js`):
   - Download and parse `Task Statements.txt` from the O*NET database
   - Derive `default_weight` from importance × frequency ratings, normalised per occupation
   - Insert into `onet_tasks` (occupation, onet_code, task_description, default_weight)
   - Leave the 4 scoring columns as `NULL` initially, to be filled by calibration

2. **Scoring factor calibration strategy** (choose one or combine):
   - *Manual review queue*: build an admin UI that shows unscored tasks and lets a human fill in the 4 values
   - *Bulk estimation*: train a small regression model on the 10 hand-scored occupations to predict scores for the rest; flag predicted rows clearly in the UI
   - *External sources*: map to Felten et al. (2023) AI exposure scores (published per O*NET occupation) for `capability_score`; use McKinsey/Brookings sector-level adoption data for `mode_weight`

3. **Embedding matching** (from Phase 2) — required at this scale

4. **Supabase schema change (optional but recommended):**
   Add a separate `onet_occupations` table with one row per occupation (code, title, description, embedding). `onet_tasks` keeps the per-task rows. This makes occupation-level queries faster and is the canonical O*NET structure.

**`match_confidence` note:** The current `user_submissions` schema only allows `'high'` or `'low'` for `match_confidence`. The `'no_match'` state is handled correctly today (no DB write). If you want to track no-match queries in Supabase for analytics, update the CHECK constraint:
```sql
ALTER TABLE user_submissions
  DROP CONSTRAINT user_submissions_match_confidence_check,
  ADD CONSTRAINT user_submissions_match_confidence_check
    CHECK (match_confidence IN ('high', 'low', 'no_match'));
```

---

## Extension points summary

| What needs to grow | Where to change | Files | Downstream impact |
|---|---|---|---|
| Add occupations (≤50) | Insert rows into `onet_tasks` | `data/*.sql` or `scripts/import_onet.js` | None |
| Role matching (50–100+) | `buildMatchPrompt()` in `server.js` | `server.js` only | None |
| Scoring factors | `onet_tasks` rows (4 columns) | DB only | Scores change |
| Track no_match in DB | CHECK constraint on `user_submissions` | DB migration | None in server |
| O*NET full import | New `scripts/import_onet.js` | New file | None in server |

---

## What never changes

The formula and everything downstream of the occupation match are already at full-O*NET scale:

- `fetchTasks()` — generic Supabase query, works for any occupation
- The scoring formula — reads whatever is in the 4 columns, occupation-agnostic
- `calculate` action — no occupation-specific logic anywhere
- Supabase write — schema already handles any occupation name

The only two moving parts across all phases are **how occupations enter the DB** (data pipeline) and **how user input maps to an occupation name** (matching strategy).
