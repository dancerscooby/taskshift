-- TaskShift: Buffer / demo seed data — STRETCH ONLY
-- ============================================================
-- DO NOT insert these rows as part of the core MVP build.
-- Insert ONLY if comfortably ahead of schedule (Stretch #1,
-- MILESTONES.md). These roles are NOT required for Move 5
-- or grading. The MVP dataset lives in 02_onet_seed_runners.sql.
--
-- After inserting, also add each occupation name to the
-- allowed occupations list in prompts/call1_role_match.txt.
-- ============================================================
-- 6 roles, 10 tasks each. All task text from O*NET OnLine.
-- Scoring methodology: see 02_onet_seed_runners.sql header.
-- ============================================================

-- ============================================================
-- 1. Financial Analyst (O*NET 13-2051.00)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Financial Analyst', '13-2051.00', 'Monitor fundamental economic, industrial, and corporate developments by analyzing information from financial publications and services, investment banking firms, government agencies, trade publications, company sources, or personal interviews.',  0.13, 1.0, 1.0, 0.85, 0.80),
('Financial Analyst', '13-2051.00', 'Inform investment decisions by analyzing financial information to forecast business, industry, or economic conditions.',                                                                                                                               0.13, 1.0, 0.5, 0.70, 0.80),
('Financial Analyst', '13-2051.00', 'Draw charts and graphs, using computer spreadsheets, to illustrate technical reports.',                                                                                                                                                      0.09, 1.0, 1.0, 0.90, 0.85),
('Financial Analyst', '13-2051.00', 'Employ financial models to develop solutions to financial problems or to assess the financial or capital impact of transactions.',                                                                                                            0.11, 0.5, 0.5, 0.70, 0.80),
('Financial Analyst', '13-2051.00', 'Present oral or written reports on general economic trends, individual corporations, and entire industries.',                                                                                                                                 0.10, 1.0, 1.0, 0.85, 0.85),
('Financial Analyst', '13-2051.00', 'Recommend investments and investment timing to companies, investment firm staff, or the public.',                                                                                                                                             0.10, 0.5, 0.5, 0.60, 0.80),
('Financial Analyst', '13-2051.00', 'Prepare plans of action for investment, using financial analyses.',                                                                                                                                                                         0.08, 1.0, 0.5, 0.65, 0.80),
('Financial Analyst', '13-2051.00', 'Evaluate and compare the relative quality of various securities in a given industry.',                                                                                                                                                       0.07, 1.0, 0.5, 0.70, 0.80),
('Financial Analyst', '13-2051.00', 'Develop and maintain client relationships.',                                                                                                                                                                                                0.12, 0.0, 0.5, 0.40, 1.00),
('Financial Analyst', '13-2051.00', 'Collaborate on projects with other professionals, such as lawyers, accountants, or public relations experts.',                                                                                                                               0.07, 0.0, 0.5, 0.40, 1.00);

-- ============================================================
-- 2. Software Developer (O*NET 15-1252.00)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Software Developer', '15-1252.00', 'Analyze user needs and software requirements to determine feasibility of design within time and cost constraints.',                                                        0.10, 0.5, 0.5, 0.70, 0.90),
('Software Developer', '15-1252.00', 'Design, develop and modify software systems, using scientific analysis and mathematical models to predict and measure outcomes and consequences of design.',                0.20, 1.0, 1.0, 0.80, 0.90),
('Software Developer', '15-1252.00', 'Modify existing software to correct errors, adapt it to new hardware, or upgrade interfaces and improve performance.',                                                    0.15, 1.0, 1.0, 0.80, 0.85),
('Software Developer', '15-1252.00', 'Analyze information to determine, recommend, and plan installation of a new system or modification of an existing system.',                                               0.08, 0.5, 0.5, 0.70, 0.85),
('Software Developer', '15-1252.00', 'Store, retrieve, and manipulate data for analysis of system capabilities and requirements.',                                                                              0.08, 1.0, 1.0, 0.85, 0.85),
('Software Developer', '15-1252.00', 'Develop or direct software system testing or validation procedures, programming, or documentation.',                                                                      0.10, 1.0, 1.0, 0.80, 0.85),
('Software Developer', '15-1252.00', 'Confer with systems analysts, engineers, programmers and others to design systems and to obtain information on project limitations and capabilities.',                    0.10, 0.0, 0.5, 0.50, 0.90),
('Software Developer', '15-1252.00', 'Prepare reports or correspondence concerning project specifications, activities, or status.',                                                                              0.07, 1.0, 1.0, 0.90, 0.85),
('Software Developer', '15-1252.00', 'Consult with customers or other departments on project status, proposals, or technical issues, such as software system design or maintenance.',                          0.07, 0.0, 0.5, 0.50, 0.90),
('Software Developer', '15-1252.00', 'Determine system performance standards.',                                                                                                                                0.05, 0.5, 0.5, 0.70, 0.85);

-- ============================================================
-- 3. Marketing Manager (O*NET 11-2021.00)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Marketing Manager', '11-2021.00', 'Identify, develop, or evaluate marketing strategy, based on knowledge of establishment objectives, market characteristics, and cost and markup factors.',           0.15, 0.5, 0.5, 0.65, 0.85),
('Marketing Manager', '11-2021.00', 'Use sales forecasting or strategic planning to ensure the sale and profitability of products, lines, or services, analyzing business developments and monitoring market trends.', 0.12, 1.0, 0.5, 0.70, 0.85),
('Marketing Manager', '11-2021.00', 'Initiate market research studies, or analyze their findings.',                                                                                                    0.12, 1.0, 1.0, 0.80, 0.85),
('Marketing Manager', '11-2021.00', 'Formulate, direct, or coordinate marketing activities or policies to promote products or services, working with advertising or promotion managers.',                0.13, 0.5, 0.5, 0.60, 0.85),
('Marketing Manager', '11-2021.00', 'Develop pricing strategies, balancing firm objectives and customer satisfaction.',                                                                                 0.08, 0.5, 0.5, 0.65, 0.85),
('Marketing Manager', '11-2021.00', 'Evaluate the financial aspects of product development, such as budgets, expenditures, research and development appropriations, or return-on-investment and profit-loss projections.', 0.08, 1.0, 0.5, 0.75, 0.80),
('Marketing Manager', '11-2021.00', 'Direct the hiring, training, or performance evaluations of marketing or sales staff and oversee their daily activities.',                                          0.08, 0.0, 0.5, 0.40, 1.00),
('Marketing Manager', '11-2021.00', 'Compile lists describing product or service offerings.',                                                                                                           0.09, 1.0, 1.0, 0.90, 0.85),
('Marketing Manager', '11-2021.00', 'Coordinate or participate in promotional activities or trade shows, working with developers, advertisers, or production managers, to market products or services.', 0.08, 0.0, 0.5, 0.50, 0.90),
('Marketing Manager', '11-2021.00', 'Consult with buying personnel to gain advice regarding the types of products or services expected to be in demand.',                                               0.07, 0.0, 0.5, 0.50, 0.90);

-- ============================================================
-- 4. Data Scientist (O*NET 15-2051.00)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Data Scientist', '15-2051.00', 'Analyze, manipulate, or process large sets of data using statistical software.',                                                                              0.18, 1.0, 1.0, 0.85, 0.85),
('Data Scientist', '15-2051.00', 'Clean and manipulate raw data using statistical software.',                                                                                                   0.12, 1.0, 1.0, 0.90, 0.80),
('Data Scientist', '15-2051.00', 'Write new functions or applications in programming languages to conduct analyses.',                                                                            0.12, 1.0, 1.0, 0.85, 0.90),
('Data Scientist', '15-2051.00', 'Test, validate, and reformulate models to ensure accurate prediction of outcomes of interest.',                                                               0.10, 0.5, 0.5, 0.75, 0.85),
('Data Scientist', '15-2051.00', 'Identify business problems or management objectives that can be addressed through data analysis.',                                                             0.10, 0.5, 0.5, 0.65, 0.90),
('Data Scientist', '15-2051.00', 'Deliver oral or written presentations of the results of mathematical modeling and data analysis to management or other end users.',                           0.10, 1.0, 1.0, 0.85, 0.85),
('Data Scientist', '15-2051.00', 'Create graphs, charts, or other visualizations to convey the results of data analysis using specialized software.',                                           0.08, 1.0, 1.0, 0.90, 0.85),
('Data Scientist', '15-2051.00', 'Identify relationships and trends or any factors that could affect the results of research.',                                                                 0.08, 0.5, 0.5, 0.70, 0.85),
('Data Scientist', '15-2051.00', 'Recommend data-driven solutions to key stakeholders.',                                                                                                       0.07, 0.5, 0.5, 0.65, 0.85),
('Data Scientist', '15-2051.00', 'Read scientific articles, conference papers, or other sources of research to identify emerging analytic trends and technologies.',                            0.05, 1.0, 1.0, 0.90, 0.90);

-- ============================================================
-- 5. HR Specialist (O*NET 13-1071.00)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('HR Specialist', '13-1071.00', 'Interview job applicants to obtain information on work history, training, education, or job skills.',                                                                       0.15, 0.0, 0.5, 0.40, 0.90),
('HR Specialist', '13-1071.00', 'Perform searches for qualified job candidates, using sources such as computer databases, networking, Internet recruiting resources, media advertisements, job fairs, recruiting firms, or employee referrals.', 0.15, 1.0, 1.0, 0.75, 0.80),
('HR Specialist', '13-1071.00', 'Review employment applications and job orders to match applicants with job requirements.',                                                                                  0.12, 1.0, 1.0, 0.70, 0.80),
('HR Specialist', '13-1071.00', 'Interpret and explain human resources policies, procedures, laws, standards, or regulations.',                                                                              0.12, 0.5, 0.5, 0.65, 0.85),
('HR Specialist', '13-1071.00', 'Prepare or maintain employment records related to events, such as hiring, termination, leaves, transfers, or promotions, using human resources management system software.', 0.10, 1.0, 1.0, 0.85, 0.80),
('HR Specialist', '13-1071.00', 'Address employee relations issues, such as harassment allegations, work complaints, or other employee concerns.',                                                           0.08, 0.0, 0.5, 0.30, 1.00),
('HR Specialist', '13-1071.00', 'Conduct exit interviews and ensure that necessary employment termination paperwork is completed.',                                                                          0.07, 0.0, 0.5, 0.40, 0.90),
('HR Specialist', '13-1071.00', 'Analyze employment-related data and prepare required reports.',                                                                                                            0.08, 1.0, 1.0, 0.85, 0.85),
('HR Specialist', '13-1071.00', 'Schedule or conduct new employee orientations.',                                                                                                                           0.07, 0.5, 0.5, 0.55, 0.90),
('HR Specialist', '13-1071.00', 'Develop or implement recruiting strategies to meet current or anticipated staffing needs.',                                                                                 0.06, 0.5, 0.5, 0.65, 0.85);

-- ============================================================
-- 6. Business Analyst (O*NET 13-1111.00 — Management Analyst)
-- ============================================================
INSERT INTO onet_tasks (occupation, onet_code, task_description, default_weight, capability_score, mode_weight, human_necessity_discount, demand_elasticity_factor) VALUES
('Business Analyst', '13-1111.00', 'Gather and organize information on problems or procedures.',                                                                                                   0.15, 1.0, 0.5, 0.80, 0.85),
('Business Analyst', '13-1111.00', 'Analyze data gathered and develop solutions or alternative methods of proceeding.',                                                                            0.18, 1.0, 0.5, 0.70, 0.85),
('Business Analyst', '13-1111.00', 'Document findings of study and prepare recommendations for implementation of new systems, procedures, or organizational changes.',                             0.15, 1.0, 1.0, 0.85, 0.85),
('Business Analyst', '13-1111.00', 'Plan study of work problems and procedures, such as organizational change, communications, information flow, integrated production methods, inventory control, or cost analysis.', 0.10, 0.5, 0.5, 0.65, 0.85),
('Business Analyst', '13-1111.00', 'Confer with personnel concerned to ensure successful functioning of newly implemented systems or procedures.',                                                  0.10, 0.0, 0.5, 0.45, 0.90),
('Business Analyst', '13-1111.00', 'Interview personnel and conduct on-site observation to ascertain unit functions, work performed, and methods, equipment, and personnel used.',                 0.10, 0.0, 0.5, 0.40, 0.90),
('Business Analyst', '13-1111.00', 'Prepare manuals and train workers in use of new forms, reports, procedures or equipment, according to organizational policy.',                                0.08, 1.0, 1.0, 0.85, 0.85),
('Business Analyst', '13-1111.00', 'Review forms and reports and confer with management and users about format, distribution, and purpose, identifying problems and improvements.',                0.08, 0.5, 0.5, 0.65, 0.85),
('Business Analyst', '13-1111.00', 'Develop and implement records management program for filing, protection, and retrieval of records, and assure compliance with program.',                      0.06, 0.5, 0.5, 0.75, 0.85);
