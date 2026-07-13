# HemeTriage

Hematology referral triage. Three things on one screen:

| | |
|---|---|
| **Protocol** | The department's standard rule table, run deterministically. Shows exactly which criteria fired. No AI, no network, no key. |
| **Assistant** | Claude (`claude-opus-4-8`) reading the whole referral letter — including the narrative the rule table can't see — and arguing for a tier. Advisory only. |
| **You** | The hematologist sets the final tier and signs off. That decision is the output of record. |

When the protocol and the assistant disagree, the interface says so loudly. That is the point of the demo.

## Run it

```bash
cd prototypes/HemeTriage
npm install
cp .env.example .env       # then paste your ANTHROPIC_API_KEY into .env
npm start                  # → http://localhost:5050
```

`.env` is gitignored. **This prototype is not deployed** — a public URL would put a
personal API key behind an open endpoint.

**Without a key it still runs.** The paste-a-letter box is disabled and the assistant
panel says so, but the protocol tier and sign-off work exactly as normal. The rules
engine never depends on the API.

## Using it

1. Click one of the three synthetic cases (one per tier), or paste a referral letter and
   hit **Extract labs from letter** to pre-fill the form — then correct anything the
   model got wrong. The form is always editable; extraction is a convenience, not an
   authority.
2. **Triage this case.** The protocol answers instantly; the assistant follows.
3. Set the final tier. Overriding either opinion requires a one-line rationale.
4. **Sign off.** The decision is appended to `data/decisions.jsonl` with the protocol
   tier, the assistant's tier, your tier, and your reason — an AI-vs-human agreement
   trail.

Try the **AMBER** case first. The platelet count is reassuring; the letter is not.

## Layout

```
server/
  rules.js       the protocol — ~10 named criteria, deterministic, the credibility anchor
  assistant.js   Claude: letter → structured labs, and case → second opinion
  cases.js       3 synthetic referrals (no PHI)
  index.js       Express API
public/
  index.html     single-page UI, no build step
data/
  decisions.jsonl  append-only sign-off log (gitignored)
```

To change the protocol, edit the `RULES` array in `server/rules.js` — each entry is a
criterion, a tier, a rationale, and a test. The UI renders whatever is in that array.

## Scope

Workshop prototype. Synthetic cases only. **Decision support, not a medical device** — no
tier is acted on until a hematologist signs it.
