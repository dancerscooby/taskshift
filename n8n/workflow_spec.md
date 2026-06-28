# n8n Workflow Specification — TaskShift

Build this workflow in n8n. Each step maps to one node.
The skeleton (M1) uses mocks for steps 3–6; replace one at a time per MILESTONES M6–M9.

---

## Webhook payload shape (from Lovable)

### Screen 1 submit (role + email only):
```json
{
  "action": "match_role",
  "role_input": "financial analyst",
  "email": "user@example.com"
}
```

### Screen 2 submit (add personal weights):
```json
{
  "action": "calculate",
  "role_input": "financial analyst",
  "email": "user@example.com",
  "matched_occupation": "Financial Analyst",
  "match_confidence": "high",
  "user_weights": {
    "42": 0.20,
    "43": 0.10,
    "44": 0.05
  }
}
```
(task IDs are the `id` values from `onet_tasks`)

---

## Node-by-node build guide

### Node 1 — Webhook
- Type: Webhook
- Method: POST
- Path: /taskshift
- Authentication: None (MVP)
- Response mode: "Last node"

### Node 2 — Route by action
- Type: Switch
- Field: `{{ $json.action }}`
- Branch A: "match_role" → go to Node 3
- Branch B: "calculate"  → go to Node 4 (skip Node 3)

---

### Branch A: match_role flow

### Node 3 — Groq Call 1 (role matching)
- Type: HTTP Request
- Method: POST
- URL: https://api.groq.com/openai/v1/chat/completions
- Headers: Authorization: Bearer {{$env.GROQ_API_KEY}}
- Body (JSON):
```json
{
  "model": "llama-3.3-70b-versatile",
  "temperature": 0,
  "max_tokens": 20,
  "messages": [
    {
      "role": "system",
      "content": "<paste full system prompt from prompts/call1_role_match.txt>"
    },
    {
      "role": "user",
      "content": "{{ $json.role_input }}"
    }
  ]
}
```
- Extract: `{{ $json.choices[0].message.content.trim() }}`

### Node 3b — Parse match result
- Type: Code (JavaScript)
```javascript
const ALLOWED = [
  'Financial Analyst', 'Software Developer', 'Marketing Manager',
  'Data Scientist', 'HR Specialist', 'Business Analyst'
];
const raw = items[0].json.choices[0].message.content.trim();
const matched = ALLOWED.find(o => o.toLowerCase() === raw.toLowerCase()) || null;
const confidence = matched ? 'high' : 'low';
const closestFallback = matched || 'Financial Analyst'; // replace with keyword logic if desired

return [{
  json: {
    ...items[0].json,
    matched_occupation: matched || closestFallback,
    match_confidence: confidence,
    role_input: items[0].json.role_input,
    email: items[0].json.email,
  }
}];
```

### Node 3c — Fetch task bundle from Supabase
- Type: Supabase (or HTTP Request to Supabase REST)
- GET `onet_tasks` WHERE `occupation = {{ $json.matched_occupation }}`
- Order by `id` ASC
- Only if match_confidence = 'high'. If 'low', skip and return degrade response.

### Node 3d — Return task list to Lovable
- Type: Respond to Webhook
- Body:
```json
{
  "matched_occupation": "{{ $json.matched_occupation }}",
  "match_confidence": "{{ $json.match_confidence }}",
  "tasks": "{{ $json.data }}"
}
```

---

### Branch B: calculate flow

### Node 4 — Fetch task bundle
- Same Supabase fetch as Node 3c, using `matched_occupation` from payload.

### Node 5 — Formula (deterministic)
- Type: Code (JavaScript)
- Paste full content of `n8n/formula.js`
- Input: `tasks` from Node 4 + `user_weights` from webhook payload

### Node 6 — Groq Call 2 (roadmap)
- Type: HTTP Request (same structure as Node 3)
- Model: llama-3.3-70b-versatile, temperature: 0.4, max_tokens: 400
- System prompt: paste from `prompts/call2_roadmap.txt`
- User message: fill template with matched_occupation + tasksToClimbToward[0,1,2]
- Only fire if match_confidence = 'high'

### Node 7 — Parse Call 2 response
- Type: Code (JavaScript)
```javascript
const raw = items[0].json.choices[0].message.content;
const aiNativeMatch = raw.match(/\[AI_NATIVE_ROLE\]([\s\S]*?)(?=\[ROADMAP\]|$)/);
const roadmapMatch  = raw.match(/\[ROADMAP\]([\s\S]*?)$/);

return [{
  json: {
    ...items[0].json,
    ai_native_role_text: aiNativeMatch ? aiNativeMatch[1].trim() : null,
    roadmap_text:        roadmapMatch  ? roadmapMatch[1].trim()  : raw.trim(),
  }
}];
```

### Node 8 — Save to Supabase
- Type: Supabase INSERT into `user_submissions`
- Fields:
  - role_input: from webhook
  - matched_occupation: from Node 3b or payload
  - match_confidence: from Node 3b or payload
  - email: from webhook ← never return this to frontend
  - task_weights_json: from webhook user_weights
  - realised_exposure_score: from Node 5
  - displacement_risk_score: from Node 5
  - ai_native_role_text: from Node 7
  - roadmap_text: from Node 7

### Node 9 — Return results to Lovable
- Type: Respond to Webhook
- Body (do NOT include email):
```json
{
  "matched_occupation":      "...",
  "match_confidence":        "high",
  "realised_exposure_score": 0.42,
  "displacement_risk_score": 0.29,
  "tasks":                   [...],
  "tasksToClimbToward":      [...],
  "ai_native_role_text":     "...",
  "roadmap_text":            "..."
}
```

---

## Walking skeleton (M1) — mock values to use before real nodes exist

Replace every real node with its mock equivalent for the skeleton pass:
- Node 3 mock: return `{ matched_occupation: "Financial Analyst", match_confidence: "high" }`
- Node 3c mock: return one hardcoded task row
- Node 5 mock: return `{ realisedExposure: 0.42, displacementRisk: 0.29 }`
- Node 6 mock: return `{ ai_native_role_text: "MOCK ROLE", roadmap_text: "1. Step one\n2. Step two\n3. Step three" }`

Skeleton success = typing anything in Lovable and seeing mock results displayed on screen.

---

## Environment variables needed in n8n
| Variable | Value |
|---|---|
| GROQ_API_KEY | your Groq API key |
| SUPABASE_URL | https://yourproject.supabase.co |
| SUPABASE_ANON_KEY | your Supabase anon/public key |
