// Vercel serverless function: POST /api/chat
// Expects { messages: [{role, content}, ...] }
// Uses OpenAI Responses API with file_search against a Vector Store to answer as Pranav (1st person).

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const vectorStoreId =
      process.env.OPENAI_VECTOR_STORE_ID || process.env.VECTOR_STORE_ID;

    // Build instruction and transcript into a single input string for Responses API
    const systemInstruction = [
      "You are Pranav Uttarkar's AI Agent, and you must cosplay as him.",
      "Based on the user's query, pull strictly relevant information from the 'About me' Vector Store to craft a personal, accurate answer.",
      "Respond in first-person (I/me) as Pranav.",
      "Be concise and direct—don't be superfluous without reason.",
      "If the Vector Store lacks the answer, say you don't know rather than guessing.",
    ].join(" \n");

    const transcript = messages
      .map((m) => `${m.role || "user"}: ${String(m.content || "").trim()}`)
      .join("\n");

    const composedInput = `${systemInstruction}\n\nChat history:\n${transcript}\n\nAnswer as Pranav:`;

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      input: composedInput,
      temperature: 0.3,
      tools: vectorStoreId
        ? [
            {
              type: "file_search",
              vector_store_ids: [vectorStoreId],
            },
          ]
        : undefined,
    });

    const reply =
      extractOutputText(response) || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("/api/chat error", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Safely extract assistant text from Responses API output shape
function extractOutputText(resp) {
  try {
    // Prefer Responses API "output" envelope if present
    if (Array.isArray(resp?.output)) {
      const texts = [];
      for (const item of resp.output) {
        if (item?.type === "message" && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c?.type === "output_text" && typeof c.text === "string") {
              texts.push(c.text);
            }
          }
        }
        // Some SDKs may also surface top-level output_text items
        if (item?.type === "output_text" && typeof item.text === "string") {
          texts.push(item.text);
        }
      }
      if (texts.length) return texts.join("\n\n").trim();
    }

    // Fallback: some SDKs include choices/messages similar to chat.completions
    const maybeChoice = resp?.choices?.[0]?.message?.content;
    if (typeof maybeChoice === "string") return maybeChoice;
  } catch (_) {
    // ignore
  }
  return "";
}
