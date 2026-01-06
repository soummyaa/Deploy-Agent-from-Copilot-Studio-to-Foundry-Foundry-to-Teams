import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleClaimsQuestion } from "./handlers/claims";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3978;
const FOUNDRY_AGENT_URL = process.env.FOUNDRY_AGENT_URL || "";
const FOUNDRY_AGENT_TOKEN = process.env.FOUNDRY_AGENT_TOKEN || "";
const PAYLOAD_KEY = process.env.FOUNDRY_AGENT_PAYLOAD_KEY || "text";

function ready(): boolean {
  return Boolean(FOUNDRY_AGENT_URL && FOUNDRY_AGENT_TOKEN);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, ready: ready() });
});

app.post("/message", async (req, res) => {
  try {
    if (!ready()) {
      return res.status(503).json({ ok: false, error: "Server not configured for Foundry" });
    }

    const { [PAYLOAD_KEY]: textOverride, text, userId, metadata } = req.body ?? {};
    const inputText = typeof textOverride === "string" ? textOverride : text;
    if (!inputText || typeof inputText !== "string") {
      return res.status(400).json({ ok: false, error: "Missing required field: text" });
    }

    const answer = await handleClaimsQuestion(inputText);
    return res.status(200).json({ ok: true, data: { text: answer, userId, metadata } });
  } catch (err: any) {
    const status = err?.response?.status ?? 502;
    const data = err?.response?.data ?? { message: err?.message ?? "Upstream error" };
    return res.status(status).json({ ok: false, error: data });
  }
});

app.listen(PORT, () => {
  if (!ready()) {
    console.warn("Warning: FOUNDRY_AGENT_URL and/or FOUNDRY_AGENT_TOKEN not set. /message will return 503.");
  }
  console.log(`Teams proxy listening on http://localhost:${PORT}`);
});
