// Claude as an assistant hematology triage expert. It never has the last word:
// it produces an opinion the hematologist reads alongside the protocol.
//
// Two jobs, deliberately separate:
//   extractCase()   — pull structured labs/flags out of a pasted referral letter
//   secondOpinion() — read the WHOLE case (including the narrative the rule
//                     table cannot see) and argue for a tier
//
// Neither is load-bearing for the protocol: if there is no API key, the form
// and the rules engine still run.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export const isConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

let client;
function getClient() {
  if (!isConfigured()) throw new Error("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic();
  return client;
}

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    age: { type: ["integer", "null"] },
    sex: { type: ["string", "null"], enum: ["M", "F", null] },
    hb: { type: ["number", "null"], description: "Haemoglobin in g/L" },
    wbc: { type: ["number", "null"], description: "White cell count, x10^9/L" },
    plt: { type: ["number", "null"], description: "Platelets, x10^9/L" },
    anc: { type: ["number", "null"], description: "Absolute neutrophil count, x10^9/L" },
    blastsOnSmear: { type: "boolean" },
    fever: { type: "boolean" },
    activeBleeding: { type: "boolean" },
    lymphadenopathy: { type: "boolean" },
    bSymptoms: {
      type: "boolean",
      description: "Fever, drenching night sweats or unintentional weight loss",
    },
    missing: {
      type: "array",
      items: { type: "string" },
      description: "Fields the letter does not state, so the clinician knows what to fill in",
    },
  },
  required: [
    "age", "sex", "hb", "wbc", "plt", "anc",
    "blastsOnSmear", "fever", "activeBleeding",
    "lymphadenopathy", "bSymptoms", "missing",
  ],
  additionalProperties: false,
};

const OPINION_SCHEMA = {
  type: "object",
  properties: {
    tier: { type: "string", enum: ["RED", "AMBER", "GREEN"] },
    headline: {
      type: "string",
      description: "One sentence: the single most important thing about this case.",
    },
    reasoning: {
      type: "string",
      description:
        "2-4 sentences of clinical reasoning. Say explicitly if you are weighting something in the narrative that the lab numbers alone would miss.",
    },
    suggestedWorkup: {
      type: "array",
      items: { type: "string" },
      description: "Concrete next investigations, most important first.",
    },
    concerns: {
      type: "array",
      items: { type: "string" },
      description: "Red flags or missing information that would change the tier.",
    },
  },
  required: ["tier", "headline", "reasoning", "suggestedWorkup", "concerns"],
  additionalProperties: false,
};

const OPINION_SYSTEM = `You are an experienced consultant haematologist giving a second opinion on referral triage. You are advising a haematologist colleague, who makes the final decision — not a patient, and not a layperson.

The department's rule-based protocol has already scored this case on the lab values alone. Your value is reading the whole referral, including the narrative history the protocol cannot see. Where the story and the numbers point in different directions, say so plainly and argue your case.

Tiers:
  RED   — see today; suspected haematological emergency or possible acute leukaemia
  AMBER — see within 2 weeks; needs expedited workup
  GREEN — routine (6 weeks) or repeat labs and watch

Err toward the more urgent tier when the clinical picture is genuinely worrying, but do not inflate a tier on reassuring findings — over-triage has a real cost to the patient and the service. Be concise and specific. Never state a diagnosis as certain.`;

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
      "Extract structured haematology data from a referral letter. Use null for any value the letter does not state — never guess a lab value. Booleans are false unless the letter supports them. Haemoglobin is in g/L (if it is written as e.g. 6.2 g/dL, convert to 62 g/L).",
    messages: [{ role: "user", content: note }],
  });
  return firstJson(message);
}

export async function secondOpinion({ caseData, protocolTier }) {
  const labs = [
    `Age/sex: ${caseData.age ?? "?"} ${caseData.sex ?? ""}`,
    `Hb ${caseData.hb ?? "?"} g/L`,
    `WBC ${caseData.wbc ?? "?"} x10^9/L`,
    `Platelets ${caseData.plt ?? "?"} x10^9/L`,
    `Neutrophils ${caseData.anc ?? "?"} x10^9/L`,
    `Blasts on smear: ${caseData.blastsOnSmear ? "yes" : "no"}`,
    `Fever: ${caseData.fever ? "yes" : "no"}`,
    `Active bleeding: ${caseData.activeBleeding ? "yes" : "no"}`,
    `Lymphadenopathy: ${caseData.lymphadenopathy ? "yes" : "no"}`,
    `B symptoms: ${caseData.bSymptoms ? "yes" : "no"}`,
  ].join("\n");

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

The protocol scored this case as ${protocolTier} on the numbers alone.

Give your own tier and reasoning. If you disagree with the protocol, say what it is missing.`,
      },
    ],
  });
  return firstJson(message);
}
