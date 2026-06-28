# User Research — Move 1 Interviews

Source of truth for validated user evidence collected in Move 1.
Do not modify without new interview evidence. Do not invent information.

**Interviews conducted:** 3
**MVP runner roles confirmed:** 2 (Interviews 1 and 2). Interview 3 is supporting validation only.

---

## Interview 1

**Participant**
- Role: Creative Direction & Communication Designer
- Industry: Fashion Communication, Lifestyle & Architecture
- Interview stage: Move 1 (by-hand session)

**Typical work**
- Market research
- Trend research
- Case study analysis
- Designing visual assets
- Creating lookbooks
- Building design systems
- Brand documentation

**Time distribution** (self-reported; relative, not exact percentages)
- Designing and design systems: largest share
- Market research, documentation, lookbooks, case studies: variable by project

**AI tools in use**
- ComfyUI (image generation)
- Claude (documentation support, creative ideation)
- Notion (organisation)

**Where AI already helps**
- Creative ideation
- Image generation
- Documentation support

**Where human judgement is required**
- Creative direction
- Reviewing AI output (quality gate before anything is used)
- Brand consistency
- Tone of communication
- Client communication

**Biggest pain point**
Manually searching for marketing news, trends, case studies, and inspiration. This is time-intensive and repetitive but still requires human curation before any output reaches clients.

**Desired change**
Automatic collection and organisation of trends and research, with a human review step retained before anything reaches clients.

---

## Interview 2

**Participant**
- Role: Business Owner
- Business type: Merchant Exporter (international trade)
- Interview stage: Move 1 (by-hand session)

**Typical work**
- Finding international buyers
- Buyer outreach
- Phone calls
- Bulk emails
- Meta Ads
- Export product research

**Main responsibilities**
- Buyer prospecting
- CRM management
- AI-assisted client filtering
- Business development

**Time distribution** (self-reported)
- Buyer discovery: 40%
- Learning / export research: 25%
- Meetings: 15%
- Zoom meetings: 15%
- Email: 5%

**AI tools in use**
- Grok
- ChatGPT
- Gemini
- Claude

**Where AI already helps**
- Data analysis
- CRM management
- Social media
- Buyer research

**Where human judgement is required**
- Sales calls
- Relationship-building with buyers

**Biggest pain point**
Buyer discovery and prospecting — consuming 40% of the working week.

**Desired change**
Automating buyer discovery, qualification, and filtering so more time can be directed toward scaling the business.

---

---

## Interview 3

**Participant**
- Role: Founder & AI Consultant
- Company: AI Consultancy (AI consulting and AI education)
- Background: ~5.5 years in marketing, brand strategy and social media before moving into AI consulting
- Interview stage: Move 1 (additional validation — not a runner role)

**Typical work**
- Researching and evaluating new AI tools
- Learning through experimentation
- AI consulting for businesses and startups
- Teaching AI to individuals and organisations
- Client meetings and consulting calls
- Email communication
- Website development using AI ("vibe coding")
- Lead generation and outbound sales

**Main responsibilities**
- AI-assisted website development
- Client meetings and consulting
- Preparing emails
- Lead generation through cold outreach
- Continuous learning and experimentation with AI tools

**Time distribution** (self-reported; participant noted estimates overlap and vary)
- Website development / vibe coding: ~30–35%
- Client meetings: significant (participant estimated ~70%, acknowledging overlap with other time)
- Emails: ~15%
- Cold outreach and lead generation: ~15–20%

**AI tools in use**
Extensive daily use: GPT, Claude, Gemini, Perplexity, Freepik, Lovable, n8n, Make, Replit, Cursor, Gamma, Beautiful AI, Tome, Chronicle, and numerous image, video and automation tools.

**Where AI already helps**
- Lead generation
- Creative generation
- Website development
- Workflow automation
- Prompt engineering
- Research
- Teaching
- Content creation

**Where human judgement is required**
- Critical thinking
- Creative thinking
- High-quality writing
- Human judgement when designing prompts and solving problems

**Biggest pain point**
Lead generation, prospecting, cold outreach, and follow-up — described as the most repetitive work.

**Desired change**
- Automate initial website/UI generation while keeping technical refinement human-led
- End-to-end lead generation workflows up to the point where a qualified prospect is ready for a real human conversation

---

## O*NET Occupation Matching

### Interview 1 → Art Directors (27-1011.00)

**Reasoning:** The interviewee works at a directorial level — creative direction, design systems, brand documentation — not purely at execution level. The Art Director task list matches on: trend research, formulating design approaches, creating visual elements, reviewing materials, and client confer. The Graphic Designer task list covers execution (file prep, image generation, chart drawing) but is silent on the interviewee's strategic responsibilities. The Art Director match is honest but imperfect: some O*NET Art Director tasks (managing print staff, negotiating with printers) do not apply to this solo practitioner. The match is high confidence for the tasks that do apply.

**Matched occupation name for Supabase and Call 1 allowlist:** `Art Director`
**O*NET code:** 27-1011.00

### Interview 2 → Sales Representatives, Wholesale and Manufacturing (41-4012.00)

**Reasoning:** Despite the business owner title, the interviewee's actual task breakdown (40% buyer discovery, 25% export research, 30% meetings, 5% email) is individual contributor sales/BD work. The Sales Representative task list matches directly: "identify prospective customers," "monitor market conditions," "contact prospective customers," "perform administrative duties (CRM)," and "negotiate details." The Sales Manager list, by contrast, covers staff oversight and organisational management that do not apply. The match is high confidence for the actual work performed.

**Matched occupation name for Supabase and Call 1 allowlist:** `Sales Representative`
**O*NET code:** 41-4012.00

### Interview 3 → No clean single O*NET match (honest low-confidence degrade)

**Candidates evaluated:**
- Computer Systems Analysts (15-1211.00): covers evaluating/recommending software, training users, client consultation. Best technical dimension match, but entirely silent on lead generation (15–20% of week) and vibe coding as a primary output mode.
- Training and Development Specialists (13-1151.00): covers AI teaching, programme design, client needs assessment, contract negotiation. Matches the education dimension well, but also silent on technical implementation and sales.
- Management Analysts (13-1111.00): covers advising, documenting recommendations, training on new procedures. Broadest fit but least technically specific; also silent on lead gen and vibe coding.

**Honest verdict:** No single O*NET occupation matches this role. The work spans at minimum three codes (systems analyst + training specialist + sales representative) and includes vibe coding — a task with no O*NET equivalent at time of build. The closest single approximation is **Computer Systems Analysts (15-1211.00)** for the consulting/implementation/training dimension, but the match confidence is genuinely low.

**Implication for the tool:** This participant would correctly hit the degrade path in the current MVP. That is not a product failure — it is the honest degrade logic working as designed. This interview is a useful real-world test of the degrade UX.

**Runner role status:** Supporting validation only. No Supabase data prepared. No allowlist entry added. See runner role decision below.

---

## Key Insights by Interview

### Interview 1 — Art Director

1. **The highest-exposure task is also the biggest pain point.** Trend and market research is time-consuming, repetitive, and already suited for AI automation — yet the interviewee wants a human gate before any output reaches clients. This maps cleanly to the tool's honesty boundary: AI handles the generation; the person retains the curation.

2. **AI is already deeply embedded in the workflow.** ComfyUI, Claude, and Notion are active tools, not aspirational ones. This person is not AI-anxious — they are an AI practitioner managing where to draw the line.

3. **Human value is curatorial, not generative.** The interviewee does not resist AI generating images or drafts; they resist AI making the final call on brand voice, direction, and client presentation. The value-add is judgment, not production.

4. **The pain is time spent on information gathering, not existential displacement.** Their desired automation (trend aggregation with human review) is a workflow efficiency request, not a fear response.

### Interview 2 — Sales Representative / Merchant Exporter

1. **The most time-consuming task (40% buyer discovery) is also the most automatable.** This is the clearest case of realised exposure in any interview. AI tools are already being used for buyer research, but the process is not yet systematised.

2. **The human line is explicitly relational.** "Sales calls and relationship-building still require humans." This is not a vague intuition — the interviewee has articulated a clear boundary, which maps well to the h_i (human necessity) factor in the formula.

3. **A four-tool AI user seeking more, not less, automation.** Grok, ChatGPT, Gemini, and Claude are all in use. This person is not the "Neha" archetype from the handbook — they are already acting on AI adoption and want the tool to accelerate that.

4. **Opportunity cost is the real framing.** Time on discovery is time not spent scaling. The displacement risk for buyer discovery tasks is real, but this person views it as a feature, not a threat.

### Interview 3 — Founder & AI Consultant

1. **Some tasks have already been displaced, not just exposed.** Vibe coding (30–35% of week) is an activity where AI does the initial generation and the human does refinement and judgment. This is displacement that has already occurred — not a future risk. The tool's three-layer model correctly captures this: high capability score, high mode weight, lower human necessity discount.

2. **Lead generation as a cross-role pain point is now confirmed across two independent interviews.** Interviews 2 and 3 both cite prospecting and cold outreach as the highest-volume repetitive burden. This is strong validation that the Sales Representative task bundle captures a real, recurring pain.

3. **The most advanced AI user articulates the human boundary most precisely.** "Critical thinking, creative thinking, high-quality writing, human judgement when designing prompts and solving problems." This is a more articulate version of what all three participants expressed — the human value is judgment and synthesis, not generation.

4. **Orchestration, not tools, is the next frontier for advanced practitioners.** This participant does not lack AI tools (15+ in daily use). What they want is coordination — end-to-end workflows that reduce the friction between tools. This is a need the current tool does not address, and correctly so: it is out of scope for the MVP.

5. **The role itself is an honest degrade case.** No single O*NET occupation covers this genuinely novel hybrid role. This is a valuable real-world stress test of the degrade path, confirming that the honest degrade design is not hypothetical — real roles will hit it.

---

## Runner Role Decision

**Interview 3 does not replace either runner role.**

Reasons:
1. The user specified this as validation evidence, not automatically a runner.
2. The role has no clean O*NET match — any result would carry a low-confidence banner, producing a weaker Move 5 behavioural signal than the two confirmed runners.
3. The existing runners (Art Director, Sales Representative) are seeded, scored, and ready to insert. Re-seeding for a hybrid role with no clean O*NET code would require significant effort and produce a less honest result.
4. No handbook-based reason exists to change established runners — the grade weighs methodology and real-person evidence, not role diversity.

**Runner roles remain: Art Director (Interview 1) and Sales Representative (Interview 2).**

---

## Cross-Interview Analysis (all three interviews)

### Common pain points
- All three spend significant time on repetitive information-gathering or prospecting tasks (trend research; buyer discovery; lead generation / cold outreach) that they want to reduce.
- Lead generation and prospecting appear explicitly in two of three interviews (Interviews 2 and 3) — this is a validated high-volume pain point, not an individual preference.

### Common AI usage patterns
- All three are already active AI practitioners. None is AI-anxious. The range runs from 3 tools (Interview 1) to 4 (Interview 2) to 15+ (Interview 3).
- All three use AI for production tasks (image generation, buyer research, website generation) while retaining human control over final quality, strategy, and client-facing outputs.
- All three want AI to handle information aggregation and generation; humans retain review, direction, and relationship.

### Common areas requiring human judgement (consistent across all three)
- Client / buyer-facing communication and relationships
- Final approval before output reaches external parties
- Strategic direction, creative direction, deal judgement
- Trust-based interactions that require personal presence

### Key differences across the three professions

| Dimension | Art Director | Sales Representative | AI Consultant |
|---|---|---|---|
| Domain | Creative / subjective | Relational / commercial | Technical / advisory |
| AI in core output | Yes — AI generates primary artifacts | Partial — AI assists research and CRM | Yes — AI generates websites and content |
| Human gate | Brand and tone consistency | Trust and negotiation | Judgment, prompt design, client strategy |
| Primary pain | Research aggregation | Prospecting volume | Lead gen and outreach repetition |
| O*NET match quality | High confidence | High confidence | Low confidence — genuine hybrid role |
| Displacement posture | AI practitioner, workflow efficiency | Aggressive adopter, wants more automation | Already past displacement for many tasks; wants orchestration |

### Validation / challenge of MVP assumptions

**Strengthened by Interview 3:**
- The three-layer distinction (exposure ≠ realised exposure ≠ displacement) is even more visible in this interview. The AI Consultant can clearly articulate which tasks AI has taken (vibe coding), which it assists (research, lead gen), and which remain human (judgment, strategy, client relationships). The tool's framework maps directly onto this lived experience.
- The re-weight screen is essential for all three participants. Each has a time distribution that deviates significantly from any O*NET population average.
- The human-in-the-loop pattern is now consistent across all three, across three different industries. It is a finding, not a coincidence.
- The honest degrade path is validated as a real-world scenario, not a theoretical edge case.

**Persisting honest caveat (strengthened):**
- All three participants are advanced AI practitioners, not the "Neha" archetype from the handbook. The tool's value for this user profile is quantification and roadmap, not discovery of a threat they were unaware of. The Move 5 behavioural signal should therefore be framed around the roadmap ("did they identify a task to climb toward or protect?"), not around the score alarming them.
- The results screen language must avoid doom-score framing especially for Interview 2's buyer discovery score and Interview 3's vibe coding score, both of which will be numerically high.

---

## Product Observations from Interview 3

These are framing observations only. No architecture changes are warranted or proposed.

1. **The degrade path UX matters more than the happy path for novel roles.** Interview 3 would hit it. The degrade banner and message should be genuinely useful — not just "we couldn't match you" but ideally "here is the closest occupation; re-weight the tasks to your actual week and treat the score as directional." This is already in the design; it needs to be clearly written in the results screen copy.

2. **For advanced practitioners, "tasks to climb toward" may read as "tasks to protect."** Both framings are correct given the formula (these are the tasks with lowest displacement contribution), but for someone at Interview 3's level, "protect what the model can't touch" is a more resonant frame than "climb toward." The Groq Call 2 system prompt can accommodate this by asking the model to frame the roadmap either way depending on the score level. This is a copy change, not a structural one.

3. **No additional features are warranted from this interview.** The orchestration need (end-to-end lead gen workflows) is explicitly out of MVP scope and should remain so.

---

## Suggested Follow-up Questions for Move 5

### For Interview 1 (Art Director — runner)
1. After adjusting the task sliders to your real week, did the realised exposure score match what you expected — or surprise you?
2. The roadmap will suggest 3 tasks to lean into. Do those match what you actually want to spend more time on, or does the list miss something important about your work?
3. Trend research shows as your highest-exposure task. Does seeing that in numbers change anything about how you'd structure your week?

### For Interview 2 (Sales Representative — runner)
1. Buyer discovery will likely score high for realised exposure. If AI systematically handled that 40%, what specifically would you do with the time?
2. The roadmap suggests tasks that are harder for AI to take. Do those match your business instincts, or does the tool get it wrong?
3. You already use four AI tools. Does the displacement risk score tell you anything you didn't already know — or does it confirm what you're already acting on?

### For Interview 3 (AI Consultant — validation, if they run the tool)
1. The tool will likely show a low-confidence match for your role. Does the closest-match task list still reflect your actual week meaningfully enough to be useful?
2. For tasks where AI has already taken the primary work (like vibe coding), does seeing those score high for realised exposure feel accurate — or does the tool miss the nuance of "AI does the draft, I do the judgment"?
3. You described wanting better orchestration, not more tools. Does the roadmap point toward that — or does it give you advice you already know?

### For all participants
1. Is there an important task from your actual week that is missing from the task list? (The list is based on O*NET data and may not perfectly reflect your role.)
2. After seeing the results, is there one thing you would act on this week?
3. Would you share this with a colleague — and if not, what would make it worth sharing?
