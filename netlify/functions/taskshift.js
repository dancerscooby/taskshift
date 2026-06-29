const GROQ_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = 'https://kvjoojdusypekzkvhqsm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ALLOWLIST = [
  'Accountant',
  'Art Director',
  'Customer Service Representative',
  'Data Analyst',
  'Graphic Designer',
  'Marketing Manager',
  'Project Manager',
  'Registered Nurse',
  'Sales Representative',
  'Software Developer'
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Parse Groq Call 2 response into ai_native_role_text + roadmap_text.
// Strategy 1: look for [AI_NATIVE_ROLE] / [ROADMAP] markers.
// Strategy 2: fall back to splitting on the first numbered list item "1.".
function parseGroqCall2(raw) {
  const aiIdx = raw.indexOf('[AI_NATIVE_ROLE]');
  const rmIdx = raw.indexOf('[ROADMAP]');
  if (aiIdx !== -1 && rmIdx !== -1 && rmIdx > aiIdx) {
    return {
      aiNativeRoleText: raw.slice(aiIdx + 16, rmIdx).trim(),
      roadmapText: raw.slice(rmIdx + 9).trim()
    };
  }
  // Fallback: split on the first "1." that starts a line
  const listMatch = raw.match(/\n(1\.\s)/);
  if (listMatch) {
    const splitIdx = raw.indexOf(listMatch[0]);
    return {
      aiNativeRoleText: raw.slice(0, splitIdx).trim(),
      roadmapText: raw.slice(splitIdx + 1).trim()
    };
  }
  // Last resort: whole response is roadmap
  return { aiNativeRoleText: null, roadmapText: raw };
}

async function fetchTasks(occupation, scoreColumns = false) {
  const cols = scoreColumns
    ? 'id,task_description,default_weight,capability_score,mode_weight,human_necessity_discount,demand_elasticity_factor'
    : 'id,task_description,default_weight';
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/onet_tasks?occupation=eq.${encodeURIComponent(occupation)}&select=${cols}&order=id`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
  );
  if (!resp.ok) throw new Error('Supabase query failed: ' + resp.status);
  return resp.json();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{"error":"method not allowed"}' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers: CORS, body: '{"error":"invalid json"}' }; }

  const action = body.action;

  // â”€â”€ MATCH ROLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'match_role') {
    const roleInput = body.role_input || '';

    // Groq Call 1 â€” deterministic role match (temp=0, max_tokens=20)
    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 20,
        messages: [
          {
            role: 'system',
            content: [
              'Match a job title to exactly one occupation from the list below.',
              'Reply with ONLY the occupation name, exactly as it appears in the list.',
              'If no occupation is a reasonable match, reply with exactly: UNKNOWN',
              '',
              'Occupations:',
              ...ALLOWLIST.map(o => '- ' + o),
              '',
              'Rules:',
              '- One name from the list, or UNKNOWN. Nothing else.',
              '- No punctuation, no quotes, no explanation.',
              '- Use semantic judgment: "software engineer" -> Software Developer,',
              '  "dev" -> Software Developer, "account exec" -> Sales Representative.',
              '- If the role genuinely fits two occupations equally, return UNKNOWN.',
              '- Roles outside the listed fields -> UNKNOWN.'
            ].join('\n')
          },
          { role: 'user', content: roleInput }
        ]
      })
    });

    if (!groqResp.ok) return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Groq Call 1 failed: ' + groqResp.status }) };
    const groqData = await groqResp.json();
    const matchedRaw = (groqData.choices?.[0]?.message?.content || '').trim();
    const matched = ALLOWLIST.includes(matchedRaw) ? matchedRaw : null;

    if (!matched) {
      return {
        statusCode: 200, headers: CORS,
        body: JSON.stringify({
          action: 'match_role',
          match_confidence: 'no_match',
          matched_occupation: null,
          tasks: [],
          supported_occupations: ALLOWLIST
        })
      };
    }

    // High-confidence match â€” fetch display-only task columns
    try {
      const tasks = await fetchTasks(matched);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ action: 'match_role', matched_occupation: matched, match_confidence: 'high', tasks }) };
    } catch (e) {
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }
  }

  // â”€â”€ CALCULATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'calculate') {
    const matchedOccupation = body.matched_occupation;
    const matchConfidence = body.match_confidence || 'high';
    const email = body.email || '';
    const roleInput = body.role_input || matchedOccupation;
    const userWeightsRaw = body.user_weights || {};

    if (!ALLOWLIST.includes(matchedOccupation)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown occupation: ' + matchedOccupation }) };
    }

    let tasks;
    try {
      tasks = await fetchTasks(matchedOccupation, true);
    } catch (e) {
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: e.message }) };
    }

    // Normalise user weights
    const hasUserWeights = Object.keys(userWeightsRaw).length > 0;
    let rawTotal = 0;
    if (hasUserWeights) {
      for (const task of tasks) rawTotal += parseFloat(userWeightsRaw[String(task.id)] ?? task.default_weight);
    }
    const weightSumOk = !hasUserWeights || (rawTotal >= 0.01 && rawTotal <= 5.0);

    // Formula: realised_exposure = Î£(t_i Â· c_i Â· m_i)
    //          displacement_risk  = Î£(t_i Â· c_i Â· m_i Â· h_i Â· d_i)
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
      const taskRE = t * c * m;
      const taskDR = t * c * m * h * d;
      realisedExposure += taskRE;
      displacementRisk += taskDR;
      taskDetails.push({
        id: task.id,
        task_description: task.task_description,
        personal_weight: Math.round(t * 100) / 100,
        realised_contrib: Math.round(taskRE * 1000) / 1000,
        displacement_contrib: Math.round(taskDR * 1000) / 1000
      });
    }

    realisedExposure = Math.min(1, Math.max(0, realisedExposure));
    displacementRisk = Math.min(1, Math.max(0, displacementRisk));
    const reRounded = Math.round(realisedExposure * 1000) / 1000;
    const drRounded = Math.round(displacementRisk * 1000) / 1000;

    // Three lowest-displacement tasks to surface in the roadmap
    const sorted = [...taskDetails].sort((a, b) => a.displacement_contrib - b.displacement_contrib);
    const tasksToClimbToward = sorted.slice(0, 3).map(t => t.task_description);

    // Groq Call 2 â€” AI-native role description + roadmap (non-fatal)
    let aiNativeRoleText = null, roadmapText = null;
    try {
      const c2Resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          max_tokens: 450,
          messages: [
            {
              role: 'system',
              content: [
                'You write structured career guidance for a working professional.',
                'Your output MUST follow this exact format â€” include the marker lines verbatim:',
                '',
                '[AI_NATIVE_ROLE]',
                '<2 sentences starting with the occupation name>',
                '[ROADMAP]',
                '1. <first step â€” max 2 sentences>',
                '2. <second step â€” max 2 sentences>',
                '3. <third step â€” max 2 sentences>',
                '',
                'Rules:',
                '- Do NOT invent numbers, percentages, or scores.',
                '- No doom-score language: avoid "at risk", "threatened", "replaced", "obsolete".',
                '- Be specific and actionable. Generic advice is not acceptable.',
                '- Base the roadmap strictly on the three tasks provided.',
                '- Write in plain, direct language.'
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
        const parsed = parseGroqCall2(raw);
        aiNativeRoleText = parsed.aiNativeRoleText;
        roadmapText = parsed.roadmapText;
      }
    } catch (e) {
      roadmapText = 'Roadmap unavailable.';
    }

    // Persist to Supabase (non-fatal)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_submissions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json', 'Prefer': 'return=minimal'
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

    return {
      statusCode: 200, headers: CORS,
      body: JSON.stringify({
        action: 'calculate', matched_occupation: matchedOccupation, match_confidence: matchConfidence,
        realised_exposure_score: reRounded, displacement_risk_score: drRounded,
        ai_native_role_text: aiNativeRoleText, roadmap: roadmapText
      })
    };
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action', action }) };
};
