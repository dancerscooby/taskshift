require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = 'https://kvjoojdusypekzkvhqsm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Occupation list loaded from Supabase at startup.
// This is the single source of truth — adding rows to onet_tasks
// automatically makes them available after next restart.
//
// SCALING NOTE: this list-in-prompt approach works well up to ~50 occupations.
// Beyond that, replace buildMatchPrompt() with an embedding-based lookup:
//   1. Pre-compute and store title embeddings in Supabase (pgvector)
//   2. Embed the user input at query time
//   3. Nearest-neighbour search → candidate occupation
//   4. Validate candidate exists in onet_tasks before returning
// Everything downstream (fetchTasks, calculate, Supabase write) stays identical.
let occupations = [];

async function loadOccupations() {
  // TODO(importer): replace or supplement this query once scripts/import_onet.js exists.
  // Any script that writes valid rows to onet_tasks (occupation, onet_code, task_description,
  // default_weight, + 4 scoring columns) will be picked up automatically on next restart.
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/onet_tasks?select=occupation&order=occupation`,
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }
  );
  if (!resp.ok) throw new Error('Failed to load occupations from Supabase: ' + resp.status);
  const rows = await resp.json();
  occupations = [...new Set(rows.map(r => r.occupation))].sort();
  console.log(`Loaded ${occupations.length} occupation(s): ${occupations.join(', ')}`);
}

function buildScoreContext(taskDetails, reRounded, drRounded) {
  if (!taskDetails.length || reRounded === 0) return null;
  const topRe = [...taskDetails].sort((a, b) => b.realised_contrib - a.realised_contrib)[0];
  const shortTask = topRe.task_description.split(' ').slice(0, 7).join(' ') + '…';
  const protectionRatio = 1 - drRounded / reRounded;
  let protection;
  if (protectionRatio >= 0.6) {
    protection = 'Human judgment and trust on the highest-exposure tasks keep displacement risk substantially lower than exposure.';
  } else if (protectionRatio >= 0.3) {
    protection = 'Human oversight and contextual factors moderate displacement risk below the raw exposure level.';
  } else {
    protection = 'The high-exposure tasks closely map to role demand, so displacement risk tracks exposure.';
  }
  return `Exposure is led by "${shortTask}" — where AI tools are most actively used in this field today. ${protection}`;
}

function buildMatchPrompt() {
  return [
    'Match a job title to exactly one occupation from the list below.',
    'Reply with ONLY the occupation name, exactly as it appears in the list.',
    'If no occupation is a reasonable match, reply with exactly: UNKNOWN',
    '',
    'Occupations:',
    ...occupations.map(o => `- ${o}`),
    '',
    'Rules:',
    '- One name from the list, or UNKNOWN. Nothing else.',
    '- No punctuation, no quotes, no explanation.',
    '- Use semantic judgment: "software engineer" → Software Developer,',
    '  "dev" → Software Developer, "account exec" → Sales Representative.',
    '- If the role genuinely fits two occupations equally, return UNKNOWN.',
    '- Roles outside the listed fields → UNKNOWN.',
  ].join('\n');
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function parseGroqCall2(raw) {
  const aiIdx = raw.indexOf('[AI_NATIVE_ROLE]');
  const rmIdx = raw.indexOf('[ROADMAP]');
  if (aiIdx !== -1 && rmIdx !== -1 && rmIdx > aiIdx) {
    return {
      aiNativeRoleText: raw.slice(aiIdx + 16, rmIdx).trim(),
      roadmapText: raw.slice(rmIdx + 9).trim()
    };
  }
  const listMatch = raw.match(/\n(1\.\s)/);
  if (listMatch) {
    const splitIdx = raw.indexOf(listMatch[0]);
    return {
      aiNativeRoleText: raw.slice(0, splitIdx).trim(),
      roadmapText: raw.slice(splitIdx + 1).trim()
    };
  }
  return { aiNativeRoleText: null, roadmapText: raw };
}

async function fetchTasks(occupation, scoreColumns = false) {
  const cols = scoreColumns
    ? 'id,task_description,default_weight,capability_score,mode_weight,human_necessity_discount,demand_elasticity_factor'
    : 'id,task_description,default_weight';
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/onet_tasks?occupation=eq.${encodeURIComponent(occupation)}&select=${cols}&order=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }
  );
  if (!resp.ok) throw new Error('Supabase query failed: ' + resp.status);
  return resp.json();
}

app.options('/api/taskshift', (req, res) => res.set(CORS_HEADERS).sendStatus(200));

app.post('/api/taskshift', async (req, res) => {
  res.set(CORS_HEADERS);
  const { action } = req.body;

  // ── MATCH ROLE ────────────────────────────────────────────────────────────
  if (action === 'match_role') {
    const roleInput = (req.body.role_input || '').trim();
    if (!roleInput) return res.status(400).json({ error: 'role_input is required' });

    let groqResp;
    try {
      groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0,
          max_tokens: 30,
          messages: [
            { role: 'system', content: buildMatchPrompt() },
            { role: 'user', content: roleInput }
          ]
        })
      });
    } catch (e) {
      return res.status(502).json({ error: 'Groq unreachable: ' + e.message });
    }

    if (!groqResp.ok) {
      return res.status(502).json({ error: 'Groq Call 1 failed: ' + groqResp.status });
    }

    const groqData = await groqResp.json();
    const matchedRaw = (groqData.choices?.[0]?.message?.content || '').trim();
    const matched = occupations.includes(matchedRaw) ? matchedRaw : null;

    if (!matched) {
      return res.json({
        action: 'match_role',
        match_confidence: 'no_match',
        matched_occupation: null,
        tasks: [],
        supported_occupations: occupations
      });
    }

    try {
      const tasks = await fetchTasks(matched);
      return res.json({ action: 'match_role', matched_occupation: matched, match_confidence: 'high', tasks });
    } catch (e) {
      return res.status(502).json({ error: e.message });
    }
  }

  // ── CALCULATE ─────────────────────────────────────────────────────────────
  if (action === 'calculate') {
    const matchedOccupation = req.body.matched_occupation;
    const matchConfidence = req.body.match_confidence || 'high';
    const email = req.body.email || '';
    const roleInput = req.body.role_input || matchedOccupation;
    const userWeightsRaw = req.body.user_weights || {};

    if (!occupations.includes(matchedOccupation)) {
      return res.status(400).json({ error: 'Unknown occupation: ' + matchedOccupation });
    }

    let tasks;
    try {
      tasks = await fetchTasks(matchedOccupation, true);
    } catch (e) {
      return res.status(502).json({ error: e.message });
    }

    const hasUserWeights = Object.keys(userWeightsRaw).length > 0;
    let rawTotal = 0;
    if (hasUserWeights) {
      for (const task of tasks) rawTotal += parseFloat(userWeightsRaw[String(task.id)] ?? task.default_weight);
    }
    const weightSumOk = !hasUserWeights || (rawTotal >= 0.01 && rawTotal <= 5.0);

    let realisedExposure = 0, displacementRisk = 0;
    const taskDetails = [];

    for (const task of tasks) {
      const rawW = hasUserWeights
        ? parseFloat(userWeightsRaw[String(task.id)] ?? task.default_weight)
        : parseFloat(task.default_weight);
      const t = (weightSumOk && rawTotal > 0) ? rawW / rawTotal : parseFloat(task.default_weight);
      const c = parseFloat(task.capability_score);
      const m = parseFloat(task.mode_weight);
      const h = parseFloat(task.human_necessity_discount);
      const d = parseFloat(task.demand_elasticity_factor);
      const re = t * c * m;
      const dr = t * c * m * h * d;
      realisedExposure += re;
      displacementRisk += dr;
      taskDetails.push({
        id: task.id,
        task_description: task.task_description,
        personal_weight: Math.round(t * 100) / 100,
        realised_contrib: Math.round(re * 1000) / 1000,
        displacement_contrib: Math.round(dr * 1000) / 1000
      });
    }

    realisedExposure = Math.min(1, Math.max(0, realisedExposure));
    displacementRisk  = Math.min(1, Math.max(0, displacementRisk));
    const reRounded = Math.round(realisedExposure * 1000) / 1000;
    const drRounded = Math.round(displacementRisk  * 1000) / 1000;

    const sorted = [...taskDetails].sort((a, b) => a.displacement_contrib - b.displacement_contrib);
    const tasksToClimbToward = sorted.slice(0, 3).map(t => t.task_description);

    const scoreContext = buildScoreContext(taskDetails, reRounded, drRounded);
    let aiNativeRoleText = null, roadmapText = null;
    try {
      const c2Resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          max_tokens: 450,
          messages: [
            {
              role: 'system',
              content: [
                'You write sharp, specific career guidance for someone whose work is being reshaped by AI.',
                'Your output MUST follow this exact format — include both marker lines verbatim:',
                '',
                '[AI_NATIVE_ROLE]',
                '<Exactly 2 sentences. Describe how this role changes as AI handles more routine work — what the person does MORE of, and where their judgment becomes the differentiator. Do NOT summarise the job. Do NOT start with the occupation name. Generic sentences like "X manages Y and collaborates with Z" are unacceptable.>',
                '[ROADMAP]',
                '1. <One concrete action tied to task 1. Max 2 sentences. No padding or explanation.>',
                '2. <One concrete action tied to task 2. Max 2 sentences. No padding or explanation.>',
                '3. <One concrete action tied to task 3. Max 2 sentences. No padding or explanation.>',
                '',
                'Rules:',
                '- Do NOT invent numbers, percentages, or scores.',
                '- Avoid: "at risk", "threatened", "replaced", "obsolete", "navigate", "landscape", "leverage".',
                '- Each roadmap step must name one specific action. No generic advice.',
                '- Sentences under 25 words. Plain, direct language only.'
              ].join('\n')
            },
            {
              role: 'user',
              content: [
                `Role: ${matchedOccupation}`,
                '',
                'Three lowest-displacement tasks (tasks to lean into):',
                `1. ${tasksToClimbToward[0]}`,
                `2. ${tasksToClimbToward[1]}`,
                `3. ${tasksToClimbToward[2]}`
              ].join('\n')
            }
          ]
        })
      });
      if (c2Resp.ok) {
        const c2Data = await c2Resp.json();
        const raw = (c2Data.choices?.[0]?.message?.content || '').trim();
        ({ aiNativeRoleText, roadmapText } = parseGroqCall2(raw));
      }
    } catch { roadmapText = 'Roadmap unavailable.'; }

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_submissions`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json', Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          role_input: roleInput, matched_occupation: matchedOccupation,
          match_confidence: matchConfidence, email,
          task_weights_json: userWeightsRaw,
          realised_exposure_score: reRounded, displacement_risk_score: drRounded,
          ai_native_role_text: aiNativeRoleText, roadmap_text: roadmapText
        })
      });
    } catch { /* non-fatal */ }

    return res.json({
      action: 'calculate', matched_occupation: matchedOccupation, match_confidence: matchConfidence,
      realised_exposure_score: reRounded, displacement_risk_score: drRounded,
      score_context: scoreContext, ai_native_role_text: aiNativeRoleText, roadmap: roadmapText
    });
  }

  return res.status(400).json({ error: 'unknown action', action });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await loadOccupations();
    console.log(`TaskShift running on http://localhost:${PORT}`);
  } catch (e) {
    console.error('FATAL: could not load occupations —', e.message);
    process.exit(1);
  }
});
