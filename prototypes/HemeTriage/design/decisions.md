# Design decisions: HemeTriage

## The reframe

The first instinct was a triage calculator: symptoms in, urgency tier out. The workshop
rejected that. What clinicians asked for was something narrower and more defensible:

> "Show them we are using *their* standard rules, but also give the hematologist an
> opinion from an assistant hematology triage expert — so the hematologist has the
> final say."

That turns the product from a calculator into a **decision-support cockpit with a human
adjudicator**. Three things are on screen, and the order matters:

1. **The protocol** — the department's own rule table, run deterministically, showing
   exactly which criteria fired and which didn't. This is the credibility anchor:
   *"that's your protocol, not our black box."* It is the leftmost, plainest panel and
   it is labelled `deterministic · no AI`.
2. **The assistant** — Claude reading the *whole* referral, including the narrative the
   rule table structurally cannot see, and arguing for a tier. Labelled `advisory`.
3. **The hematologist** — who reads both and sets the final tier. Their decision, not the
   model's, is the output of record.

## Disagreement is the feature

The AMBER sample case is written so the numbers look survivable (platelets 62, Hb normal)
while the narrative does not (rapidly enlarging node, drenching night sweats, 7 kg weight
loss). The protocol sees the platelet count. The assistant sees the story.

When the two tiers differ, the UI says so loudly — that banner is the whole argument for
AI-as-assistant in one screen, and it is also where clinicians feel the safety of having
the last word. If they never disagreed, the assistant would be redundant.

## Why the rules are not an LLM

Letting Claude assign the tier directly would be more flexible and less code. It was
rejected: a hematology audience's first question is *"on what basis?"*, and
"the model decided" is not an answer that survives that room. A visible rule table that
fires by name is. It also means the protocol keeps working with no API key, no network,
and no latency — the part of the demo that must never break in front of an audience.

## Safety choices baked into the interface

- **Override requires a reason.** Departing from either opinion demands a one-line
  rationale before sign-off. This is not friction for its own sake — it's what makes the
  log worth reading.
- **Every sign-off is recorded** with the protocol tier, Claude's tier, the final tier,
  and the rationale. That gives an AI-vs-human agreement trail, which is the first thing
  a governance reviewer will ask for.
- **Missing values never fire a rule.** A blank platelet field is not a platelet count of
  zero. Blank fields are surfaced back to the clinician after extraction rather than
  silently defaulted.
- **The assistant is never load-bearing.** No key, failed call, or rate limit can
  dead-end the demo: the protocol tier and the sign-off still work.
- **Conservative but not inflationary.** The assistant is told to err toward the more
  urgent tier when the picture is genuinely worrying, but explicitly told that
  over-triage has a real cost to the patient and the service.

## Visual language

Deliberately clinical rather than consumer: serif body type for the reading matter,
monospace for anything that is a *value* (labs, rule details, tier names) so the numbers
read as data. Near-white panels on a cool grey field; the only saturated colour in the
interface is the tier itself, so RED/AMBER/GREEN carry all the visual weight. No
gradients, no rounded-pill buttons, nothing that reads as a marketing page — this has to
look like something a consultant would tolerate on a work machine.

## Not built (deliberately)

Auth, patient records, EHR/HL7 integration, PDF export, multi-user queues, any real
persistence beyond an append-only JSONL file. This is a workshop prototype: it runs on
localhost, on synthetic cases, and it is decision support — not a medical device.

---
**Status**: built and running locally.
