---
name: claude-agent-orchestration
description: Parallelize independent work using agents. Use for fan-out patterns (code review + testing simultaneously), specialization (route to agents with focused roles), or escalation (simple→Haiku, complex→Opus).
invoke_mode: user
---

# Claude Agent Orchestration — Parallelize Work

Use Claude Code's Agent tool to spawn specialized agents in parallel. Each agent gets its own model, system prompt, and context. Perfect for parallelization, specialization, and cost optimization.

## Three Core Patterns

### 1. Fan-Out (Parallel Work)

Spawn multiple independent agents simultaneously:

```
Task: Code Review + Testing in parallel

/Agent 
prompt: "Review this code for bugs, performance, maintainability"
model: opus

/Agent
prompt: "Write comprehensive tests for this code"
model: haiku

[Both run in parallel]
```

**Result:** Done faster at similar cost to Opus alone

---

### 2. Pipeline (Sequential Work)

Each agent builds on the previous output:

```
/Agent prompt: "Research the best approach to [problem]" model: sonnet
[Wait for result]

/Agent prompt: "Based on this research, design a solution" model: haiku
[Wait for result]

/Agent prompt: "Implement this design" model: opus
```

**Result:** Complex workflows with clear handoffs

---

### 3. Escalation (By Complexity)

Route to the right model for the job:

```
Simple task? → Haiku agent (90% cheaper than Sonnet)
Medium task? → Sonnet agent (balanced)
Complex task? → Opus agent (most capable)
```

**Result:** 60-80% cost savings vs. Opus everywhere

---

## Quick Start

**Option 1: Parallel review + testing**

```
/Agent prompt: "Security audit of this code. Check OWASP top 10, crypto, injection flaws." model: opus

/Agent prompt: "Performance analysis. Identify bottlenecks, O(n) issues, memory leaks." model: haiku

/Agent prompt: "Code quality review. Check readability, complexity, duplication." model: sonnet

[All three run in parallel]
```

**Option 2: Sequential research → design → implement**

```
/Agent prompt: "Research [topic]. Find 3 key insights, credible sources." model: sonnet
[Wait for result]

/Agent prompt: "Design based on this research: [result]" model: haiku
[Wait for result]

/Agent prompt: "Implement this design: [result]" model: opus
```

---

## Model Routing Reference

| Task Type | Model | Reason |
|-----------|-------|--------|
| Single-file, well-specified | Haiku | Cheapest, sufficient |
| Multi-file, requires reasoning | Sonnet | Balanced power/cost |
| Architectural, security, synthesis | Opus | Most capable |

---

## Best Practices

### 1. Be Specific in Agent Prompts

❌ "Review this code"
✅ "Review this React component for memory leaks, prop drilling, and rendering performance. Provide 3 key findings."

### 2. Parallelize Independent Work

✅ Code review + Testing + Security audit (all independent)
❌ Sequential steps when they're independent (wastes time)

### 3. Agent Isolation

Agents don't see each other's work. YOU synthesize:

```
Agent 1 said: [result]
Agent 2 said: [result]
Agent 3 said: [result]

Here's my synthesis: [your decision]
```

### 4. Cost Optimization

- **Parallel:** All run at once, total time = longest agent
- **Sequential:** Agents wait for previous result
- Always parallelize when possible

---

## When to Use Agent Orchestration

- **Multiple perspectives** (code review + security + testing)
- **Complex multi-step work** (research → design → implement)
- **Cost-sensitive** (route Haiku to simple tasks)
- **Time-critical** (parallelize independent work)

## When NOT to Use

- Simple single-file tasks (just ask Claude directly)
- Work needing shared context (agent isolation is a problem)
- Tight sequential dependencies (no parallelization benefit)

---

## Example Workflow: Feature Review

```
Feature ready for review. Let's get three perspectives:

/Agent
prompt: "Code quality review of this React component: [code]. Check: complexity, readability, duplication, maintainability."
model: sonnet

/Agent
prompt: "Security audit of this auth code: [code]. Check: injection, CSRF, token handling, encryption."
model: opus

/Agent
prompt: "Performance analysis: [code]. Check: renders, re-renders, API calls, bundle size impact."
model: haiku

[All three run in parallel]

You: Here's what I got:
- Security: [findings]
- Code quality: [findings]
- Performance: [findings]

Approval: [your decision based on synthesis]
```

---

**Ready?** Describe your parallel work and I'll help structure it.
