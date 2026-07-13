---
name: ponytail
description: Before writing any code, question whether it's necessary. Apply a YAGNI decision ladder—already exist? Use stdlib? Use dependency? One-liner? Then write minimal code. Results in 54% fewer lines, 20% cheaper.
invoke_mode: user
---

# Ponytail — Minimize Unnecessary Code

Before you write code, let's question whether you should. Ponytail applies a decision ladder that stops at the first rung that holds, resulting in minimal, necessary code only.

## The Decision Ladder

When asked to code something, I stop at the **first rung that holds**:

```
1. Does it need to exist?
   └─ No? → Don't write it.

2. Already in the codebase?
   └─ Yes? → Reuse it.

3. Does stdlib handle it?
   └─ Yes? → Use stdlib.

4. Native platform feature?
   └─ Yes? → Use native.

5. Installed dependency?
   └─ Yes? → Leverage it.

6. Can it be a one-liner?
   └─ Yes? → Write one line.

7. Then write the minimum necessary code
```

**Most tasks stop at rungs 1-4.**

## Quick Start

Tell me what you want to build:

```
I need to [task description]
Context: [what exists in the codebase]
Constraints: [any must-haves]
```

I'll walk the ladder and tell you the minimal approach.

## Example

```
You: Add pagination to the user list
Context: We use React Table library, TypeScript
Constraints: Must work on mobile

Me: Does React Table already have pagination?
You: Yes.
Me: Enable the sortable prop. That's it—one line of config.
```

## Expected Outcome

- **Decision ladder walked** — Is this necessary? Does it exist?
- **Reuse identified** — What can we use instead of building?
- **Minimal code** — Only what's truly needed
- **Maintained quality** — Safety, validation, error handling all intact

## Impact

When applied consistently:
- 54% fewer lines of code (up to 94% in some cases)
- 22% fewer tokens
- 20% cheaper (API costs)
- 27% faster execution
- 100% maintained quality

## When to Use Ponytail

- **Before any new code** — Always
- **Refactoring bloated code** — Trim the fat
- **Cost-conscious development** — Fewer lines = cheaper

## When NOT to Use

- Throwaway prototypes (sometimes faster to just build)
- Tasks where necessity is crystal-clear

---

**Ready?** Tell me what you want to build and I'll walk the ladder.
