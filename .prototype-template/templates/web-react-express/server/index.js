import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { calculateTriage, getSymptomDefinitions, getAllSymptoms } from "./triage-logic.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// API Routes

// GET /api/symptoms - Return available symptoms
app.get("/api/symptoms", (req, res) => {
  const definitions = getSymptomDefinitions();
  const symptoms = getAllSymptoms().map(key => ({
    id: key,
    label: definitions[key],
    value: key
  }));
  res.json(symptoms);
});

// POST /api/triage - Calculate triage level
app.post("/api/triage", (req, res) => {
  const { symptoms } = req.body;

  if (!Array.isArray(symptoms)) {
    return res.status(400).json({
      error: "Invalid request. 'symptoms' must be an array."
    });
  }

  const result = calculateTriage(symptoms);
  res.json({
    success: true,
    ...result,
    symptomsSelected: symptoms,
    timestamp: new Date().toISOString()
  });
});

// GET /api/health - Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET / - Serve index.html for SPA
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Hematology Triage Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/triage`);
});
