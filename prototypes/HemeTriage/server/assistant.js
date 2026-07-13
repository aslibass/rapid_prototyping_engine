// Claude as an assistant haematology triage expert. It never has the last word:
// it produces an opinion the haematologist reads alongside the CPC protocol.
//
// Two jobs, deliberately separate:
//   extractCase()   — pull structured labs/flags out of a pasted referral letter
//   secondOpinion() — read the WHOLE case, including the narrative facts the CPC
//                     table needs but a lab report never carries (rapid growth,
//                     bulky disease, severe symptoms, a treatable cause)
//
// Neither is load-bearing: with no API key the protocol and sign-off still run.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export const isConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

let client;
function getClient() {
  if (!isConfigured()) throw new Error("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic();
  return client;
}

// A referral letter routinely omits values, and a missing platelet count must come
// back as null rather than a guess. Structured outputs express "or null" with
// anyOf — NOT with a `type: [...]` union, which is rejected outright as soon as the
// member schema carries an enum ("Enum value 'M' does not match declared type").
const orNull = (schema) => ({ anyOf: [schema, { type: "null" }] });

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    age: orNull({ type: "integer" }),
    sex: orNull({ type: "string", enum: ["M", "F"] }),
    hb: orNull({ type: "number", description: "Haemoglobin, g/L" }),
    wbc: orNull({ type: "number", description: "White cell count, x10^9/L" }),
    plt: orNull({ type: "number", description: "Platelets, x10^9/L" }),
    anc: orNull({ type: "number", description: "Absolute neutrophil count, x10^9/L" }),
    ldh: orNull({ type: "number", description: "LDH, U/L" }),
    nodeSizeCm: orNull({ type: "number", description: "Largest nodal mass, cm" }),
    blastsOnFilm: { type: "boolean", description: "Blasts reported on the blood film" },
    feverOrSepsis: { type: "boolean", description: "Fever or clinical signs of sepsis" },
    activeBleeding: { type: "boolean" },
    haemolysis: { type: "boolean", description: "Haemolytic anaemia reported or suspected" },
    lymphadenopathy: { type: "boolean" },
    bSymptoms: { type: "boolean", description: "Fever, drenching night sweats, weight loss or new pruritus" },
    rapidGrowth: { type: "boolean", description: "History of a rapidly growing node" },
    severeSymptoms: { type: "boolean", description: "Severe symptoms attributable to anaemia" },
    missing: {
      type: "array",
      items: { type: "string" },
      description: "Values the letter does not state, so the clinician knows what to fill in",
    },
  },
  required: [
    "age", "sex", "hb", "wbc", "plt", "anc", "ldh", "nodeSizeCm",
    "blastsOnFilm", "feverOrSepsis", "activeBleeding", "haemolysis",
    "lymphadenopathy", "bSymptoms", "rapidGrowth", "severeSymptoms", "missing",
  ],
  additionalProperties: false,
};

const OPINION_SCHEMA = {
  type: "object",
  properties: {
    tier: {
      type: "string",
      enum: ["EMERGENCY", "CATEGORY_1", "CATEGORY_2", "CATEGORY_3", "NOT_REQUIRED"],
    },
    expedite: {
      type: "boolean",
      description: "Category 1 only: should this be expedited to 2 weeks?",
    },
    headline: { type: "string", description: "One sentence: the single most important thing about this case." },
    reasoning: {
      type: "string",
      description:
        "2-4 sentences. Where you rely on something in the narrative that the rule table cannot see, say so explicitly and name it.",
    },
    suggestedWorkup: { type: "array", items: { type: "string" } },
    concerns: {
      type: "array",
      items: { type: "string" },
      description: "Red flags, or missing information that would change the category.",
    },
  },
  required: ["tier", "expedite", "headline", "reasoning", "suggestedWorkup", "concerns"],
  additionalProperties: false,
};

const OPINION_SYSTEM = `You are an experienced consultant haematologist giving a second opinion on the triage of a referral. You are advising a haematologist colleague who makes the final decision — not a patient, and not a layperson.

You are triaging against the Queensland Health Clinical Prioritisation Criteria for Haematology:

  EMERGENCY    — refer to the emergency department now
  CATEGORY_1   — seen within 30 days (may be expedited to 2 weeks)
  CATEGORY_2   — seen within 90 days
  CATEGORY_3   — seen within 365 days
  NOT_REQUIRED — does not meet the referral criteria; manage in primary care

A rule engine has already applied the numeric CPC thresholds to this case. Do not simply repeat it. Your value is the judgements the criteria require but the numbers cannot settle:

  - "without treatable cause" — an iron-deficiency anaemia with an obvious cause (menorrhagia, GI loss) is treatable in primary care. Under the Victorian Statewide Referral Criteria such a referral is expected to be DECLINED rather than queued, not given a slow appointment. Say so when it applies.
  - "severe symptoms" — the letter, not the haemoglobin, tells you this.
  - "rapid growth" and "bulky disease (>5 cm)" — these expedite a Category 1 lymphadenopathy to 2 weeks, and a lab report never carries them.
  - Persistence — a single abnormal count is not a "persistent" one. If the letter does not establish that, say what repeat testing would settle it.

Escalate when the clinical picture genuinely warrants it. But do not inflate a category on reassuring findings: over-referral has a real cost to the patient and to the service, and an unnecessary referral takes a slot from someone who needs it. Be concise and specific. Never state a diagnosis as certain.`;

function firstJson(message) {
  const block = message.content.find((b) => b.type === "text");
  if (!block) throw new Error("Model returned no text block");
  return JSON.parse(block.text);
}

export async function extractCase(note) {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: EXTRACT_SCHEMA },
    },
    system:
      "Extract structured haematology data from a referral letter. Use null for any value the letter does not state — never guess a lab value. Booleans are false unless the letter supports them. Haemoglobin is in g/L: if written as e.g. 6.2 g/dL, convert to 62 g/L.",
    messages: [{ role: "user", content: note }],
  });
  return firstJson(message);
}

export async function secondOpinion({ caseData, protocol }) {
  const labs = [
    `Age/sex: ${caseData.age ?? "?"} ${caseData.sex ?? "?"}`,
    `Hb ${caseData.hb ?? "?"} g/L`,
    `WBC ${caseData.wbc ?? "?"} x10^9/L`,
    `Platelets ${caseData.plt ?? "?"} x10^9/L`,
    `Neutrophils ${caseData.anc ?? "?"} x10^9/L`,
    `LDH ${caseData.ldh ?? "?"} U/L`,
    `Blasts on film: ${yn(caseData.blastsOnFilm)}`,
    `Fever / sepsis: ${yn(caseData.feverOrSepsis)}`,
    `Active bleeding: ${yn(caseData.activeBleeding)}`,
    `Haemolysis: ${yn(caseData.haemolysis)}`,
    `Lymphadenopathy: ${yn(caseData.lymphadenopathy)}`,
    `B symptoms: ${yn(caseData.bSymptoms)}`,
  ].join("\n");

  const firedRules = protocol.rules.filter((r) => r.fired);
  const firedText = firedRules.length
    ? firedRules.map((r) => `  - [${r.tier}] ${r.criterion} (${r.detail})`).join("\n")
    : "  - none";

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: OPINION_SCHEMA },
    },
    system: OPINION_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Referral letter:
"""
${caseData.note?.trim() || "(no narrative supplied — structured values only)"}
"""

Structured values on the form:
${labs}

The CPC rule engine, on the numbers alone, returned ${protocol.label}${protocol.expedite ? " (expedite to 2 weeks)" : ""}. Criteria that fired:
${firedText}
${protocol.needsJudgement.length ? `\nThese fired but depend on a judgement the table cannot make:\n${protocol.needsJudgement.map((c) => `  - ${c}`).join("\n")}` : ""}

Give your own category. If you disagree with the rule engine — in either direction — say what it is missing.`,
      },
    ],
  });
  return firstJson(message);
}

const yn = (v) => (v ? "yes" : "no");
