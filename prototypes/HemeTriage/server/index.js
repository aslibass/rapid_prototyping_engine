import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { appendFile, mkdir, readFile } from "node:fs/promises";

import { runProtocol, PROVENANCE } from "./rules.js";
import { SAMPLE_CASES } from "./cases.js";
import { extractCase, secondOpinion, isConfigured } from "./assistant.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECISIONS_LOG = join(__dirname, "../data/decisions.jsonl");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "../public")));

// The deployed app is public, and the two endpoints below spend real money on a
// personal API key. Gate those — and only those. The protocol, the rail and the
// sign-off stay open, so a fumbled code can never dead-end the demo on stage.
// If ACCESS_CODE is unset (local dev) the gate is a no-op.
const ACCESS_CODE = process.env.ACCESS_CODE || "";

function requireCode(req, res, next) {
  if (!ACCESS_CODE) return next();
  if (req.get("x-access-code") === ACCESS_CODE) return next();
  res.status(401).json({
    error: "Access code required to use the assistant. The protocol still runs without it.",
    needsCode: true,
  });
}

app.get("/api/config", (req, res) => {
  res.json({
    assistantAvailable: isConfigured(),
    codeRequired: Boolean(ACCESS_CODE),
    provenance: PROVENANCE,
  });
});

// Lets the client confirm a code before the first real call, so you find out the
// code is wrong while setting up — not mid-demo.
app.post("/api/unlock", requireCode, (req, res) => res.json({ ok: true }));

app.get("/api/cases", (req, res) => res.json(SAMPLE_CASES));

// The protocol. Deterministic, instant, no API key required — this endpoint is
// the one that must never break during the demo.
app.post("/api/protocol", (req, res) => {
  res.json(runProtocol(req.body ?? {}));
});

app.post("/api/extract", requireCode, async (req, res) => {
  const note = req.body?.note?.trim();
  if (!note) return res.status(400).json({ error: "No referral letter supplied." });
  if (!isConfigured()) {
    return res.status(503).json({
      error: "No ANTHROPIC_API_KEY set — paste-a-letter is unavailable. Fill the form in by hand.",
    });
  }
  try {
    res.json(await extractCase(note));
  } catch (err) {
    console.error("extract failed:", err);
    res.status(502).json({ error: `Extraction failed: ${err.message}` });
  }
});

app.post("/api/opinion", requireCode, async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({
      error: "No ANTHROPIC_API_KEY set — the assistant is unavailable. The protocol tier still stands.",
    });
  }
  try {
    const caseData = req.body ?? {};
    const protocol = runProtocol(caseData);
    res.json(await secondOpinion({ caseData, protocol }));
  } catch (err) {
    console.error("opinion failed:", err);
    res.status(502).json({ error: `Assistant unavailable: ${err.message}` });
  }
});

// The output of record: what the hematologist actually decided.
app.post("/api/signoff", async (req, res) => {
  const { protocolTier, assistantTier, finalTier, rationale, caseData } = req.body ?? {};
  if (!finalTier) return res.status(400).json({ error: "No final tier supplied." });

  const entry = {
    signedAt: new Date().toISOString(),
    protocolTier: protocolTier ?? null,
    assistantTier: assistantTier ?? null,
    finalTier,
    overrodeProtocol: Boolean(protocolTier) && finalTier !== protocolTier,
    overrodeAssistant: Boolean(assistantTier) && finalTier !== assistantTier,
    rationale: rationale?.trim() || null,
    caseData: caseData ?? null,
  };

  try {
    await mkdir(dirname(DECISIONS_LOG), { recursive: true });
    await appendFile(DECISIONS_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("could not write decision log:", err);
    return res.status(500).json({ error: "Sign-off could not be recorded." });
  }
  res.json({ ok: true, entry });
});

app.get("/api/decisions", async (req, res) => {
  try {
    const raw = await readFile(DECISIONS_LOG, "utf8");
    const entries = raw.split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const disagreements = entries.filter(
      (e) => e.protocolTier && e.assistantTier && e.protocolTier !== e.assistantTier,
    ).length;
    res.json({
      count: entries.length,
      disagreements,
      overrodeAssistant: entries.filter((e) => e.overrodeAssistant).length,
      entries: entries.slice(-20).reverse(),
    });
  } catch (err) {
    if (err.code === "ENOENT") return res.json({ count: 0, disagreements: 0, overrodeAssistant: 0, entries: [] });
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`\n  HemeTriage  →  http://localhost:${PORT}`);
  console.log(
    isConfigured()
      ? "  Assistant: enabled (claude-opus-4-8)\n"
      : "  Assistant: DISABLED (no ANTHROPIC_API_KEY) — protocol + sign-off still work\n",
  );
});
