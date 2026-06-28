-- TaskShift: Supabase schema
-- Run this first, then run 02_onet_seed.sql

-- ============================================================
-- TABLE 1: onet_tasks
-- Deterministic reference data. Never invented. Sourced from
-- O*NET OnLine (onetonline.org). Scores assigned by hand per
-- DECISIONS D4 — the LLM never produces these numbers.
--
-- Capability score source: Felten, Raj & Seamans (2023) task-
-- level AI exposure framework; adapted for GPT-4/Claude-class
-- models at time of build.
-- Mode weight source: McKinsey State of AI 2023; Goldman Sachs
-- AI adoption report 2023 — archetype-level, not per-task LLM.
-- h / d: archetype-level judgements documented in Move 3 diagram.
--
-- default_weight note (per ARCHITECTURE.md): O*NET publishes
-- importance and frequency ratings, not literal time shares.
-- default_weight is an approximation derived from those ratings
-- and normalised to ~1.0 per occupation. The user's re-weight
-- overrides this — it is the load-bearing personal link.
-- ============================================================

CREATE TABLE IF NOT EXISTS onet_tasks (
  id                       BIGSERIAL PRIMARY KEY,
  occupation               TEXT NOT NULL,
  onet_code                TEXT NOT NULL,
  task_description         TEXT NOT NULL,
  default_weight           NUMERIC NOT NULL,
  capability_score         NUMERIC NOT NULL,
  mode_weight              NUMERIC NOT NULL,
  human_necessity_discount NUMERIC NOT NULL,
  demand_elasticity_factor NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onet_tasks_occupation ON onet_tasks(occupation);

-- ============================================================
-- TABLE 2: user_submissions
-- The load-bearing link lives in task_weights_json.
-- Email is the roadmap reveal-gate only — not used for delivery.
-- Never expose email in shared/public reads.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_submissions (
  id                      BIGSERIAL PRIMARY KEY,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  role_input              TEXT NOT NULL,
  matched_occupation      TEXT NOT NULL,
  match_confidence        TEXT NOT NULL CHECK (match_confidence IN ('high','low')),
  email                   TEXT NOT NULL,
  task_weights_json       JSONB NOT NULL,
  realised_exposure_score NUMERIC,
  displacement_risk_score NUMERIC,
  ai_native_role_text     TEXT,
  roadmap_text            TEXT
);
