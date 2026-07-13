# Rapid Prototyping Workshop Workflow

This document describes the complete workflow for creating prototypes using the rapid prototyping engine.

## Overview

The workshop engine guides you through a structured 5-phase process, with approval checkpoints at each phase. The goal is to move from problem → design → deployed prototype in 45 minutes.

```
Start Workshop
    ↓
Phase 1: Interview (Grill-Me)
    ↓ [Workshop group approves]
    ↓
Phase 2: Design (Frontend-Design + Artifact-Design)
    ↓ [Workshop group reviews mockup]
    ↓
Phase 3: Code Generation (Templates)
    ↓ [Workshop group approves tech stack & structure]
    ↓
Phase 4: Git Commit
    ↓
Phase 5: Railway Deploy
    ↓
Live URL 🚀
```

## Phase 1: Interview (Grill-Me)

**Duration**: ~10 minutes

### What Happens
- Claude asks 5-7 focused questions about the prototype
- Questions cover: problem, users, core feature, tech stack, timeline, success metrics
- Answers are captured and structured

### Workflow
```
new-prototype.ps1 "ChatBot"

✓ Creating prototype directory: prototypes/chatbot

[Phase 1: Interview]
─────────────────────────────────────

Q1: What problem are you solving?
A: Real-time customer support for our website

Q2: Who's using this?
A: Website visitors who need quick answers

[... 5 more questions ...]

✓ Interview complete! Results saved to: prototypes/chatbot/interview.json

Summary:
• Problem: Real-time customer support
• Users: Website visitors
• Core Feature: Chat interface with AI responses
• Tech Stack: React + Node.js
• Timeline: 30 minutes
• Success: Users can ask questions and get responses
• Data: Mock data for demo

[Checkpoint] Review summary with workshop group
→ Continue to Design? [Y/n]:
```

### Artifacts Created
- `prototypes/{name}/interview.json` — Structured interview results
- `prototypes/{name}/README.md` — Auto-generated project documentation

### Approval Gate
- **Decision**: Continue to design or re-interview?
- **Action**: Review interview summary with workshop group
- **If Yes**: Proceed to Phase 2
- **If No**: Redo interview (previous answers preserved in JSON)

---

## Phase 2: Design (Frontend-Design + Artifact-Design)

**Duration**: ~10 minutes

### What Happens
- Claude creates a visual mockup based on interview results
- Design decisions are documented (layout, colors, components)
- Mockup is reviewed before code generation begins

### Workflow
```
[Phase 2: Design]
─────────────────────────────────────

Using interview results:
✓ Problem: Real-time customer support
✓ Tech: React + Node.js
✓ Timeline: 30 minutes

Creating design with frontend-design skill...
✓ Visual mockup created: mockup.html
✓ Design decisions documented: decisions.md
✓ Color palette extracted: color-palette.json
✓ Component specs defined: component-specs.md

✓ Design artifacts saved to: prototypes/chatbot/design/

[Preview]
┌──────────────────────────────────┐
│  Live Chat Support               │
│  ─────────────────────────────   │
│                                  │
│  Chat window:                    │
│  [Messages area...]              │
│  [Input box] [Send]              │
│                                  │
│  Colors: #007AFF, #FFFFFF, #666  │
│  Font: Inter, 14px              │
│                                  │
└──────────────────────────────────┘

[Checkpoint] Review mockup with workshop group
→ Continue to Code Generation? [Y/n/redesign]:
```

### Artifacts Created
- `prototypes/{name}/design/mockup.html` — Visual mockup
- `prototypes/{name}/design/decisions.md` — Design rationale
- `prototypes/{name}/design/color-palette.json` — Color system
- `prototypes/{name}/design/component-specs.md` — Reusable components

### Approval Gate
- **Decision**: Approve design, request redesign, or go back to interview?
- **Action**: Show mockup to workshop group, gather feedback
- **If Approve**: Proceed to Phase 3 (Code Generation)
- **If Redesign**: Redo design phase with feedback
- **If Go Back**: Return to Phase 1 (re-interview with changes)

---

## Phase 3: Code Generation (Templates)

**Duration**: ~15 minutes

### What Happens
- Template engine reads interview + design decisions
- Selects appropriate starter template (React, Vue, CLI, etc.)
- Scaffolds folder structure and starter code
- Code is ready to customize based on design

### Workflow
```
[Phase 3: Code Generation]
─────────────────────────────────────

Analyzing interview:
✓ Backend: Node.js
✓ Frontend: React
✓ Database: None (mock data)
✓ Timeline: 30 minutes

Selecting template: web-react-express

Generating code structure...
✓ src/components/ChatWindow.jsx
✓ src/pages/HomePage.jsx
✓ server/api/chat.js
✓ public/styles/main.css
✓ package.json
✓ .env.example
✓ railway.toml

Code preview:
src/
├── components/
│   ├── ChatWindow.jsx
│   ├── MessageList.jsx
│   └── InputBox.jsx
├── pages/
│   └── HomePage.jsx
├── App.jsx
├── index.jsx
└── styles/
    └── main.css

server/
├── api/
│   ├── chat.js
│   └── middleware.js
├── index.js
└── package.json

[Checkpoint] Review code structure with workshop group
→ Continue to Git Commit? [Y/n/regenerate]:
```

### Artifacts Created
- `prototypes/{name}/src/` — React/Vue component structure
- `prototypes/{name}/server/` — Backend server files
- `prototypes/{name}/public/` — Static assets
- `prototypes/{name}/package.json` — Node.js dependencies
- `prototypes/{name}/railway.toml` — Deployment configuration

### Approval Gate
- **Decision**: Approve code structure or regenerate?
- **Action**: Show folder structure and sample code to workshop group
- **If Approve**: Proceed to Phase 4 (Git Commit)
- **If Regenerate**: Redo code gen (e.g., different framework)
- **If Go Back**: Return to Phase 2 (change design)

---

## Phase 4: Git Commit

**Duration**: ~2 minutes

### What Happens
- All artifacts are staged (interview, design, code)
- A detailed commit message is created
- Commit is made locally with full history

### Workflow
```
[Phase 4: Git Commit]
─────────────────────────────────────

Staging artifacts:
✓ interview.json
✓ design/mockup.html
✓ design/decisions.md
✓ src/
✓ server/
✓ package.json
✓ railway.toml

Creating commit message...

[Commit Message]
─────────────────────────────────────
Create prototype: chatbot

Stack: React + Node.js + No Database
Problem: Real-time customer support for website
Success metric: Users can ask questions and get responses
Timeline: 30 minutes
Data: Mock data for demo

Artifacts:
- Interview: interview.json
- Design: design/mockup.html
- Code: src/ + server/

Workshop: Design Thinking Session - July 13, 2026
Duration: 45 minutes

✓ Commit: abc1234 "Create prototype: chatbot"
✓ Tagged: prototype-20260713-chatbot
```

### Artifacts Created
- Git commit with all artifacts
- Tag: `prototype-{date}-{name}`

### Approval Gate
- **Decision**: Commit and deploy, or make changes?
- **Action**: Review commit message
- **If Approve**: Proceed to Phase 5 (Railway Deploy)
- **If Make Changes**: User can edit files and commit manually

---

## Phase 5: Railway Deploy

**Duration**: ~10 minutes

### What Happens
- Code is pushed to GitHub (if monorepo) or new repo
- Railway project is created and linked
- Deployment begins automatically
- Live URL is generated

### Workflow
```
[Phase 5: Railway Deploy]
─────────────────────────────────────

Pushing to GitHub...
✓ Pushed to: github.com/viren/rapidprototyping/prototypes/chatbot

Creating Railway project...
✓ Railway project created: chatbot-proto-123

Deploying...
Building Docker image...
✓ Build successful
✓ Pushing to Railway registry...
✓ Deploying to production...

🚀 Deployment successful!

Live URL: https://chatbot-proto-123.railway.app

✓ Prototype registered in prototypes.json
✓ URL shared in workshop group
```

### Artifacts Created
- GitHub commit/branch
- Railway project and deployment
- Entry in `prototypes.json` with live URL

### Success
- **Live URL** is available for workshop audience
- **Prototype** is deployed and ready for feedback
- **All artifacts** are preserved in git history

---

## Complete Example: "ChatBot" Prototype

### Timeline
- **Start**: 2:00 PM
- **Interview complete**: 2:10 PM
- **Design complete**: 2:20 PM
- **Code generated**: 2:35 PM
- **Git committed**: 2:37 PM
- **Deployed**: 2:47 PM

### Results
```
prototypes/chatbot/
├── .claude/
│   ├── settings.json
│   └── CLAUDE.md
├── interview.json
│   {
│     "problem": "Real-time customer support",
│     "users": "Website visitors",
│     "coreFeature": "Chat interface",
│     "techStack": { "backend": "node", "frontend": "react" },
│     ...
│   }
├── design/
│   ├── mockup.html
│   ├── decisions.md
│   ├── color-palette.json
│   └── component-specs.md
├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
├── server/
│   ├── api/
│   └── index.js
├── package.json
├── railway.toml
├── .env.example
├── .gitignore
└── README.md

prototypes.json entry:
{
  "id": "proto_20260713_chatbot",
  "name": "chatbot",
  "status": "deployed",
  "deployed_url": "https://chatbot-proto-123.railway.app",
  "interview": "prototypes/chatbot/interview.json",
  "design": "prototypes/chatbot/design/mockup.html",
  ...
}
```

---

## Troubleshooting

### Interview Phase
- **Q: User doesn't understand a question?**
  - Grill-me provides context and recommended answers
  - User can ask for clarification
  
- **Q: User wants to change an answer later?**
  - Can re-do interview phase before design starts

### Design Phase
- **Q: Mockup doesn't match vision?**
  - Request redesign in checkpoint
  - Go back to interview if problem statement needs clarity

### Code Generation
- **Q: Generated code has wrong structure?**
  - Regenerate with different template selection
  - Manually customize after generation

### Deployment
- **Q: Deployment takes too long?**
  - Deploy phase times out after 10 minutes
  - User can manually deploy via Railway CLI after workshop
  
- **Q: No internet/offline?**
  - Use `--skip-deploy` flag to stop before Railway phase
  - All artifacts preserved locally, deploy manually later

---

## Workflow Variations

### "5-Minute MVP"
Skip Design phase, use minimal template:
```
new-prototype.ps1 "QuickDemo" --skip-design --template static-html
```

### "Full-Stack with Database"
Use appropriate template:
```
new-prototype.ps1 "DataApp" --template nextjs-postgres
```

### "Python CLI Tool"
Specify Python template:
```
new-prototype.ps1 "DataProcessor" --template cli-python
```

---

## Best Practices

1. **Interview Clearly** — Spend time on Phase 1. Better input = better design.
2. **Approve Designs with Group** — Don't skip the design review checkpoint.
3. **Keep Code Simple** — Generated code is a starting point, customize as needed.
4. **Test Deployment** — Always test the live URL before presenting to stakeholders.
5. **Preserve History** — Git commits preserve the entire ideation process.
6. **Iterate Quickly** — If something doesn't work, go back a phase and change it.

