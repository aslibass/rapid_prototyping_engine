# Prototype Template

This folder is a template for new prototypes created by the rapid prototyping engine.

## Structure

```
prototype-name/
├── .claude/              # Claude Code configuration (inherited from parent)
│   ├── settings.json     # Project settings + skill/plugin paths
│   ├── mcp.json          # MCP plugin configuration (override as needed)
│   └── CLAUDE.md         # Local documentation
├── interview.json        # Grill-me interview results (captured automatically)
├── design/               # Design artifacts (created during design phase)
│   ├── mockup.html       # Visual mockup
│   ├── decisions.md      # Design rationale & decisions
│   ├── color-palette.json# Extracted color system
│   └── component-specs.md# Reusable component definitions
├── src/                  # Source code (created during code gen phase)
├── public/               # Static assets (created during code gen phase)
├── package.json          # Dependencies (web projects)
├── requirements.txt      # Dependencies (Python projects)
├── railway.toml          # Railway deployment configuration
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # Project-specific documentation (auto-generated)
```

## Workflow

1. **Interview Phase** — Grill-me captures decisions → `interview.json`
2. **Design Phase** — Frontend-design creates mockup → `design/`
3. **Code Generation** — Templates create scaffolding → `src/`, `public/`, `package.json`
4. **Git Commit** — All artifacts staged and committed
5. **Railway Deploy** — Pushed to GitHub and deployed live

## Quick Start (After Creation)

```bash
cd prototype-name

# View interview results
cat interview.json

# View design mockup
open design/mockup.html

# Install dependencies
npm install              # for Node projects
# OR
pip install -r requirements.txt  # for Python projects

# Start development
npm run dev              # for Node/React projects
python main.py          # for Python projects

# Deploy to Railway (if not auto-deployed)
railway up
```

## Technologies

Check `interview.json` for the tech stack used in this prototype.

## Next Steps

- Review `design/mockup.html` with stakeholders
- Customize code in `src/` based on design and requirements
- Add real data sources and APIs
- Deploy to Railway: `railway up`
- Share live URL with workshop audience

## Artifacts

All artifacts from the prototyping session are preserved:
- **Interview**: `interview.json` — Problem statement, tech decisions, success metrics
- **Design**: `design/mockup.html` + `design/decisions.md` — Visual design & rationale
- **Code**: `src/` + configuration files — Starter scaffolding ready to customize
