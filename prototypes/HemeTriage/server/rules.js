// The department's standard triage protocol, run deterministically.
// Every rule is named and shown to the clinician, fired or not. Nothing here
// calls out to a model — this is the credibility anchor of the demo, and it
// must keep working when the API key is absent.

export const TIERS = {
  RED: { rank: 3, label: "RED", target: "See today / same-day workup" },
  AMBER: { rank: 2, label: "AMBER", target: "See within 2 weeks" },
  GREEN: { rank: 1, label: "GREEN", target: "Routine — 6 weeks / repeat labs" },
};

// Each rule: does it fire on this case, and what tier does it demand?
const RULES = [
  {
    id: "blasts",
    tier: "RED",
    criterion: "Blasts on peripheral smear",
    rationale: "Circulating blasts suggest acute leukaemia until proven otherwise.",
    test: (c) => c.blastsOnSmear === true,
    describe: () => "blasts reported on smear",
  },
  {
    id: "wbc_leukostasis",
    tier: "RED",
    criterion: "WBC > 100 ×10⁹/L",
    rationale: "Risk of leukostasis; needs same-day assessment.",
    test: (c) => num(c.wbc) > 100,
    describe: (c) => `WBC ${c.wbc}`,
  },
  {
    id: "plt_critical",
    tier: "RED",
    criterion: "Platelets < 20 ×10⁹/L",
    rationale: "Spontaneous bleeding risk.",
    test: (c) => num(c.plt) < 20,
    describe: (c) => `platelets ${c.plt}`,
  },
  {
    id: "hb_critical",
    tier: "RED",
    criterion: "Haemoglobin < 70 g/L",
    rationale: "Severe anaemia; may need transfusion.",
    test: (c) => num(c.hb) < 70,
    describe: (c) => `Hb ${c.hb}`,
  },
  {
    id: "neutropenic_fever",
    tier: "RED",
    criterion: "Neutrophils < 0.5 ×10⁹/L with fever",
    rationale: "Febrile neutropenia is a medical emergency.",
    test: (c) => num(c.anc) < 0.5 && c.fever === true,
    describe: (c) => `ANC ${c.anc} with fever`,
  },
  {
    id: "active_bleeding",
    tier: "RED",
    criterion: "Active bleeding with platelets < 50 ×10⁹/L",
    rationale: "Bleeding on a low count needs urgent correction.",
    test: (c) => c.activeBleeding === true && num(c.plt) < 50,
    describe: (c) => `active bleeding, platelets ${c.plt}`,
  },
  {
    id: "plt_moderate",
    tier: "AMBER",
    criterion: "Platelets 20–100 ×10⁹/L without bleeding",
    rationale: "Significant thrombocytopenia; needs assessment but not same-day.",
    test: (c) => num(c.plt) >= 20 && num(c.plt) < 100 && c.activeBleeding !== true,
    describe: (c) => `platelets ${c.plt}, no bleeding reported`,
  },
  {
    id: "lymphadenopathy_b_symptoms",
    tier: "AMBER",
    criterion: "New lymphadenopathy with B symptoms",
    rationale: "Possible lymphoma; expedite imaging and biopsy.",
    test: (c) => c.lymphadenopathy === true && c.bSymptoms === true,
    describe: () => "lymphadenopathy with B symptoms",
  },
  {
    id: "anaemia_moderate",
    tier: "AMBER",
    criterion: "Haemoglobin 70–100 g/L",
    rationale: "Moderate anaemia warrants prompt workup.",
    test: (c) => num(c.hb) >= 70 && num(c.hb) < 100,
    describe: (c) => `Hb ${c.hb}`,
  },
  {
    id: "neutropenia_afebrile",
    tier: "AMBER",
    criterion: "Neutrophils < 1.0 ×10⁹/L without fever",
    rationale: "Neutropenia needs a cause; not urgent while afebrile.",
    test: (c) => num(c.anc) < 1.0 && c.fever !== true,
    describe: (c) => `ANC ${c.anc}, afebrile`,
  },
];

// Missing values must never fire a "less than" rule — an empty platelet field is
// not a platelet count of zero.
function num(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function runProtocol(caseData) {
  const evaluated = RULES.map((rule) => {
    const fired = rule.test(caseData) === true;
    return {
      id: rule.id,
      criterion: rule.criterion,
      tier: rule.tier,
      rationale: rule.rationale,
      fired,
      detail: fired ? rule.describe(caseData) : null,
    };
  });

  const fired = evaluated.filter((r) => r.fired);
  const tier = fired.reduce(
    (worst, r) => (TIERS[r.tier].rank > TIERS[worst].rank ? r.tier : worst),
    "GREEN",
  );

  return {
    tier,
    target: TIERS[tier].target,
    rules: evaluated,
    firedCount: fired.length,
  };
}
