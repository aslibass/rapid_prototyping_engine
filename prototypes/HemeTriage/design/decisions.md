# Design decisions: HemeTriage

## The reframe

The first instinct was a triage calculator: symptoms in, urgency out. That was rejected.
What clinicians asked for was narrower and more defensible:

> "Show them we are using *their* standard rules, but also give the haematologist an
> opinion from an assistant haematology triage expert — so the haematologist has the
> final say."

That makes it a **decision-support cockpit with a human adjudicator**: the protocol, an
assistant, and a signature. The output of record is the haematologist's category, not the
model's.

## Where the protocol actually comes from

The first build invented its thresholds, which would not have survived a NSW consultant's
first question. The rule table is now sourced, and the sourcing is deliberately visible in
the interface rather than buried:

- **The categories are NSW's.** NSW Health's State-wide Referral Criteria use Emergency
  "red flags" that redirect to ED, then Category 1 (30 days), Category 2 (90 days),
  Category 3 (365 days).
- **The thresholds are Queensland's.** As at July 2026 NSW has *not* published haematology
  SRC — the specialties due late 2026 are cardiology, nephrology, and respiratory/sleep,
  and NSW LHDs publish no numeric criteria of their own (Prince of Wales simply says "phone
  the registrar"). Queensland Health's Clinical Prioritisation Criteria for Haematology is
  the closest published Australian equivalent, so every threshold is taken from it and every
  rule cites the CPC page it came from.
- **A fifth outcome — decline.** Under the Victorian SRC a referral that does not meet the
  criteria is expected to be declined rather than queued. That is a real triage answer, and
  without it the app would have no way to say "this doesn't need haematology at all".

This is a strength in the room, not a fudge: it demonstrates that the rule table is
**configuration, not a hardcode**. Swap the `RULES` array for a local LHD's criteria and
nothing else in the system changes.

## Disagreement is the feature

The criteria themselves contain judgements the numbers cannot settle — and those are
exactly where the two opinions come apart:

- *"without treatable cause"* (chronic anaemia). An iron deficiency with an obvious cause
  is treatable in primary care. The rule fires on the haemoglobin; only the letter says
  there is a ferritin of 8 and years of menorrhagia. The protocol queues it at 365 days;
  a clinician reading the letter may decline it outright.
- *"rapid growth"*, *"bulky disease (>5 cm)"*, *"severe symptoms"*. These expedite a
  Category 1 lymphadenopathy to two weeks, and a blood count never carries them.

So the assistant is not a second opinion on the same evidence — it reads evidence the rule
table structurally cannot see. When the two differ, that difference is the whole argument
for AI-as-assistant, and it is where clinicians feel the safety of having the last word.

## Why the rules are not an LLM

Letting Claude assign the category directly would be less code and more flexible. It was
rejected: a haematology audience's first question is *"on what basis?"*, and "the model
decided" does not survive that room. A cited rule table that fires by name does. It also
means the protocol keeps working with no API key, no network, and no latency — the part of
the demo that must never break in front of an audience.

## Visual direction

Grounded in the subject's own artifacts rather than a generic clinical-SaaS look.

**The referral is set as a pathology report**, because that is the document a haematologist
actually reads: fixed-width values, reference ranges, and live H/L out-of-range flags in the
margin. The flags that exist *only in the letter* (rapid growth, severe symptoms) are
coloured violet and labelled as such — the interface itself points at the gap the assistant
fills.

**The palette is taken from a Romanowsky-stained film** — violet-black nuclei, eosin
orange, the violet cast of lab paper — rather than the cream-and-terracotta or
black-and-acid-green that AI-generated interfaces currently default to. The tier ramp runs
hot (emergency) to cool (no referral), so colour and position encode the same ordinal fact.

**Three typefaces, each with one job**: monospace for anything that is a *value*, serif for
the assistant's prose (it reads as a colleague's note), sans for interface chrome.

### The signature: the decision rail

The five categories are **ordinal**, so the distance between two opinions is a real
quantity. The sign-off bar is a rail with the five categories as stops. The protocol rides
it as a filled square, the assistant as a hollow ring. When they agree the markers line up.
When they differ, **the span between them fills with a hatched band** and the interface
states the distance — "1 APART". You then place your own answer by pressing a stop on the
same line.

Disagreement becomes spatial rather than textual, and the thing that measures it is the same
control you use to resolve it. There is no third marker for the clinician: the pressed stop
*is* their answer, which removes a collision and one piece of ornament.

## Safety choices baked into the interface

- **Override requires a reason.** Departing from either opinion demands a one-line
  rationale before sign-off — which is what makes the log worth reading.
- **Every sign-off is recorded** with the protocol category, the assistant's category, the
  final category, and the rationale: an AI-vs-human agreement trail, the first thing a
  governance reviewer asks for.
- **Missing values never fire a rule.** A blank platelet field is not a platelet count of
  zero. Blanks are surfaced back to the clinician after extraction rather than defaulted.
- **Rules that depend on a judgement say so.** Criteria containing "without treatable cause"
  are flagged *needs your judgement* in the protocol panel, rather than pretending the
  number settled it.
- **The assistant is never load-bearing.** No key, failed call, or rate limit can dead-end
  the demo: the protocol and the sign-off still run.

## Not built (deliberately)

Auth, patient records, EHR/HL7 integration, PDF export, multi-user queues, persistence
beyond an append-only JSONL file. This runs on localhost, on synthetic referrals, and it is
decision support — not a medical device.

---

**Sources**
- NSW Health, State-wide Referral Criteria — https://www.health.nsw.gov.au/outpatients/referrals/Pages/default.aspx
- Queensland Health, Clinical Prioritisation Criteria: Haematology — https://www.health.qld.gov.au/cpc/haematology
- Victoria Health, Statewide Referral Criteria — https://www.health.vic.gov.au/statewide-referral-criteria
