-- TaskShift: MVP runner seed data
-- ============================================================
-- Canonical MVP dataset (DECISIONS D7.2). Contains ONLY the
-- 2 confirmed Move-5 runner roles. Do not add roles here
-- without explicit approval. Buffer roles live in
-- 02_onet_seed_buffer.sql (stretch only).
--
-- Runner 1: Art Director (O*NET 27-1011.00)
--   Participant: Creative Direction & Communication Designer
--   Industry: Fashion Communication, Lifestyle & Architecture
--
-- Runner 2: Sales Representative (O*NET 41-4012.00)
--   Participant: Business Owner / Merchant Exporter
--
-- See docs/user_research.md for matching rationale.
--
-- Scoring key:
--   capability_score (c):  1 = model alone doubles speed | 0.5 = needs extra tools | 0 = cannot
--     Source: Felten, Raj & Seamans (2023) task-level AI exposure framework
--   mode_weight (m):       1 = actually used in real work today | 0.5 = augments only
--     Source: McKinsey State of AI 2023; Goldman Sachs AI adoption report 2023
--   human_necessity_discount (h): archetype-level, lower = more human required
--   demand_elasticity_factor (d): archetype-level, lower = cheaper output shrinks labour demand
--
-- default_weight: derived from O*NET importance/frequency ratings normalised to ~1.0,
--   calibrated against each participant's self-reported time distribution.
--   The user's re-weight overrides this — it is the load-bearing personal link.
-- ============================================================

-- ============================================================
-- Runner 1: Art Director (O*NET 27-1011.00)
-- Participant time distribution: design/systems = largest share;
-- research, documentation, lookbooks, case studies = variable.
-- Tasks selected from O*NET task list; inapplicable tasks
-- (managing print staff, negotiating with printers) excluded.
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES

-- Trend/market research — participant's stated biggest pain point; high AI exposure
('Art Director', '27-1011.00',
 'Research current trends and new technology, such as printing production techniques, computer software, and design trends.',
 0.15, 1.0, 1.0, 0.75, 0.85),

-- Core design execution — "designing and design systems = largest portion of work"
('Art Director', '27-1011.00',
 'Create custom illustrations or other graphic elements.',
 0.18, 1.0, 1.0, 0.70, 0.85),

-- Design systems and layout direction
('Art Director', '27-1011.00',
 'Formulate basic layout design or presentation approach and specify material details, such as style and size of type, photographs, graphics, animation, video, and sound.',
 0.15, 0.5, 0.5, 0.65, 0.85),

-- Creative direction / developing design solutions (the directorial judgment layer)
('Art Director', '27-1011.00',
 'Work with creative directors to develop design solutions.',
 0.12, 0.5, 0.5, 0.60, 0.90),

-- Client communication — explicitly requires human judgement per interview
('Art Director', '27-1011.00',
 'Confer with clients to determine objectives, budget, background information, and presentation approaches, styles, and techniques.',
 0.10, 0.0, 0.5, 0.40, 1.00),

-- Presenting to clients — human-facing, trust-dependent
('Art Director', '27-1011.00',
 'Present final layouts to clients for approval.',
 0.08, 0.0, 0.5, 0.40, 1.00),

-- Reviewing AI/team output — participant explicitly named this as requiring human oversight
('Art Director', '27-1011.00',
 'Review and approve art materials, copy materials, and proofs of printed copy developed by staff members.',
 0.10, 0.0, 0.5, 0.50, 0.90),

-- Project / account management — documentation work
('Art Director', '27-1011.00',
 'Manage own accounts and projects, working within budget and scheduling requirements.',
 0.07, 0.5, 0.5, 0.70, 0.85),

-- Internal coordination / briefing
('Art Director', '27-1011.00',
 'Confer with creative, art, copywriting, or production department heads to discuss client requirements and presentation concepts and to coordinate creative activities.',
 0.05, 0.0, 0.5, 0.40, 0.90);

-- Weight check: 0.15+0.18+0.15+0.12+0.10+0.08+0.10+0.07+0.05 = 1.00 ✓


-- ============================================================
-- Runner 2: Sales Representative (O*NET 41-4012.00)
-- Participant time distribution (self-reported exact percentages):
--   Buyer discovery 40% | Research 25% | Meetings 15% |
--   Zoom 15% | Email 5%
-- default_weights calibrated to this stated distribution.
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES

-- Buyer prospecting — 40% of week; participant's #1 pain point; highest AI exposure
('Sales Representative', '41-4012.00',
 'Identify prospective customers by using business directories, following leads from existing clients, participating in organizations and clubs, and attending trade shows and conferences.',
 0.35, 1.0, 1.0, 0.80, 0.80),

-- Export / market research — 25% of week
('Sales Representative', '41-4012.00',
 'Monitor market conditions, product innovations, and competitors'' products, prices, and sales.',
 0.20, 1.0, 1.0, 0.80, 0.85),

-- Outreach and contact (bulk emails, Meta Ads, initial contact)
('Sales Representative', '41-4012.00',
 'Contact regular and prospective customers to demonstrate products, explain product features, and solicit orders.',
 0.10, 0.5, 1.0, 0.70, 0.80),

-- Relationship management / meetings — participant drew the human line here
('Sales Representative', '41-4012.00',
 'Consult with clients after sales or contract signings to resolve problems and to provide ongoing support.',
 0.15, 0.0, 0.5, 0.40, 1.00),

-- Zoom calls and phone conversations — participant: "sales calls still require humans"
('Sales Representative', '41-4012.00',
 'Answer customers'' questions about products, prices, availability, product uses, and credit terms.',
 0.05, 0.5, 0.5, 0.55, 0.85),

-- CRM and administrative duties — participant explicitly uses AI for this
('Sales Representative', '41-4012.00',
 'Perform administrative duties, such as preparing sales budgets and reports, keeping sales records, and filing expense account reports.',
 0.08, 1.0, 1.0, 0.85, 0.80),

-- Negotiation and contract details — relationship and trust; human-only
('Sales Representative', '41-4012.00',
 'Negotiate details of contracts and payments.',
 0.07, 0.0, 0.5, 0.40, 0.90);

-- Weight check: 0.35+0.20+0.10+0.15+0.05+0.08+0.07 = 1.00 ✓
