// Three synthetic referrals, one per tier. No PHI — every detail is invented.
// The AMBER case is written so the numbers look reassuring but the narrative
// does not; that is where the protocol and Claude are meant to part company.

export const SAMPLE_CASES = [
  {
    id: "case-red",
    label: "68M · fatigue, bruising",
    hint: "RED",
    age: 68,
    sex: "M",
    hb: 62,
    wbc: 82,
    plt: 18,
    anc: 0.4,
    blastsOnSmear: true,
    fever: true,
    activeBleeding: false,
    lymphadenopathy: false,
    bSymptoms: false,
    note: `68-year-old man, referred by GP. Three weeks of progressive fatigue and breathlessness on minimal exertion. Extensive bruising over both arms without trauma; gums bled while brushing teeth twice this week. Febrile at 38.4C in the surgery today. No prior haematological history, no anticoagulants.

FBC: Hb 62 g/L, WBC 82 x10^9/L, platelets 18 x10^9/L, neutrophils 0.4 x10^9/L. Film reported by lab as showing numerous blast cells. Appears unwell, pale, tachycardic at 110.`,
  },
  {
    id: "case-amber",
    label: "34F · isolated low platelets",
    hint: "AMBER",
    age: 34,
    sex: "F",
    hb: 128,
    wbc: 6.1,
    plt: 62,
    anc: 3.2,
    blastsOnSmear: false,
    fever: false,
    activeBleeding: false,
    lymphadenopathy: true,
    bSymptoms: true,
    note: `34-year-old woman, referred after an incidental low platelet count on pre-operative bloods. She feels "generally run down". No bleeding, no bruising, no petechiae.

On direct questioning she reports drenching night sweats for the past six weeks, requiring a change of bedding, and unintentional weight loss of about 7 kg. She has noticed a lump in her left neck that she thinks has grown noticeably over the last month; it is non-tender. No recent infection or travel.

FBC: Hb 128 g/L, WBC 6.1 x10^9/L, platelets 62 x10^9/L, neutrophils 3.2 x10^9/L. Film unremarkable, no blasts.`,
  },
  {
    id: "case-green",
    label: "45F · mild anaemia",
    hint: "GREEN",
    age: 45,
    sex: "F",
    hb: 108,
    wbc: 7.4,
    plt: 265,
    anc: 4.1,
    blastsOnSmear: false,
    fever: false,
    activeBleeding: false,
    lymphadenopathy: false,
    bSymptoms: false,
    note: `45-year-old woman referred with a mild anaemia noted at a routine health check. She is asymptomatic apart from mild tiredness she attributes to work. Heavy periods for several years, otherwise well. No bleeding elsewhere, no weight loss, no night sweats, no lumps.

FBC: Hb 108 g/L, MCV 74 fL, WBC 7.4 x10^9/L, platelets 265 x10^9/L, neutrophils 4.1 x10^9/L. Ferritin 8 ug/L. Film shows hypochromic microcytic red cells, no blasts.

Picture is consistent with iron deficiency secondary to menorrhagia. Stable compared with a count taken 8 months ago.`,
  },
];
