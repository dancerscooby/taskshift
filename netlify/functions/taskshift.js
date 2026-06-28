const GROQ_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = 'https://kvjoojdusypekzkvhqsm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ALLOWLIST = ['Art Director', 'Sales Representative'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{"error":"method not allowed"}' };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers: CORS, body: '{"error":"invalid json"}' }; }

  const action = body.action;

  if (action === 'match_role') {
    const roleInput = body.role_input || '';

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
            content: 'You match a job title to exactly one occupation from this list. Reply with ONLY the occupation name, exactly as written. If no reasonable match exists, reply with exactly: UNKNOWN\n\nAllowed occupations:\n- Art Director\n- Sales Representative\n\nRules:\n- Return exactly one name from the list, or UNKNOWN.\n- Do not explain. Do not add punctuation. No quotes.\n- Near-synonyms map to the closest match (e.g. "creative director" -> Art Director, "communication designer" -> Art Director, "graphic designer" -> Art Director, "business development" -> Sales Representative, "merchant exporter" -> Sales Representative, "BD manager" -> Sales Representative).\n- If genuinely ambiguous between two, return UNKNOWN.'
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
      const lcRole = roleInput.toLowerCase();
      const fallbackOcc = (lcRole.includes('sales') || lcRole.includes('buyer') || lcRole.includes('business'))
        ? 'Sales Representative' : 'Art Director';
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ action: 'match_role', matched_occupation: fallbackOcc, match_confidence: 'low', tasks: [] }) };
    }

    const sbResp = await fetch(
      SUPABASE_URL + '/rest/v1/onet_tasks?occupation=eq.' + encodeURIComponent(matched) + '&select=id,task_description,default_weight&order=id',
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
    );
    if (!sbResp.ok) return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Supabase query failed: ' + sbResp.status }) };
    const tasks = await sbResp.json();

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ action: 'match_role', matched_occupation: matched, match_confidence: 'high', tasks }) };
  }

  if (action === 'calculate') {
    const matchedOccupation = body.matched_occupation;
    const matchConfidence = body.match_confidence || 'high';
    const email = body.email || '';
    const roleInput = body.role_input || matchedOccupation;
    const userWeightsRaw = body.user_weights || {};

    const sbResp = await fetch(
      SUPABASE_URL + '/rest/v1/onet_tasks?occupation=eq.' + encodeURIComponent(matchedOccupation) + '&select=id,task_description,default_weight,capability_score,mode_weight,human_necessity_discount,demand_elasticity_factor&order=id',
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
    );
    if (!sbResp.ok) return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Supabase score query failed: ' + sbResp.status }) };
    const tasks = await sbResp.json();

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
      const taskRE = t * c * m;
      const taskDR = t * c * m * h * d;
      realisedExposure += taskRE;
      displacementRisk  += taskDR;
      taskDetails.push({ id: task.id, task_description: task.task_description,
        personal_weight: Math.round(t * 100) / 100,
        realised_contrib: Math.round(taskRE * 1000) / 1000,
        displacement_contrib: Math.round(taskDR * 1000) / 1000 });
    }

    realisedExposure = Math.min(1, Math.max(0, realisedExposure));
    displacementRisk  = Math.min(1, Math.max(0, displacementRisk));
    const reRounded = Math.round(realisedExposure * 1000) / 1000;
    const drRounded = Math.round(displacementRisk  * 1000) / 1000;

    const sorted = [...taskDetails].sort((a, b) => a.displacement_contrib - b.displacement_contrib);
    const tasksToClimbToward = sorted.slice(0, 3).map(t => t.task_description);

    let aiNativeRoleText = null, roadmapText = null;
    try {
      const c2Resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          max_tokens: 400,
          messages: [
            {
              role: 'system',
              content: 'You are writing two things for a working professional who has just seen their AI displacement score. Your job is to give them a map forward, not a verdict.\n\nRules:\n- Do NOT invent numbers, percentages, or scores.\n- Do NOT use doom-score language. No "at risk", "threatened", "replaced", "obsolete".\n- Be specific and actionable. Generic advice is not acceptable.\n- Write in plain, direct language.\n- Base the roadmap strictly on the three tasks provided.'
            },
            {
              role: 'user',
              content: 'Role: ' + matchedOccupation + '\n\nTheir three lowest-displacement tasks (tasks to climb toward):\n1. ' + tasksToClimbToward[0] + '\n2. ' + tasksToClimbToward[1] + '\n3. ' + tasksToClimbToward[2] + '\n\nWrite two things:\n\n[AI_NATIVE_ROLE]\nIn 2 sentences: describe what this role looks like when the person leans into the tasks above. Start with the occupation name.\n\n[ROADMAP]\nThree specific, actionable steps this person can take THIS WEEK. Format as a numbered list. Each item max 2 sentences.'
            }
          ]
        })
      });
      if (c2Resp.ok) {
        const c2Data = await c2Resp.json();
        const raw = (c2Data.choices?.[0]?.message?.content || '').trim();
        const aiIdx = raw.indexOf('[AI_NATIVE_ROLE]');
        const rmIdx = raw.indexOf('[ROADMAP]');
        if (aiIdx !== -1 && rmIdx !== -1) {
          aiNativeRoleText = raw.slice(aiIdx + 16, rmIdx).trim();
          roadmapText = raw.slice(rmIdx + 9).trim();
        } else {
          roadmapText = raw;
        }
      }
    } catch (e) {
      roadmapText = 'Roadmap unavailable.';
    }

    try {
      await fetch(SUPABASE_URL + '/rest/v1/user_submissions', {
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
    } catch (e) { /* non-fatal */ }

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
