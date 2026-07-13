# Hematology Triage Prototype

A rapid prototype for patient triage assessment in hematology settings.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

Then open http://localhost:5000 in your browser.

## How It Works

### Frontend
- Simple HTML form with checkbox symptom selection
- Real-time API integration for triage calculation
- Color-coded results (RED/YELLOW/GREEN)
- Clear recommendations based on symptom severity

### Backend
- Express.js server with REST API
- `/api/symptoms` - Get available symptoms
- `/api/triage` - Calculate triage level based on selected symptoms
- `/api/health` - Health check endpoint

### Triage Logic

Symptoms are evaluated and assigned urgency levels:

- **RED (Urgent)**: Requires immediate medical attention
  - Severe symptoms or dangerous combinations
  - Example: Severe bleeding + fever
  
- **YELLOW (Caution)**: Requires same-day or next-day evaluation
  - Multiple symptoms or moderate symptoms
  - Example: Fever + fatigue
  
- **GREEN (Routine)**: Standard monitoring
  - No symptoms or single minor symptom
  - Example: Mild fatigue

## Customization

### Add/Modify Symptoms
Edit `server/triage-logic.js` in the `getSymptomDefinitions()` function:

```javascript
export const getSymptomDefinitions = () => {
  return {
    new_symptom: "Description of symptom",
    // ... more symptoms
  };
};
```

### Change Triage Rules
Modify the `calculateTriage()` function in `server/triage-logic.js`:

```javascript
if (hasBleeding && hasFebruaryWarning) {
  // Change urgency level or recommendation here
  return {
    level: "RED",
    urgency: "URGENT - Seek Immediate Care",
    recommendation: "...",
  };
}
```

### Update Frontend Styling
Edit `public/index.html` in the `<style>` section for colors, fonts, layout.

## Deployment

### To Railway
```bash
railway link
railway up
```

### To Docker
```bash
docker build -t triage-app .
docker run -p 5000:5000 triage-app
```

## Environment Variables

See `.env.example` for available configuration options.

## API Examples

### Get Symptoms
```bash
curl http://localhost:5000/api/symptoms
```

Response:
```json
[
  {
    "id": "fever",
    "label": "Temperature above 100.4°F (38°C)",
    "value": "fever"
  }
]
```

### Calculate Triage
```bash
curl -X POST http://localhost:5000/api/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "fatigue"]}'
```

Response:
```json
{
  "success": true,
  "level": "YELLOW",
  "urgency": "Caution - Contact Provider Within 24 Hours",
  "recommendation": "Contact your hematologist within 24 hours...",
  "symptomsSelected": ["fever", "fatigue"],
  "timestamp": "2026-07-13T15:30:00Z"
}
```

## Notes for Workshop

This prototype demonstrates:
- ✅ Rapid prototyping from requirements to working app (~45 min)
- ✅ User-centric design (simple, clear interface)
- ✅ Domain-specific logic (hematology triage rules)
- ✅ Real deployment (not just a mockup)

Customize the symptom list and triage rules based on domain expertise during the workshop.

## Support

For questions or issues during development:
1. Check that Node 18+ is installed
2. Verify npm dependencies: `npm install`
3. Check server logs for error messages
4. Ensure PORT 5000 is available
