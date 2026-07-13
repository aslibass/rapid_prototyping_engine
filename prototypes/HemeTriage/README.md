# HemeTriage

Haematology referral triage. Three things on one screen:

| | |
|---|---|
| **The protocol** | Published referral criteria, applied deterministically. Every criterion — met or not — is listed with the page it came from. No AI, no network, no key. |
| **The assistant** | Claude (`claude-opus-4-8`) reading the whole referral letter, including the judgements the criteria demand but a blood count cannot settle. Advisory only. |
| **You** | The haematologist places the final category on the rail and signs off. That is the output of record. |

When the protocol and the assistant land on different categories, the rail shows the gap
between them and says how far apart they are. That is the point of the demo.

## Where the criteria come from

**Categories: NSW.** NSW Health's [State-wide Referral Criteria](https://www.health.nsw.gov.au/outpatients/referrals/Pages/default.aspx)
— Emergency red flags redirect to ED, then Category 1 (30 days), Category 2 (90 days),
Category 3 (365 days).

**Thresholds: Queensland.** As at July 2026 NSW has not published haematology SRC, so the
numeric criteria are taken from [Queensland Health's Clinical Prioritisation Criteria for
Haematology](https://www.health.qld.gov.au/cpc/haematology) — the closest published
Australian equivalent. Every rule cites its CPC page in the interface.

**A fifth outcome: decline.** Following the [Victorian SRC](https://www.health.vic.gov.au/statewide-referral-criteria),
a referral that meets no criterion is declined rather than queued.

The rule table is configuration, not a hardcode. To adopt a local LHD's criteria, replace
the `RULES` array in `server/rules.js` — each entry is a criterion, a category, a source, a
quote, and a test. Nothing else changes; the UI renders whatever is in that array.

## Run it

```bash
cd prototypes/HemeTriage
npm install
cp .env.example .env       # paste your ANTHROPIC_API_KEY into .env
npm start                  # → http://localhost:5050
```

`.env` is gitignored. **This is not deployed** — a public URL would put a personal API key
behind an open endpoint.

**Without a key it still runs.** The paste-a-letter box disables itself and the assistant
panel says so, but the protocol and sign-off work exactly as normal. The rule engine never
depends on the API.

## Using it

1. Pick one of the three synthetic referrals, or paste a letter and press **Read the
   letter** to fill the report — then correct anything the model got wrong. Extraction is a
   convenience, not an authority; the form is always editable.
2. **Triage this referral.** The protocol answers instantly; the assistant follows.
3. Place your category on the rail. Overriding either opinion requires a one-line rationale.
4. **Sign off.** The decision is appended to `data/decisions.jsonl` with the protocol's
   category, the assistant's, yours, and your reason — an AI-vs-human agreement trail.

Two cases worth running in front of a room:

- **34F, growing neck node.** The platelets alone say Category 2. The letter describes a node
  growing over a month, drenching night sweats, and 7 kg of weight loss — which is what the
  criteria mean by *expedite*.
- **45F, mild anaemia.** The protocol queues her at 365 days. She has a ferritin of 8 and
  years of heavy periods: a treatable cause, manageable in primary care. The criteria say
  "isolated low Hb **without treatable cause**" — and only the letter knows about the cause.
  Watch whether the assistant declines it.

## Layout

```
server/
  rules.js       the protocol — every criterion carries its source and quote
  cases.js       3 synthetic referrals (no PHI)
  assistant.js   Claude: letter → report, and case → second opinion
  index.js       Express API
public/
  index.html     single page, no build step
data/
  decisions.jsonl  append-only sign-off log (gitignored)
```

## Scope

Workshop prototype. Synthetic referrals only. **Decision support, not a medical device** —
no category is acted on until a haematologist signs it.
