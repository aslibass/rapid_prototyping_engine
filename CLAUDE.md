# Claude Code Configuration

This project is configured with Claude Code skills and plugins for rapid prototyping.

## Available Skills

### Code Generation & Review
- **ponytail** - YAGNI decision ladder for minimal code
- **code-review** - Correctness bugs and efficiency cleanups
- **simplify** - Code reuse and simplification

### Project Management & Multi-Agent Orchestration
- **claude-agent-orchestration** - Parallelize independent work using specialized agents
- **grill-me** - Systematic planning before complex features

### Design & Visualization
- **artifact-design** - Design guidance and fundamentals for Artifacts
- **frontend-design** - Guidance for distinctive visual design for new UI
- **theme-factory** - Styling artifacts with pre-set themes or custom themes
- **dataviz** - Data visualization guidance (charts, graphs, dashboards)
- **schema-markup-generator** - JSON-LD schema generation

### Development Tools
- **webapp-testing** - Playwright-based frontend testing and debugging

### Integrations
- **railway-deploy** - Railway deployment management
- **google-auth** - Google authentication setup
- **dataviz** - Data visualization guidance

## MCP Plugins

Enabled by default:
- **Gmail** - Email management
- **Playwright** - Browser automation
- **Railway** - Deployment management
- **Stripe** - Payment processing
- **Ollama** - Local LLM inference

## Project Settings

Configuration files:
- `.claude/settings.json` - Project settings and permissions
- `.claude/mcp.json` - MCP server configuration
- `.claude/skills/` - Local skill definitions

## Multi-Agent Orchestration

**Use `/claude-agent-orchestration` for:**
- Parallelizing independent tasks (fan-out patterns)
- Routing complex work to specialized agents
- Escalating tasks based on complexity (simple→Haiku, complex→Opus)
- Simultaneous operations like:
  - Code review + testing in parallel
  - Research + implementation + verification together
  - Multiple code explorations across different areas

**Pattern Examples:**
- **Fan-out**: Build multiple components simultaneously with different agents
- **Specialization**: Route to agents with focused roles (code-reviewer, architect, test-runner)
- **Escalation**: Start with fast model (Haiku), escalate complex parts to Opus 4.8

**Available Agent Types:**
- `claude` - General-purpose catch-all for any task
- `claude-code-guide` - Claude Code features, API, SDK questions
- `Explore` - Fast code search and file pattern matching
- `general-purpose` - Research and multi-step queries
- `Plan` - Architecture and implementation planning
- `statusline-setup` - Claude Code configuration

## Design Skills Guide

**Use `/artifact-design` before:**
- Creating new HTML/Markdown artifacts
- Building interactive pages or dashboards
- Designing visual content for sharing

**Use `/frontend-design` when:**
- Building new UI components or reshaping existing ones
- Making aesthetic and intentional design choices
- Need guidance on typography and visual hierarchy

**Use `/theme-factory` for:**
- Applying pre-set themes to artifacts
- Generating custom themes with specific color palettes
- Consistent styling across slides, docs, dashboards

**Use `/dataviz` whenever:**
- Creating charts, graphs, plots, or dashboards
- Visualizing data with Recharts, D3, Plotly, etc.
- Choosing categorical colors or sequential/diverging palettes

## Quick Start

To use a skill, invoke it with:
```
/skill-name [arguments]
```

For example:
```
/artifact-design
/frontend-design
/theme-factory
/dataviz
/ponytail
/code-review medium
/grill-me
/claude-agent-orchestration
```

**Multi-Agent Examples:**
```
# Parallelize code review + testing
/claude-agent-orchestration
[Invoke code-reviewer and test-runner agents in parallel]

# Route to specialized agents
/claude-agent-orchestration
[Route code exploration to Explore agent, architecture to Plan agent]

# Escalate complex features
/claude-agent-orchestration
[Start with Haiku for simple tasks, escalate complex pieces to Opus 4.8]
```

## Rapid Prototyping Workshop Engine

This project is configured as a **rapid prototyping engine** for design thinking workshops. Use it to move from problem → design → deployed prototype in 45 minutes.

### Quick Start: Create a New Prototype

```powershell
.\new-prototype.ps1 "ChatBot"
```

This runs the complete workflow:
1. **Interview** (10 min) — Grill-me questions capture decisions
2. **Design** (10 min) — Frontend-design creates mockup
3. **Code Gen** (15 min) — Templates scaffold code structure
4. **Git Commit** (2 min) — All artifacts saved
5. **Railway Deploy** (10 min) — Live URL for audience

Each phase has an approval checkpoint with the workshop group.

### Workshop Workflow

See `/docs/workflow.md` for detailed workflow documentation including:
- Phase-by-phase breakdown with examples
- What artifacts are created at each step
- How to handle iteration and feedback
- Troubleshooting common issues

### Prototype Structure

Each prototype is a subdirectory under `prototypes/`:

```
prototypes/
├── chatbot/               # Prototype 1
│   ├── .claude/          # Inherited config (references parent skills)
│   ├── interview.json    # Grill-me results
│   ├── design/           # Mockup + design decisions
│   ├── src/              # Generated code
│   ├── railway.toml      # Deployment config
│   └── README.md         # Auto-generated docs
├── dataapp/              # Prototype 2
└── [more prototypes...]

prototypes.json          # Registry of all prototypes + metadata
```

### Configuration

Prototypes inherit skills and plugins from the parent project:
- `.claude/skills/` — Shared skill definitions
- `.claude/plugins/` — Shared MCP plugin configs

Each prototype can override MCP settings locally in `prototypes/{name}/.claude/mcp.json`.

### Registry

`prototypes.json` tracks all prototypes:
```json
{
  "prototypes": [
    {
      "id": "proto_20260713_chatbot",
      "name": "chatbot",
      "created": "2026-07-13T14:30:00Z",
      "status": "deployed",
      "tech_stack": { "backend": "node", "frontend": "react" },
      "deployed_url": "https://chatbot-123.railway.app",
      "interview": "./prototypes/chatbot/interview.json",
      "design": "./prototypes/chatbot/design/mockup.html"
    }
  ]
}
```

### Documentation

- `docs/workflow.md` — Complete workshop workflow with examples
- `docs/grill-me-prototype-questions.md` — Interview question library
- `.prototype-template/README.md` — Structure and quick start for each prototype

## Environment

- **Model**: Claude Opus 4.8
- **Working Directory**: `C:\Users\viren\source\rapidprototyping`
- **Platform**: Windows 11 with PowerShell
- **Orchestration**: PowerShell scripts for workflow automation
- **Deployment**: Railway (via MCP integration)
