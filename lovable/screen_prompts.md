# Lovable — Screen Build Prompts

Three screens in one Lovable project. Build in order: Screen 1 → 2 → 3.
Wire to n8n webhook URL once M1 skeleton is confirmed working.

---

## Screen 1 — Role Entry

**Lovable prompt:**
```
Build a clean, mobile-friendly single-page app called TaskShift.

Show one screen with:
- A heading: "What's your role?"
- A subheading: "Find out what AI is actually doing to your week."
- A text input (large, placeholder: "e.g. Financial Analyst, Marketing Manager")
- An email input (placeholder: "Your email — unlocks your roadmap")
- A button labelled "Show my tasks →"

When the button is clicked:
- Disable the button and show "Finding your tasks…"
- POST to [N8N_WEBHOOK_URL] with body:
  { "action": "match_role", "role_input": <text input value>, "email": <email value> }
- On success: store the response in state and show Screen 2 (task re-weight screen)
- On error: show "Something went wrong. Please try again."

Style: white background, dark text, one accent colour (indigo or blue).
Font: system sans-serif. No fancy animations. Keep it fast.
```

---

## Screen 2 — Task Re-weight

**Lovable prompt (after Screen 1 is working):**
```
Add Screen 2 that shows after the API responds with a task list.

Show:
- A heading: "How do you actually spend your week?"
- A subheading: "Adjust each task to match your real week. The total must equal 100%."
- For each task in the response tasks array:
  - The task description text (truncate at 120 chars if long)
  - A number input (0–100) showing the default_weight × 100, rounded to nearest integer
  - Label: "%"
- A running total showing the sum of all inputs (e.g. "Total: 87% — needs to reach 100%")
- A "Calculate my score →" button (disabled until total = 100%)

If match_confidence from the previous response is 'low':
- Show a yellow banner above the task list:
  "We matched you to [matched_occupation] with low confidence. Results are directional, not precise."

When "Calculate my score" is clicked:
- POST to [N8N_WEBHOOK_URL] with body:
  {
    "action": "calculate",
    "role_input": <original role input>,
    "email": <email>,
    "matched_occupation": <matched_occupation from response>,
    "match_confidence": <match_confidence from response>,
    "user_weights": { task_id: weight_decimal, ... }  ← divide input values by 100
  }
- Show "Calculating…" while waiting
- On success: show Screen 3

Notes:
- user_weights values are decimals (0.20 not 20)
- task id comes from the id field of each task object
- Keep the screen scrollable on mobile
```

---

## Screen 3 — Results

**Lovable prompt (after Screen 2 is working):**
```
Add Screen 3 that shows the results after the calculate API responds.

Show these sections in order:

1. SCORES (two side-by-side cards on desktop, stacked on mobile):
   Card A — "Realised Exposure"
     Value: (realised_exposure_score × 100) rounded to 1 decimal + "%"
     Label: "Share of your week AI can already do"
     Tooltip (ℹ icon): "Based on real AI usage in this role today — not just what's theoretically possible."
   Card B — "Displacement Risk"
     Value: (displacement_risk_score × 100) rounded to 1 decimal + "%"
     Label: "Share likely to shift away from this role"
     Tooltip (ℹ icon): "Filtered for real-world friction: trust, regulation, and demand growth."

2. THE AI-NATIVE VERSION (section heading: "What this role looks like when you move up"):
   Display: ai_native_role_text

3. YOUR ROADMAP (section heading: "Three tasks to climb toward this week"):
   Display: roadmap_text (render as a numbered list if it starts with "1.")

4. A small note in grey text at the bottom:
   "These scores reflect your time allocation, not the average for [matched_occupation].
    Change your task weights to see how your score shifts."

5. A "← Start over" link that resets to Screen 1.

If match_confidence is 'low': show the same yellow banner as Screen 2.

Style: consistent with Screen 1. Scores should be prominent but not alarming.
Avoid red colours for the score values. Use indigo/blue or grey.
```

---

## After all 3 screens work

Test checklist before handing to a cold user:
- [ ] Completes full flow on a phone (iOS Safari and/or Android Chrome)
- [ ] Total enforces 100% before Calculate is enabled
- [ ] Degrade banner shows when a nonsense role is entered
- [ ] "Start over" resets cleanly
- [ ] No raw JSON or error messages visible to the user
