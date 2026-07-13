# Grill-Me Prototype Interview Questions

This document defines the interview questions for the rapid prototyping workshop engine. These questions are designed to capture essential information for prototype creation in ~10 minutes.

## Interview Structure

The interview consists of 6-7 focused questions, each with:
- **Question** — Clear, open-ended prompt
- **Context** — Why this matters
- **Recommended Answer** — A starting point (user can override)
- **Follow-up** — If user's answer suggests clarification needed

---

## Q1: Problem & Users

**Question:**
> What problem are you solving, and who is using this prototype?

**Context:**
This establishes the problem statement and target users. Essential for design and code generation.

**Recommended Answer:**
> Real-time customer support for website visitors. Users are website visitors who need quick answers.

**Why This Matters:**
- Informs design decisions (UI/UX for target audience)
- Determines whether data is real or mock
- Shapes the core feature set

**Follow-up:**
If answer is vague: *"Describe the user's experience in one sentence. What do they do first, then what?"*

**Captured In:**
```json
{
  "problem": "Real-time customer support for website visitors",
  "targetUsers": "Website visitors who need quick answers",
  "userJourney": "User lands on site → clicks support → asks question → gets answer"
}
```

---

## Q2: Core Feature

**Question:**
> What's the ONE thing this prototype must do?

**Context:**
Forces prioritization. In 30 minutes, you can't build everything. What's the MVP feature?

**Recommended Answer:**
> Allow users to type a question and get an AI-generated response in real-time.

**Why This Matters:**
- Focuses code generation on essential functionality
- Defines scope for 30-minute workshop
- Prevents feature creep

**Follow-up:**
If too ambitious: *"That's great. If you had 15 minutes, what would you cut? Let's start with the smallest version."*

**Captured In:**
```json
{
  "coreFeature": "Chat interface where users type questions and get AI responses",
  "mustHave": ["chat input", "message display", "send button"],
  "niceToHave": ["user authentication", "chat history", "typing indicators"]
}
```

---

## Q3: Tech Stack

**Question:**
> What tech stack would you like to use? Backend (Node.js, Python, None), Frontend (React, Vue, Plain HTML)?

**Context:**
Determines which code template to use. Shapes the entire prototype architecture.

**Recommended Answer:**
> Backend: Node.js, Frontend: React, Database: None (mock data for demo)

**Why This Matters:**
- Matches generated code to team expertise
- Affects deployment complexity
- Determines dependencies and tooling

**Follow-up:**
If uncertain: *"Have you used React before? If yes, let's go with React. If no, plain HTML might be simpler for a quick demo."*

**Captured In:**
```json
{
  "techStack": {
    "backend": "node",
    "frontend": "react",
    "database": "none",
    "reasonForChoices": "Team knows React well; no data persistence needed for demo"
  }
}
```

---

## Q4: Timeline & Scope

**Question:**
> How much time do we have? (5-minute demo? 30-minute working version? 1-hour polished?)

**Context:**
Shapes the feature set and code complexity. 5-minute MVP is different from 30-minute version.

**Recommended Answer:**
> 30 minutes. We want a working prototype, not just a mockup.

**Why This Matters:**
- Determines code generation complexity
- Affects how much customization is needed
- Sets expectations with audience

**Follow-up:**
If uncertain: *"What's your goal? Show a concept to stakeholders, or actually have people use it?"*

**Captured In:**
```json
{
  "timeline": 30,
  "timelineUnit": "minutes",
  "scope": "working",
  "whatCanBeSkipped": ["user authentication", "database persistence", "error handling"]
}
```

---

## Q5: Success Metric

**Question:**
> How do you know this prototype worked? What should users be able to do?

**Context:**
Defines the success criteria. Helps guide design decisions and testing.

**Recommended Answer:**
> Users can ask a question, get a response, and feel like they're talking to a real support agent.

**Why This Matters:**
- Provides tangible success criteria
- Guides testing and demos
- Tells the design team what matters most

**Follow-up:**
If too ambitious: *"Perfect. For this 30-minute prototype, what's the minimum to demonstrate that?"*

**Captured In:**
```json
{
  "successMetric": "Users can ask questions and receive responses in real-time",
  "howToMeasure": "Ask 3 sample questions during demo, verify responses make sense",
  "acceptanceCriteria": [
    "Chat interface is visible",
    "Message appears after user types",
    "Response is generated within 3 seconds"
  ]
}
```

---

## Q6: Data Source

**Question:**
> Should this use real data, mock data, or demo data?

**Context:**
Affects code generation, deployment, and how realistic the demo is.

**Recommended Answer:**
> Mock data for now. We can connect real APIs later.

**Why This Matters:**
- Simplifies code generation (no database setup)
- Lets you focus on UX/UI
- Can be replaced with real data post-workshop

**Follow-up:**
If unsure: *"Do you have an API/database ready to connect? If not, let's mock the data for the demo."*

**Captured In:**
```json
{
  "dataSource": "mock",
  "mockDataExamples": [
    {
      "userQuestion": "What are your hours?",
      "botResponse": "We're open Monday-Friday, 9am-5pm."
    }
  ],
  "futureRealDataSource": "company_api"
}
```

---

## Q7: Known Constraints (Optional)

**Question:**
> Are there any constraints? (No databases? Must work offline? Accessibility requirements?)

**Context:**
Captures edge cases and special requirements early.

**Recommended Answer:**
> None. This is a simple demo.

**Why This Matters:**
- Informs architectural decisions
- Prevents late surprises during development
- Shapes code generation

**Follow-up:**
If constraint mentioned: *"Got it. We'll make sure the code handles [constraint]. Let's note that in the design."*

**Captured In:**
```json
{
  "constraints": [],
  "orIfConstraintsExist": {
    "constraints": ["Must work offline", "No external API calls"],
    "howHandled": "Use local data only, no network requests"
  }
}
```

---

## Interview Output Format

After all questions, the interview is saved as:

```json
{
  "id": "interview_20260713_chatbot",
  "timestamp": "2026-07-13T14:30:00Z",
  "prototype": "chatbot",
  "q1_problem_and_users": {
    "problem": "Real-time customer support for website visitors",
    "targetUsers": "Website visitors who need quick answers"
  },
  "q2_core_feature": {
    "coreFeature": "Chat interface",
    "mustHave": ["chat input", "message display", "send button"]
  },
  "q3_tech_stack": {
    "backend": "node",
    "frontend": "react",
    "database": "none"
  },
  "q4_timeline": {
    "minutes": 30,
    "scope": "working"
  },
  "q5_success_metric": {
    "metric": "Users can ask questions and receive responses in real-time"
  },
  "q6_data_source": {
    "dataSource": "mock"
  },
  "q7_constraints": {
    "constraints": []
  }
}
```

---

## Interview Summary (Human-Readable)

After the structured JSON, a markdown summary is generated:

```markdown
# Prototype Interview: ChatBot

**Created**: July 13, 2026 at 2:10 PM
**Duration**: 10 minutes

## Problem & Users
Real-time customer support for website visitors. Users are website visitors who need quick answers.

## Core Feature
Chat interface where users type questions and get AI-generated responses.

## Tech Stack
- Backend: Node.js
- Frontend: React
- Database: None (mock data)

## Timeline & Scope
30 minutes. We want a working prototype that people can interact with.

## Success Metric
Users can ask a question, get a response, and feel like they're talking to a real support agent.

## Data Source
Mock data. We'll use pre-defined Q&A pairs for the demo.

## Constraints
None identified.

## Next Steps
1. Review this summary with the workshop group
2. Proceed to Design phase (create mockup)
3. Generate code based on tech stack
4. Deploy to Railway
```

---

## Conducting the Interview

### As a Workshop Facilitator

1. **Read the question clearly** — No jargon
2. **Provide context** — Why this matters
3. **Offer a recommended answer** — Helps people who are unsure
4. **Listen and take notes** — User's answer is the truth
5. **Clarify if vague** — Use follow-up questions
6. **Move on decisively** — Don't dwell on one question

### If User is Uncertain

Always provide escape hatch:
> "If you're not sure, here's what I'd recommend: [recommended answer]. Does that sound right, or would you go differently?"

### If User Disagrees with Recommendation

Validate their choice:
> "Great! That's a solid choice. Let me note that down and we'll make sure the design and code reflect that."

### Time Management

- **Target**: 1.5 minutes per question = 10 minutes total
- **If running over**: Skip Q7 (constraints) — can always add them later
- **If running under**: Dive deeper on Q2 (core feature) or Q5 (success metric)

