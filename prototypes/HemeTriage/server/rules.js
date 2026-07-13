// THE PROTOCOL — and where it comes from, because a NSW clinician will ask.
//
// Framework (the categories and their timeframes) is NSW Health's State-wide
// Referral Criteria: Emergency "red flags" redirect to ED, then Category 1
// within 30 days, Category 2 within 90 days, Category 3 within 365 days.
//
//   https://www.health.nsw.gov.au/outpatients/referrals/Pages/default.aspx
//
// Thresholds are NOT from NSW — as of July 2026 NSW has not published haematology
// SRC (the specialties due late 2026 are cardiology, nephrology, and respiratory /
// sleep). So the numeric criteria below are taken verbatim from Queensland Health's
// Clinical Prioritisation Criteria for Haematology, which is the closest published
// Australian equivalent. Every rule carries the CPC page it came from.
//
//   https://www.health.qld.gov.au/cpc/haematology
//
// This is deliberately visible in the UI rather than hidden. The rule table is
// configuration, not a hardcode: when a NSW LHD supplies its own criteria, they
// replace the RULES array below and nothing else changes.
//
// The fifth outcome (NOT_REQUIRED) follows Victoria's SRC, where a referral that
// does not meet the criteria is expected to be declined rather than queued.
//
//   https://www.health.vic.gov.au/statewide-referral-criteria
//
// Nothing in this file calls a model. It must keep working with no API key.

export const PROVENANCE = {
  framework: {
    name: "NSW Health State-wide Referral Criteria",
    url: "https://www.health.nsw.gov.au/outpatients/referrals/Pages/default.aspx",
    note: "Category timeframes (30 / 90 / 365 days) and the Emergency red-flag pathway.",
  },
  thresholds: {
    name: "QLD Health Clinical Prioritisation Criteria — Haematology",
    url: "https://www.health.qld.gov.au/cpc/haematology",
    note: "NSW has not published haematology SRC as at July 2026, so the numeric thresholds are Queensland's. Swap the RULES array for local LHD criteria.",
  },
};

export const TIERS = {
  EMERGENCY:    { rank: 4, label: "EMERGENCY",  target: "Refer to ED now (ambulance if needed)" },
  CATEGORY_1:   { rank: 3, label: "CATEGORY 1", target: "Within 30 days" },
  CATEGORY_2:   { rank: 2, label: "CATEGORY 2", target: "Within 90 days" },
  CATEGORY_3:   { rank: 1, label: "CATEGORY 3", target: "Within 365 days" },
  NOT_REQUIRED: { rank: 0, label: "NO REFERRAL", target: "Does not meet referral criteria" },
};

const CPC = "QLD Health CPC — Haematology";

// Anaemia is sex-specific. CPC thresholds below (80 / 100 g/L) are absolute and
// apply to both, but "is this patient anaemic at all" is not.
const anaemic = (c) => {
  const hb = num(c.hb);
  if (Number.isNaN(hb)) return false;
  return hb < (c.sex === "F" ? 120 : 130);
};

const pancytopenicCount = (c) =>
  [num(c.hb) < 100, num(c.anc) < 1.0, num(c.plt) < 100].filter(Boolean).length;

const RULES = [
  // ---------- EMERGENCY ----------
  {
    id: "plt_under_10",
    tier: "EMERGENCY",
    criterion: "Platelets < 10 ×10⁹/L",
    source: `${CPC} — Thrombocytopenia`,
    quote: "All patients with a platelet level of < 10 X 10⁹/l should be urgently referred to Emergency.",
    test: (c) => num(c.plt) < 10,
    describe: (c) => `platelets ${c.plt}`,
  },
  {
    id: "bleeding_low_plt",
    tier: "EMERGENCY",
    criterion: "Low platelets with active bleeding",
    source: `${CPC} — Thrombocytopenia`,
    quote: "All patients with low platelets and active bleeding should be referred to Emergency.",
    test: (c) => c.activeBleeding === true && num(c.plt) < 150,
    describe: (c) => `active bleeding, platelets ${c.plt}`,
  },
  {
    id: "blasts",
    tier: "EMERGENCY",
    criterion: "Circulating blasts on blood film",
    source: `${CPC} — Pancytopenia / Neutropenia (film features)`,
    quote: "Blood film features: disseminated intravascular coagulation, circulating blasts, leucoerythroblastic, raised LDH.",
    test: (c) => c.blastsOnFilm === true,
    describe: () => "blasts reported on film",
  },
  {
    id: "pancytopenia_febrile",
    tier: "EMERGENCY",
    criterion: "Pancytopenia and febrile / unwell",
    source: `${CPC} — Pancytopenia`,
    quote: "Pancytopenia and febrile/unwell.",
    test: (c) => pancytopenicCount(c) >= 3 && c.feverOrSepsis === true,
    describe: () => "pancytopenia with fever",
  },
  {
    id: "severe_pancytopenia",
    tier: "EMERGENCY",
    criterion: "Severe pancytopenia — any 2 of: Hb < 80, neutrophils < 0.5, platelets < 30",
    source: `${CPC} — Pancytopenia`,
    quote: "Severe pancytopenia (any 2 or more of): Hb <80gm/L, Neutrophils <0.5X10⁹/L, Plts <30X10⁹/L.",
    test: (c) =>
      [num(c.hb) < 80, num(c.anc) < 0.5, num(c.plt) < 30].filter(Boolean).length >= 2,
    describe: (c) =>
      [num(c.hb) < 80 && `Hb ${c.hb}`, num(c.anc) < 0.5 && `ANC ${c.anc}`, num(c.plt) < 30 && `platelets ${c.plt}`]
        .filter(Boolean).join(", "),
  },
  {
    id: "neutropenia_sepsis",
    tier: "EMERGENCY",
    criterion: "Neutrophils < 1.0 ×10⁹/L with signs of sepsis",
    source: `${CPC} — Neutropenia (isolated)`,
    quote: "Any patient with a neutropenia <1.0 X 10⁹/l and signs of sepsis should be urgently referred to Emergency.",
    test: (c) => num(c.anc) < 1.0 && c.feverOrSepsis === true,
    describe: (c) => `ANC ${c.anc} with fever / sepsis`,
  },
  {
    id: "haemolysis",
    tier: "EMERGENCY",
    criterion: "Haemolytic anaemia",
    source: `${CPC} — Chronic anaemia`,
    quote: "Haemolytic anaemia ... warrants emergency department referral.",
    test: (c) => c.haemolysis === true,
    describe: () => "haemolysis reported",
  },
  {
    id: "ldh_1000",
    tier: "EMERGENCY",
    criterion: "Lymphadenopathy with LDH > 1000",
    source: `${CPC} — Lymphadenopathy for investigation`,
    quote: "Elevated LDH >1000.",
    test: (c) => c.lymphadenopathy === true && num(c.ldh) > 1000,
    describe: (c) => `LDH ${c.ldh} with lymphadenopathy`,
  },

  // ---------- CATEGORY 1 — within 30 days ----------
  {
    id: "plt_under_30",
    tier: "CATEGORY_1",
    criterion: "Persistent platelets < 30 ×10⁹/L",
    source: `${CPC} — Thrombocytopenia`,
    quote: "Persistent platelet level < 30 X 10⁹/l.",
    test: (c) => num(c.plt) >= 10 && num(c.plt) < 30,
    describe: (c) => `platelets ${c.plt}`,
  },
  {
    id: "anc_under_0_5",
    tier: "CATEGORY_1",
    criterion: "Isolated neutrophils < 0.5 ×10⁹/L, no sepsis",
    source: `${CPC} — Neutropenia (isolated)`,
    quote: "Isolated Neutrophil level <0.5 X 10⁹/l with no sepsis.",
    test: (c) => num(c.anc) < 0.5 && c.feverOrSepsis !== true,
    describe: (c) => `ANC ${c.anc}, no sepsis`,
  },
  {
    id: "hb_under_80",
    tier: "CATEGORY_1",
    criterion: "Hb < 80 g/L, or Hb 80–100 g/L with severe symptoms",
    source: `${CPC} — Chronic anaemia`,
    quote: "Hb level of < 80gm/l or Hb level of 80-100gm/l with severe symptoms.",
    test: (c) =>
      num(c.hb) < 80 || (num(c.hb) >= 80 && num(c.hb) < 100 && c.severeSymptoms === true),
    describe: (c) => `Hb ${c.hb}${c.severeSymptoms ? " with severe symptoms" : ""}`,
  },
  {
    id: "pancytopenia_cat1",
    tier: "CATEGORY_1",
    criterion: "Any 2 of: Hb < 100, neutrophils < 1.0, platelets < 75",
    source: `${CPC} — Pancytopenia`,
    quote: "Any 2 of the following: Hb level of < 100g/l, Neutrophil level <1.0 X 10⁹/l, Platelet level <75 X 10⁹/l.",
    test: (c) =>
      [num(c.hb) < 100, num(c.anc) < 1.0, num(c.plt) < 75].filter(Boolean).length >= 2,
    describe: (c) =>
      [num(c.hb) < 100 && `Hb ${c.hb}`, num(c.anc) < 1.0 && `ANC ${c.anc}`, num(c.plt) < 75 && `platelets ${c.plt}`]
        .filter(Boolean).join(", "),
  },
  {
    id: "lymphadenopathy",
    tier: "CATEGORY_1",
    criterion: "Abnormal lymph node, not yet biopsied",
    source: `${CPC} — Lymphadenopathy for investigation`,
    quote: "Abnormal lymph node detected clinically or via imaging without biopsy (or inconclusive biopsy).",
    test: (c) => c.lymphadenopathy === true,
    describe: () => "lymphadenopathy for investigation",
  },

  // ---------- CATEGORY 2 — within 90 days ----------
  {
    id: "plt_30_75",
    tier: "CATEGORY_2",
    criterion: "Persistent platelets 30–75 ×10⁹/L",
    source: `${CPC} — Thrombocytopenia`,
    quote: "Persistent platelet level 30-75 X 10⁹/l.",
    test: (c) => num(c.plt) >= 30 && num(c.plt) <= 75,
    describe: (c) => `platelets ${c.plt}`,
  },
  {
    id: "anc_0_5_1",
    tier: "CATEGORY_2",
    criterion: "Isolated neutrophils 0.5–1.0 ×10⁹/L, no sepsis",
    source: `${CPC} — Neutropenia (isolated)`,
    quote: "Isolated Neutrophil level 0.5 – 1 X 10⁹/l with no sepsis.",
    test: (c) => num(c.anc) >= 0.5 && num(c.anc) <= 1.0 && c.feverOrSepsis !== true,
    describe: (c) => `ANC ${c.anc}, no sepsis`,
  },
  {
    id: "hb_80_100",
    tier: "CATEGORY_2",
    criterion: "Hb 80–100 g/L without a treatable cause",
    source: `${CPC} — Chronic anaemia`,
    quote: "Hb level of 80-100gm/l without treatable cause.",
    // "Treatable cause" is a clinical judgement the rule table cannot make.
    // It fires on the number; excluding a treatable cause is left to the clinician.
    test: (c) => num(c.hb) >= 80 && num(c.hb) < 100,
    describe: (c) => `Hb ${c.hb} — treatable cause must be excluded clinically`,
    judgement: true,
  },
  {
    id: "neutrophilia_15",
    tier: "CATEGORY_2",
    criterion: "Neutrophils > 15 ×10⁹/L",
    source: `${CPC} — Neutrophilia`,
    quote: "Neutrophil count > 15 X 10⁹/l.",
    test: (c) => num(c.anc) > 15,
    describe: (c) => `ANC ${c.anc}`,
  },

  // ---------- CATEGORY 3 — within 365 days ----------
  {
    id: "plt_75_150",
    tier: "CATEGORY_3",
    criterion: "Persistently low platelets > 75 ×10⁹/L",
    source: `${CPC} — Thrombocytopenia`,
    quote: "Persistently low platelet level > 75 X 10⁹/l.",
    test: (c) => num(c.plt) > 75 && num(c.plt) < 150,
    describe: (c) => `platelets ${c.plt}`,
  },
  {
    id: "anc_1_1_5",
    tier: "CATEGORY_3",
    criterion: "Isolated neutrophils 1.0–1.5 ×10⁹/L",
    source: `${CPC} — Neutropenia (isolated)`,
    quote: "Isolated Neutrophil level 1.0 – 1.5 X 10⁹/l.",
    test: (c) => num(c.anc) > 1.0 && num(c.anc) <= 1.5,
    describe: (c) => `ANC ${c.anc}`,
  },
  {
    id: "hb_isolated_low",
    tier: "CATEGORY_3",
    criterion: "Isolated low Hb > 100 g/L without a treatable cause",
    source: `${CPC} — Chronic anaemia`,
    quote: "Isolated low Hb >100 without treatable cause.",
    // Same judgement call as above — and the one most often got wrong. An iron
    // deficiency with an obvious cause is treatable in primary care and, under
    // the Victorian SRC, would be declined rather than queued.
    test: (c) => num(c.hb) >= 100 && anaemic(c),
    describe: (c) => `Hb ${c.hb} (low for ${c.sex === "F" ? "female" : "male"}) — treatable cause must be excluded clinically`,
    judgement: true,
  },
];

// Category 1 lymphadenopathy is expedited to 2 weeks on any of these. Two of
// them (bulky >5cm, rapid growth) are narrative facts a lab report never carries.
const EXPEDITE = [
  { id: "b_symptoms", label: "Fever, night sweats, weight loss or new pruritus", test: (c) => c.bSymptoms === true },
  { id: "raised_ldh", label: "Raised LDH", test: (c) => num(c.ldh) > 250 },
  { id: "bulky", label: "Bulky disease (>5 cm nodal mass)", test: (c) => num(c.nodeSizeCm) > 5 },
  { id: "rapid_growth", label: "Clinical history of rapid growth", test: (c) => c.rapidGrowth === true },
  { id: "new_cytopenia", label: "Recent onset cytopenia", test: (c) => pancytopenicCount(c) >= 1 },
];

// A blank field is not a zero. Missing values must never satisfy a "less than".
function num(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function runProtocol(caseData) {
  const rules = RULES.map((rule) => {
    const fired = rule.test(caseData) === true;
    return {
      id: rule.id,
      criterion: rule.criterion,
      tier: rule.tier,
      source: rule.source,
      quote: rule.quote,
      judgement: Boolean(rule.judgement),
      fired,
      detail: fired ? rule.describe(caseData) : null,
    };
  });

  const fired = rules.filter((r) => r.fired);
  const tier = fired.reduce(
    (worst, r) => (TIERS[r.tier].rank > TIERS[worst].rank ? r.tier : worst),
    "NOT_REQUIRED",
  );

  // Expedite only applies to a Category 1 lymphadenopathy referral.
  const expediteReasons =
    tier === "CATEGORY_1" && caseData.lymphadenopathy === true
      ? EXPEDITE.filter((e) => e.test(caseData)).map((e) => e.label)
      : [];

  return {
    tier,
    label: TIERS[tier].label,
    target: expediteReasons.length ? "Expedite to 2 weeks" : TIERS[tier].target,
    expedite: expediteReasons.length > 0,
    expediteReasons,
    rules,
    firedCount: fired.length,
    // Rules that fired but depend on a clinical judgement the table cannot make.
    needsJudgement: fired.filter((r) => r.judgement).map((r) => r.criterion),
  };
}
