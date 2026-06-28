// TaskShift — n8n Function Node: Deterministic Formula
// Milestone M7. Runs AFTER Supabase task bundle fetch and BEFORE Groq Call 2.
//
// Expected input from previous node:
//   items[0].json.tasks        — array of onet_tasks rows for the matched occupation
//   items[0].json.userWeights  — object { task_id (string): raw_weight (number) }
//                                If absent, default_weight is used for each task.
//
// Formula (handbook p.16):
//   realised_exposure  = Σ ( t_i · c_i · m_i )
//   displacement_risk  = Σ ( t_i · c_i · m_i · h_i · d_i )
//
// t_i = user's personal weight for task i (normalised to sum = 1.0)
//       → this is the load-bearing personal link (ARCHITECTURE §3)
// All other values are deterministic table lookups; never LLM-generated.

const tasks = items[0].json.tasks;
const userWeightsRaw = items[0].json.userWeights || {};

// Normalise user weights. If user provided none, fall back to default_weight.
const hasUserWeights = Object.keys(userWeightsRaw).length > 0;

let rawTotal = 0;
if (hasUserWeights) {
  for (const task of tasks) {
    const w = parseFloat(userWeightsRaw[task.id] ?? task.default_weight);
    rawTotal += w;
  }
}

// Guard: if weights are wildly off (sum < 0.01 or > 5), flag and fall back.
const weightSumOk = !hasUserWeights || (rawTotal >= 0.01 && rawTotal <= 5.0);

let realisedExposure = 0;
let displacementRisk  = 0;
const taskDetails = [];

for (const task of tasks) {
  const rawW = hasUserWeights
    ? parseFloat(userWeightsRaw[task.id] ?? task.default_weight)
    : parseFloat(task.default_weight);

  // Normalise so weights always sum to 1.0
  const t = weightSumOk && rawTotal > 0 ? rawW / rawTotal : parseFloat(task.default_weight);
  const c = parseFloat(task.capability_score);
  const m = parseFloat(task.mode_weight);
  const h = parseFloat(task.human_necessity_discount);
  const d = parseFloat(task.demand_elasticity_factor);

  const taskRE = t * c * m;
  const taskDR = t * c * m * h * d;

  realisedExposure += taskRE;
  displacementRisk  += taskDR;

  taskDetails.push({
    id:               task.id,
    task_description: task.task_description,
    personal_weight:  Math.round(t * 100) / 100,
    capability_score: c,
    mode_weight:      m,
    realised_contrib: Math.round(taskRE * 1000) / 1000,
    displacement_contrib: Math.round(taskDR * 1000) / 1000,
  });
}

// Clamp to [0, 1] (floating point safety)
realisedExposure = Math.min(1, Math.max(0, realisedExposure));
displacementRisk  = Math.min(1, Math.max(0, displacementRisk));

// Identify top 3 lowest-displacement tasks (tasks to climb toward) for Groq Call 2
const sorted = [...taskDetails].sort(
  (a, b) => a.displacement_contrib - b.displacement_contrib
);
const tasksToClimbToward = sorted.slice(0, 3).map(t => t.task_description);

return [{
  json: {
    ...items[0].json,                    // pass everything forward
    realisedExposure:   Math.round(realisedExposure * 1000) / 1000,
    displacementRisk:   Math.round(displacementRisk  * 1000) / 1000,
    taskDetails,
    tasksToClimbToward,
    weightNormalisationOk: weightSumOk,
  },
}];
