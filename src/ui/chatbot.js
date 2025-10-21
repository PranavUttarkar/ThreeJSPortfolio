// Lightweight chatbot widget that talks to /api/chat
// Creates a floating chat bubble and panel; no external deps.

function injectStyles() {
  if (document.getElementById("pu-chat-styles")) return;
  const css = `
  .pu-chat-btn{position:fixed;right:18px;bottom:18px;z-index:9999;background:#111;color:#fff;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 24px rgba(0,0,0,0.25);border-radius:999px;padding:12px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font:600 14px/1.1 system-ui,-apple-system,Segoe UI,Roboto}
  .pu-chat-btn:hover{background:#000}
  .pu-chat-panel{position:fixed;right:18px;bottom:76px;width: min(360px,calc(100vw - 36px));height:460px;background:rgba(16,16,16,0.98);color:#eaeaea;border:1px solid rgba(255,255,255,0.12);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.35);display:flex;flex-direction:column;overflow:hidden;z-index:9999}
  .pu-chat-hidden{display:none}
  .pu-chat-header{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between}
  .pu-chat-title{font:600 14px/1.1 system-ui,-apple-system,Segoe UI,Roboto}
  .pu-chat-close{background:transparent;color:#aaa;border:none;font-size:18px;cursor:pointer}
  .pu-chat-msgs{flex:1;overflow:auto;padding:12px 12px 8px;display:flex;flex-direction:column;gap:10px}
  .pu-msg{max-width:85%;padding:10px 12px;border-radius:12px;font:500 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto;white-space:pre-wrap}
  .pu-msg-user{align-self:flex-end;background:#2b2b2b;border:1px solid rgba(255,255,255,0.1)}
  .pu-msg-bot{align-self:flex-start;background:#141414;border:1px solid rgba(255,255,255,0.08)}
  .pu-chat-input{padding:10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px}
  .pu-chat-input textarea{flex:1;resize:none;max-height:120px;min-height:38px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:#0e0e0e;color:#eaeaea;padding:8px 10px;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto}
  .pu-chat-input button{background:#0f62fe;border:none;color:#fff;padding:8px 12px;border-radius:10px;cursor:pointer;font:600 13px/1 system-ui,-apple-system,Segoe UI,Roboto}
  .pu-chat-input button:disabled{opacity:0.6;cursor:not-allowed}
  .pu-chat-suggests{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06)}
  .pu-chip{font:600 12px/1 system-ui,-apple-system,Segoe UI,Roboto;background:#111;border:1px solid rgba(255,255,255,0.08);color:#ddd;padding:8px 10px;border-radius:999px;cursor:pointer}
  /* Inline (embedded) variant */
  .pu-chat-inline{position:static;width:100%;max-width:900px;margin:1rem auto;bottom:auto;right:auto;height:420px;border-radius:16px}
  .pu-chat-inline .pu-chat-close{display:none}
  `;
  const style = document.createElement("style");
  style.id = "pu-chat-styles";
  style.textContent = css;
  document.head.appendChild(style);
}

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on") && typeof v === "function")
      el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  }
  return el;
}

export function initChatbot(options = {}) {
  if (window.__PU_CHAT_INITED__) return; // prevent double-init on the same page
  injectStyles();
  const inline = !!options.inline;
  const title = options.title || "Chat with me";
  const state = {
    // Ensure proper precedence so inline defaults to open=true unless options.open is explicitly set
    open: options.open ?? (inline ? true : false),
    busy: false,
    history: [],
  };

  const btn = inline
    ? null
    : h("button", { class: "pu-chat-btn", title: "Chat with me" }, [
        h("span", { text: "Chat" }),
      ]);

  const header = h("div", { class: "pu-chat-header" }, [
    h("div", { class: "pu-chat-title", text: title }),
    h("button", { class: "pu-chat-close", onclick: () => toggle(false) }, [
      "×",
    ]),
  ]);

  const suggests = h("div", { class: "pu-chat-suggests" }, [
    chip("Summarize your previous internship"),
    chip("What tech do you use most?"),
  ]);

  const msgs = h("div", { class: "pu-chat-msgs" });
  const ta = h("textarea", {
    placeholder: "Type a question… (Shift+Enter for newline)",
  });
  const send = h("button", { text: "Send" });
  const input = h("div", { class: "pu-chat-input" }, [ta, send]);
  const panel = h(
    "section",
    {
      class: "pu-chat-panel" + (inline ? " pu-chat-inline" : " pu-chat-hidden"),
      role: "dialog",
      "aria-label": "Chat with Pranav",
    },
    [header, msgs, input]
  );

  // Map of default canned answers for suggested chips
  const canned = {
    "Summarize your previous internship":
      "At Daikin North America, I designed and deployed an internal enterprise AI Agent Platform. I built multi‑tool MCP agent orchestration platform, integrated internal APIs for workflows like HVAC config generation, comparisons, dealer lookup, and RAG, and shipped 12+ production tools that reduced repetitive tasks for 10k+ employees. I collaborated with PMs and leadership, iterated via demos, and deployed via Azure DevOps into an existing React/Redux GenAI surface.",
    "What tech do you use most?":
      "Day‑to‑day I’m strongest with C++, Python and TypeScript/JavaScript React web systems and PostgreSQL.",
    "Tell me about MindWeb":
      "MindWeb is a gamified productivity web‑app built with React + TypeScript and Supabase (PostgreSQL, Edge Functions, OAuth, Storage). It features friend streaks, notifications, and large data tracking with RLS for multi‑tenant security. I led the early beta (~100 testers), iterated on UX and growth loops, and focused on reliability (e.g., edge functions for streak rollovers).",
  };

  function chip(text) {
    const c = h("button", { class: "pu-chip", text });
    c.addEventListener("click", () => {
      // Simulate user sending the chip text, then auto‑answer after ~4s.
      ta.value = text;
      ta.focus();
      // Immediately "send" without calling the network yet
      const content = (ta.value || "").trim();
      if (!content || state.busy) return;
      ta.value = "";
      pushMessage("user", content);
      state.history.push({ role: "user", content });

      // If we have a canned answer, show it after ~4 seconds and do NOT call the API
      const cannedReply = canned[text];
      if (cannedReply) {
        state.busy = true;
        const prev = send.textContent;
        send.disabled = true;
        send.textContent = "Thinking...";
        setTimeout(() => {
          pushMessage("assistant", cannedReply);
          state.history.push({ role: "assistant", content: cannedReply });
          state.busy = false;
          send.disabled = false;
          send.textContent = prev || "Send";
        }, 4000);
        return;
      }
      // Fallback: if no canned text, go through normal send flow
      onSend();
    });
    return c;
  }

  function toggle(open) {
    state.open = open ?? !state.open;
    panel.classList.toggle("pu-chat-hidden", !state.open);
  }

  if (btn) btn.addEventListener("click", () => toggle());
  send.addEventListener("click", onSend);
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  function pushMessage(role, text) {
    const el = h("div", {
      class: `pu-msg ${role === "user" ? "pu-msg-user" : "pu-msg-bot"}`,
    });
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function onSend() {
    const content = (ta.value || "").trim();
    if (!content || state.busy) return;
    ta.value = "";
    pushMessage("user", content);
    state.history.push({ role: "user", content });
    const prevBtnText = send.textContent;
    send.disabled = true;
    send.textContent = "Thinking...";
    state.busy = true;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: state.history.slice(-10) }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Chat error ${res.status}: ${t}`);
      }
      const data = await res.json();
      const reply = data.reply || data.content || data.text || "(No response)";
      pushMessage("assistant", reply);
      state.history.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error(err);
      const msg = err?.message?.includes("OPENAI_API_KEY")
        ? "Server is missing an API key. Try again later."
        : "Sorry, I hit a snag. Please try again.";
      pushMessage("assistant", msg);
    } finally {
      state.busy = false;
      send.disabled = false;
      send.textContent = prevBtnText || "Send";
    }
  }

  const mountEl = (() => {
    if (options.mount) {
      if (typeof options.mount === "string")
        return document.querySelector(options.mount);
      if (options.mount instanceof HTMLElement) return options.mount;
    }
    return document.body;
  })();

  if (btn) document.body.appendChild(btn);
  mountEl.appendChild(panel);

  // Greet
  pushMessage(
    "assistant",
    "Ask my AI anything about me, my projects, experiences or skills!"
  );

  // mark inited
  window.__PU_CHAT_INITED__ = true;
}

// Auto-init on pages that include this script directly
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    if (window.__PU_CHAT_INITED__) return;
    // Only auto-init floating button variant if not already inited explicitly
    try {
      initChatbot();
    } catch (e) {
      console.error("chatbot init failed", e);
    }
  });
}
