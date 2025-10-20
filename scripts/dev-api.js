// Lightweight local dev server for /api/chat without needing `vercel dev`.
// - Loads .env.local into process.env
// - Provides minimal Express/Next-style res.status/json shims
// - Listens on port 3000 to match Vite proxy in vite.config.js

import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import handler from "../api/chat.js";

function loadDotEnvLocal() {
  try {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const root = path.resolve(__dirname, "..");
    const envPath = path.join(root, ".env.local");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
    console.log("[dev-api] Loaded .env.local");
  } catch (e) {
    console.warn("[dev-api] Failed to load .env.local:", e?.message || e);
  }
}

loadDotEnvLocal();

const server = http.createServer(async (req, res) => {
  try {
    // Basic CORS for local testing through direct calls (Vite proxy won't need this)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }

    if (req.url?.startsWith("/api/chat")) {
      // Collect body
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const contentType = req.headers["content-type"] || "";
      try {
        req.body =
          contentType.includes("application/json") && raw
            ? JSON.parse(raw)
            : raw;
      } catch {
        req.body = raw;
      }

      // Shim res.status/json used by Vercel/Express-like handlers
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (obj) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
      };

      return handler(req, res);
    }

    // Fallback 404
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not found");
  } catch (e) {
    console.error("[dev-api] Error:", e);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Server error");
  }
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`[dev-api] Listening on http://localhost:${PORT}`);
});
