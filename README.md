# Rapid Prototyping Engine

A live prototyping system for design thinking workshops that transforms ideas into deployed applications in 45 minutes.

## Overview

This engine guides a workshop group through a structured 5-phase workflow:

1. **Interview** (10 min) — Capture requirements and technical decisions
2. **Design** (10 min) — Create interactive mockup for stakeholder review
3. **Code Generation** (10 min) — Scaffold working starter application
4. **Git Commit** (5 min) — Save all artifacts with full history
5. **Deploy** (10 min) — Deploy to live URL (Railway or Docker)

**Result**: A deployed, working prototype that your group built together.

---

## Quick Start

### Prerequisites

Before starting a workshop, ensure your machine has:

- **Node.js 18+** — [Download here](https://nodejs.org)
- **Git** — [Download here](https://git-scm.com)
- **Claude Code CLI** — [Install here](https://claude.com/claude-code)
- **(Optional) Railway CLI** — For cloud deployment: `npm install -g @railway/cli`
- **(Optional) Docker** — For local deployment: [Download here](https://docker.com)

### Setup

1. **Clone this repository**
   ```bash
   git clone https://github.com/aslibass/rapid_prototyping_engine.git
   cd rapid_prototyping_engine
   ```

2. **Start Claude Code in this directory**
   ```bash
   claude
   ```
   This opens Claude with the full project context, access to all skills, and the ability to run commands.

3. **Run the workshop orchestrator**
   ```powershell
   .\new-prototype.ps1 "YourPrototypeName"
   ```
   Replace `"YourPrototypeName"` with your prototype name (e.g., `"TriageApp"`, `"ChatBot"`, `"DataAnalyzer"`).

---

## Running a Workshop

### Step-by-Step Workflow

#### Phase 1: Interview (10 minutes)

When you run the script, Claude will guide you through 7 focused questions:

```
Q1: What problem are you solving, and who is using this?
Q2: What's the ONE thing this prototype must do?
Q3: What tech stack? (Node/Python for backend, React/Vue/HTML for frontend, DB?)
Q4: How much time do we have? (5-min demo, 30-min working, 1-hour polished?)
Q5: How do you know this worked? What should users be able to do?
Q6: Real data, mock data, or demo data?
Q7: Any constraints? (No databases, must work offline, etc.)
```

**With your workshop group:**
- Have everyone in the room discuss each question
- Provide the group's consensus answer
- The script captures decisions in structured JSON

**Checkpoint 1**: Group reviews the interview summary. Approve to continue, or redo to refine answers.

#### Phase 2: Design (10 minutes)

The script generates an interactive mockup based on your answers.

**With your workshop group:**
- Open `prototypes/{name}/design/mockup.html` in a browser
- Review the design direction together
- Discuss layout, colors, core features

**Checkpoint 2**: Approve design, request redesign, or go back to refine interview answers.

#### Phase 3: Code Generation (10 minutes)

The script scaffolds a working starter application.

**Generated structure:**
```
prototypes/{name}/
├── src/                  # Frontend code
├── server/               # Backend API
├── public/               # HTML, assets
├── package.json          # Dependencies
├── triage-logic.js       # Business logic (customizable)
└── Dockerfile            # Deployment config
```

**With your workshop group:**
- Review the folder structure and generated files
- Customize `server/triage-logic.js` for your domain
- Add or modify symptoms/logic on the fly

**Checkpoint 3**: Approve code structure, regenerate with changes, or go back to refine design.

#### Phase 4: Git Commit (5 minutes)

All artifacts are committed with full history:
- Interview decisions (interview.json)
- Design mockup (design/mockup.html)
- Source code (src/, server/)
- Configuration (package.json, Dockerfile, railway.toml)

#### Phase 5: Deploy (10 minutes)

The application is deployed to a live URL.

**Railway deployment (recommended):**
```bash
cd prototypes/{name}
railway up
```
Your app will be live at a Railway URL (e.g., `https://triage-app-123.railway.app`).

**Docker fallback (if Railway unavailable):**
```bash
cd prototypes/{name}
npm install
npm start
```
Your app runs locally at `http://localhost:5000`.

---

## Real-World Example: Hematology Triage Workshop

Here's what a real 45-minute workshop looks like:

### 2:00 PM — Start
```powershell
.\new-prototype.ps1 "TriageApp"
```

### 2:10 PM — Interview Complete ✓
```
Q1: Problem: "Hematology patient triage system for blood disorder assessment"
Q2: Core Feature: "Symptom checklist that calculates urgency level"
Q3: Tech Stack: "React frontend, Node backend, no database"
Q4: Timeline: "30 minutes"
Q5: Success: "Users can select symptoms and see RED/YELLOW/GREEN result"
Q6: Data: "Mock symptom list"
Q7: Constraints: "None"
```
**Group Approval**: ✓ Continue

### 2:20 PM — Design Complete ✓
Interactive mockup shows symptom form with color-coded results.

**Group Approval**: ✓ Continue

### 2:30 PM — Code Generated ✓
Starter app with symptom checklist ready to customize.

**Group Review**: Modify `server/triage-logic.js` to add/change symptoms:
```javascript
// Add more symptoms:
"severe_bleeding": "Uncontrolled bleeding",
"joint_pain": "Pain in joints"

// Adjust triage rules:
if (hasFebruaryWarning && hasBleeding) {
  return { level: "RED", urgency: "URGENT" }; // Custom logic
}
```

**Group Approval**: ✓ Continue

### 2:35 PM — Committed ✓
Git commit with all artifacts and full history.

### 2:47 PM — Live URL ✓
```
🚀 Deployment successful!
Live URL: https://triageapp-xyz.railway.app
```

**Group presents** live triage app to stakeholders.

---

## Customization Guide

### Customize Triage Logic

Edit `prototypes/{name}/server/triage-logic.js`:

```javascript
export const calculateTriage = (symptoms) => {
  // Add your domain-specific logic here
  // Change RED/YELLOW/GREEN thresholds
  // Modify recommendations
  
  if (symptoms.includes("your_critical_symptom")) {
    return {
      level: "RED",
      urgency: "Needs immediate action",
      recommendation: "Your custom guidance here"
    };
  }
};
```

### Add New Symptoms

Edit the symptom definitions:

```javascript
export const getSymptomDefinitions = () => {
  return {
    // Existing symptoms...
    your_new_symptom: "Definition for your domain",
  };
};
```

### Change Frontend Styling

Edit `prototypes/{name}/public/index.html`:

```html
<style>
  /* Change colors, fonts, layout here */
  .btn-primary {
    background: #your-color;
  }
</style>
```

### Use Different Template

The default template is web-react-express (Node.js backend + HTML form). 

To use alternatives (coming soon):
```powershell
.\new-prototype.ps1 "YourApp" -Template web-vue-express
.\new-prototype.ps1 "YourApp" -Template web-fastapi
.\new-prototype.ps1 "YourApp" -Template cli-python
```

---

## Troubleshooting

### Interview Script Errors

**Problem**: Interview phase crashes or doesn't capture input
- **Solution**: Ensure PowerShell 5.1+ is installed (`$PSVersionTable.PSVersion`)
- Check that you're running from the project root directory

### Code Generation Fails

**Problem**: Template files not found
- **Solution**: Verify `.prototype-template/templates/web-react-express/` exists with all files
- Run: `ls .prototype-template/templates/web-react-express/`

### Deployment Fails

**Problem**: Railway CLI not found
- **Solution**: Install Railway CLI: `npm install -g @railway/cli`
- Authenticate: `railway login`

**Problem**: Docker image build fails
- **Solution**: Ensure Docker daemon is running
- Try building manually: `cd prototypes/{name} && docker build -t myapp .`

**Problem**: Port 5000 already in use (local deployment)
- **Solution**: Stop other services on port 5000, or modify `server/index.js`:
  ```javascript
  const PORT = process.env.PORT || 3000; // Use 3000 instead
  ```

### Prototype Already Exists

**Problem**: Error: "Prototype 'X' already exists"
- **Solution**: Choose a different name or delete the existing prototype folder:
  ```bash
  rm -r prototypes/{existing-name}
  ```

### Git Commit Fails

**Problem**: "Not a git repository"
- **Solution**: Initialize git in the project root:
  ```bash
  git init
  git config user.email "workshop@example.com"
  git config user.name "Workshop Facilitator"
  ```

---

## Workshop Best Practices

### Before the Workshop (1 day prior)

1. **Dry Run**: Create a test prototype to verify timing
   ```powershell
   .\new-prototype.ps1 "DryRun"
   ```
   Measure actual time for each phase. Adjust allocations if needed.

2. **Prepare Domain Questions**: Tailor grill-me questions to your domain
   - Edit `docs/grill-me-prototype-questions.md` for domain-specific context
   - Add example answers participants might give

3. **Test Deployment**:
   - Verify Railway CLI works: `railway login`
   - Or test Docker: `docker --version`
   - Have backup URL/screenshots ready in case deployment fails

4. **Gather Participants**: Ensure at least one participant with domain expertise
   - They'll provide the crucial context for triage rules and requirements
   - They'll validate prototype logic during customization phase

### During the Workshop

1. **Set Expectations** (2 min):
   - "We'll go from idea to deployed app in 45 minutes"
   - "You'll customize the triage logic based on your expertise"
   - "All decisions captured for follow-up"

2. **Interview Phase**:
   - Read each question aloud
   - Facilitate group discussion (don't let one person dominate)
   - Record the group consensus answer

3. **Design Phase**:
   - Show the mockup in a browser
   - Discuss as a group: Does it match the vision?
   - Document feedback for future iterations

4. **Code Customization**:
   - Walk through `server/triage-logic.js` as a group
   - Add/modify symptoms together
   - Have someone type; others guide

5. **Live Deployment**:
   - Deploy together (press the button together!)
   - Share the live URL with everyone
   - Have participants test the deployed app

6. **Wrap-Up** (5 min):
   - Document action items (who owns what)
   - Capture feedback on the process
   - Discuss next steps for polishing the prototype

### After the Workshop

1. **Save Artifacts**:
   - Commit the final version: `git commit -am "Post-workshop refinements"`
   - Push to GitHub: `git push origin master`

2. **Collect Feedback**:
   - What phases felt rushed?
   - What could be improved?
   - Would you run this again?

3. **Iterate**:
   - Use feedback to refine triage rules
   - Improve UI based on user testing
   - Add more features if needed

---

## File Structure

```
rapid_prototyping_engine/
├── new-prototype.ps1              # Main orchestration script
├── prototypes.json                # Registry of all prototypes created
├── CLAUDE.md                      # Claude Code configuration
├── README.md                      # This file
│
├── .claude/
│   ├── settings.json              # Project settings
│   ├── mcp.json                   # MCP plugin config
│   ├── skills/                    # Claude Code skills
│   └── plugins/                   # MCP plugins
│
├── .prototype-template/
│   ├── .claude/settings.json      # Config for new prototypes
│   ├── README.md                  # Prototype template docs
│   ├── railway.toml.template      # Deployment config template
│   ├── .env.example               # Environment variables template
│   └── templates/
│       └── web-react-express/     # Default template
│           ├── server/
│           │   ├── index.js       # Express server
│           │   └── triage-logic.js # Business logic (customizable)
│           ├── public/
│           │   └── index.html     # Frontend form UI
│           ├── package.json       # Dependencies
│           ├── Dockerfile         # Container config
│           └── railway.toml       # Railway deployment
│
├── docs/
│   ├── workflow.md                # 45-minute workflow guide
│   └── grill-me-prototype-questions.md # Interview questions
│
└── prototypes/                    # Created prototypes (auto-generated)
    ├── YourApp/
    │   ├── .claude/
    │   ├── interview.json         # Captured requirements
    │   ├── design/
    │   │   ├── mockup.html        # Interactive design
    │   │   ├── decisions.md       # Design rationale
    │   │   └── color-palette.json # Design system
    │   ├── src/server/            # Generated code
    │   ├── public/                # Generated frontend
    │   ├── package.json
    │   ├── Dockerfile
    │   └── railway.toml
    └── [more prototypes...]
```

---

## Command Reference

### Create a Prototype

```powershell
# Basic usage
.\new-prototype.ps1 "PrototypeName"

# Skip design phase (faster, design-less workflow)
.\new-prototype.ps1 "QuickDemo" -SkipDesign

# Skip deployment (local-only, no Railway)
.\new-prototype.ps1 "LocalApp" -SkipDeploy

# Full workflow with both
.\new-prototype.ps1 "FullApp"
```

### Run Locally After Creation

```bash
cd prototypes/YourApp
npm install
npm run dev
# Opens on http://localhost:5000
```

### Deploy Existing Prototype

```bash
cd prototypes/YourApp
railway up          # Deploy to Railway
# Or
npm start           # Run locally with npm start
```

### View Registry

```bash
cat prototypes.json | jq '.prototypes[] | {name, status, deployed_url}'
```

---

## Support & Feedback

### Getting Help

1. Check `docs/workflow.md` for detailed phase-by-phase breakdown
2. Review `docs/grill-me-prototype-questions.md` for interview guidance
3. Check **Troubleshooting** section above
4. Open an issue on [GitHub](https://github.com/aslibass/rapid_prototyping_engine/issues)

### Contributing

Want to improve the engine?
- Create a new template in `.prototype-template/templates/`
- Improve the triage logic for your domain
- Share your workshop experience and feedback

---

## What's Next After the Workshop?

Your prototype is a **starting point**, not a finished product. Common next steps:

- **Connect to Real Data**: Replace mock data with real APIs/databases
- **Add Authentication**: Implement user login and data persistence
- **Refine UI**: Polish styling and user experience
- **Add Features**: Expand beyond the MVP scope
- **User Testing**: Get feedback from real users
- **Deploy Widely**: Move from Railway to production infrastructure

The architecture supports all of these. Happy prototyping! 🚀

---

## About This Project

**Rapid Prototyping Engine** is an AI-powered workshop orchestration system that combines:

- **Claude AI** for intelligent decision capture and synthesis
- **Design Thinking principles** for structured discovery
- **Infrastructure-as-Code** for instant deployment
- **Open-source tools** (Express, Railway, Docker) for sustainability

Built for innovation teams, design thinking workshops, and rapid validation of ideas.

**v0.1.0** — Initial MVP
- 5-phase structured workflow
- Interview capture with grill-me
- Interactive design mockups
- Code scaffolding with templates
- Railway + Docker deployment

**Next:** Error resilience, AI synthesis visibility, action item capture
