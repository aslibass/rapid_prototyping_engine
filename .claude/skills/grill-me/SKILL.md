---
name: grill-me
description: Use before starting complex features, architectural decisions, or ambiguous requirements. Systematically interviews you about the plan, resolving dependencies one focused question at a time.
invoke_mode: user
---

# Grill Me — Rigorous Planning Interview

Before you build, let's interview your plan. I'll ask one focused question per turn about architecture, data models, edge cases, and dependencies until we reach shared understanding.

## Quick Start

Tell me about a feature or architectural decision you're uncertain about:

```
I want to build [feature description]
Context: [existing systems, constraints]
Goal: [what success looks like]
```

I'll then conduct the interview, one question per turn.

## How It Works

Each turn:
1. **One focused question** — No bundling, clear thinking
2. **Recommended answer** — A starting point (you can disagree)
3. **Depth-first** — I follow a branch to resolution
4. **Tracking dependencies** — I note how decisions affect each other

## Example

```
You: "I want to build real-time collaboration on documents"
Context: React frontend, Node backend, PostgreSQL
Goal: Multiple users editing simultaneously

Me: What's your primary constraint—latency, consistency, or simplicity?
Recommended: Consistency. Users need to see updates immediately.

You: Consistency.

Me: How do you structure the document—flat list, tree, or operational transforms?
Recommended: Operational transforms. Proven for real-time collab.

[continues one question at a time until dependencies resolved]
```

## Expected Outcome

After the interview:
- Clear decision tree (what you're building and why)
- Resolved dependencies (no architectural mismatches)
- Caught edge cases (offline, conflicts, scale)
- Team alignment (shared understanding)

## When to Use Grill Me

- **Complex features** (3+ files, cross-service)
- **Architectural decisions** (database, auth, caching strategy)
- **Ambiguous requirements** (unclear specs, many unknowns)
- **Before you code** (not after)

## When NOT to Use

- Simple, one-file tasks (just code it)
- Crystal-clear specs (no ambiguity)
- Throwaway prototypes (too much process)

---

**Ready?** Describe your plan and I'll start asking questions.
