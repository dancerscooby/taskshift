-- TaskShift — Occupation expansion (8 new occupations, IDs 17–56)
-- Run in Supabase SQL Editor after 02_onet_seed_runners.sql
--
-- Scoring columns:
--   capability_score          — can current AI do this task well? (0–1)
--   mode_weight               — is AI actually deployed for this in production today? (0–1)
--   human_necessity_discount  — how much does the task require a human? (0=none, 1=essential)
--   demand_elasticity_factor  — does AI doing this reduce demand for the role? (0=no, 1=directly)
--
-- Formula:
--   realised_exposure = Σ(t_i × c_i × m_i)
--   displacement_risk = Σ(t_i × c_i × m_i × h_i × d_i)

-- ── Software Developer (O*NET 15-1252.00) ────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Software Developer', '15-1252.00', 'Write and review code to implement new software features and fix defects',          0.35, 0.75, 0.70, 0.55, 0.40),
('Software Developer', '15-1252.00', 'Analyze requirements and design software architecture and data models',             0.20, 0.50, 0.35, 0.80, 0.25),
('Software Developer', '15-1252.00', 'Debug, profile, and optimize software for performance and reliability',             0.20, 0.65, 0.55, 0.65, 0.40),
('Software Developer', '15-1252.00', 'Conduct and participate in code reviews to maintain quality standards',             0.15, 0.55, 0.45, 0.75, 0.30),
('Software Developer', '15-1252.00', 'Collaborate with product managers, designers, and engineers on feature development',0.10, 0.25, 0.15, 0.95, 0.10);

-- ── Data Analyst (O*NET 15-2041.00) ──────────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Data Analyst', '15-2041.00', 'Extract, clean, and transform data from multiple sources using SQL and scripting tools', 0.25, 0.80, 0.70, 0.45, 0.60),
('Data Analyst', '15-2041.00', 'Build and maintain dashboards and reports to visualize key business metrics',            0.25, 0.70, 0.60, 0.50, 0.55),
('Data Analyst', '15-2041.00', 'Conduct statistical analyses to identify trends, patterns, and anomalies in data',      0.20, 0.75, 0.60, 0.50, 0.55),
('Data Analyst', '15-2041.00', 'Translate analytical findings into actionable recommendations for business stakeholders',0.20, 0.50, 0.35, 0.80, 0.35),
('Data Analyst', '15-2041.00', 'Define metrics and KPIs in collaboration with product and business teams',              0.10, 0.35, 0.20, 0.90, 0.20);

-- ── Marketing Manager (O*NET 11-2021.00) ─────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Marketing Manager', '11-2021.00', 'Plan and execute multi-channel marketing campaigns across digital and traditional media', 0.25, 0.60, 0.50, 0.65, 0.40),
('Marketing Manager', '11-2021.00', 'Develop and manage content strategies including copy, visuals, and video',              0.20, 0.75, 0.65, 0.55, 0.50),
('Marketing Manager', '11-2021.00', 'Analyze campaign performance data and optimize spending and messaging',                 0.20, 0.70, 0.65, 0.55, 0.50),
('Marketing Manager', '11-2021.00', 'Define brand positioning and messaging in partnership with leadership',                 0.20, 0.40, 0.25, 0.85, 0.25),
('Marketing Manager', '11-2021.00', 'Manage agency relationships, vendor contracts, and external partnerships',              0.15, 0.25, 0.15, 0.95, 0.15);

-- ── Customer Service Representative (O*NET 43-4051.00) ───────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Customer Service Representative', '43-4051.00', 'Respond to customer inquiries and resolve complaints via phone, email, and chat', 0.40, 0.80, 0.75, 0.45, 0.70),
('Customer Service Representative', '43-4051.00', 'Process orders, returns, refunds, and account changes in company systems',         0.25, 0.90, 0.80, 0.25, 0.75),
('Customer Service Representative', '43-4051.00', 'Identify customer needs and recommend appropriate products or services',           0.15, 0.60, 0.50, 0.65, 0.45),
('Customer Service Representative', '43-4051.00', 'Document customer interactions and update records in CRM systems',                 0.10, 0.85, 0.80, 0.25, 0.70),
('Customer Service Representative', '43-4051.00', 'Escalate complex or sensitive cases to senior staff or specialist teams',         0.10, 0.45, 0.35, 0.80, 0.30);

-- ── Registered Nurse (O*NET 29-1141.00) ──────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Registered Nurse', '29-1141.00', 'Assess patient health by collecting vital signs, medical history, and symptoms',          0.25, 0.55, 0.30, 0.80, 0.25),
('Registered Nurse', '29-1141.00', 'Administer medications, treatments, and procedures as prescribed',                        0.25, 0.25, 0.10, 0.95, 0.10),
('Registered Nurse', '29-1141.00', 'Monitor patients for changes in condition and notify physicians of concerns',              0.20, 0.60, 0.35, 0.85, 0.25),
('Registered Nurse', '29-1141.00', 'Document patient care activities accurately in electronic health record systems',          0.15, 0.75, 0.60, 0.50, 0.40),
('Registered Nurse', '29-1141.00', 'Educate patients and families on diagnoses, treatment plans, and discharge care',         0.15, 0.55, 0.30, 0.85, 0.20);

-- ── Accountant (O*NET 13-2011.01) ────────────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Accountant', '13-2011.01', 'Prepare and review financial statements, reports, and general ledger entries', 0.25, 0.80, 0.70, 0.50, 0.60),
('Accountant', '13-2011.01', 'Maintain accurate financial records and perform account reconciliations',      0.25, 0.90, 0.80, 0.30, 0.70),
('Accountant', '13-2011.01', 'Prepare and file tax returns and ensure regulatory compliance',                0.20, 0.75, 0.65, 0.55, 0.60),
('Accountant', '13-2011.01', 'Conduct audits and verify accuracy and completeness of financial data',        0.15, 0.65, 0.50, 0.65, 0.50),
('Accountant', '13-2011.01', 'Advise management on budgeting, cost control, and financial planning',         0.15, 0.50, 0.30, 0.80, 0.30);

-- ── Project Manager (O*NET 11-9199.01) ───────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Project Manager', '11-9199.01', 'Develop project plans, timelines, and resource allocation schedules',                 0.25, 0.65, 0.50, 0.65, 0.40),
('Project Manager', '11-9199.01', 'Facilitate team meetings and coordinate cross-functional stakeholder communication',   0.25, 0.35, 0.20, 0.95, 0.15),
('Project Manager', '11-9199.01', 'Track project progress, identify risks, and implement mitigation strategies',         0.20, 0.60, 0.45, 0.70, 0.40),
('Project Manager', '11-9199.01', 'Manage project budgets and report financial performance to stakeholders',              0.15, 0.70, 0.55, 0.60, 0.45),
('Project Manager', '11-9199.01', 'Ensure deliverables meet quality standards and stakeholder expectations',             0.15, 0.40, 0.25, 0.85, 0.25);

-- ── Graphic Designer (O*NET 27-1024.00) ──────────────────────────────────────
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Graphic Designer', '27-1024.00', 'Create visual designs for digital and print materials including layouts, graphics, and illustrations', 0.35, 0.80, 0.70, 0.50, 0.55),
('Graphic Designer', '27-1024.00', 'Develop brand identities including logos, typography systems, and color palettes',                    0.20, 0.65, 0.50, 0.65, 0.40),
('Graphic Designer', '27-1024.00', 'Collaborate with clients, marketers, and copywriters to understand and refine creative briefs',       0.20, 0.30, 0.15, 0.95, 0.15),
('Graphic Designer', '27-1024.00', 'Prepare production-ready files for print or digital output and manage version control',               0.15, 0.75, 0.65, 0.45, 0.55),
('Graphic Designer', '27-1024.00', 'Revise designs based on stakeholder feedback through multiple iteration rounds',                      0.10, 0.65, 0.55, 0.60, 0.40);

-- Verify row counts per occupation
SELECT occupation, COUNT(*) AS task_count FROM onet_tasks GROUP BY occupation ORDER BY occupation;
