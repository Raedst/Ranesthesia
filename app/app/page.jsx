"use client";
import { useMemo, useState } from "react";

const TEMPLATES = [
  { title: "Pre-op assessment", prompt: "Generate a structured pre-op anesthesia assessment for: age [ ], weight [ ] kg, ASA [ ], PMH [ ], meds [ ], allergies [ ], surgery [ ]. Include key risks, optimization, and monitoring." },
  { title: "Regional block plan", prompt: "For procedure [ ], propose regional anesthesia options, recommended local anesthetic volume/concentration ranges, contraindications, and a post-op analgesia plan." },
  { title: "LAST emergency", prompt: "Summarize immediate management of suspected local anesthetic systemic toxicity (LAST), including lipid rescue dosing and critical steps." },
  { title: "Anaphylaxis", prompt: "Provide an intraoperative anaphylaxis management algorithm, including epinephrine dosing options and key investigations." },
];

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #d0d5dd",
        padding: "8px 10px",
        borderRadius: 999,
        background: active ? "#ffffff" : "transparent",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [mode, setMode] = useState("Quick");
  const [citations, setCitations] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m RAnesthesia — an anesthesia resident education assistant (English-only).\n\n⚠️ Educational use only. Do not include patient identifiers. Verify local protocols and escalate to a senior for high-risk situations.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => ({ mode, citations }), [mode, citations]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, options }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Server error. Check Vercel Environment Variables: OPENAI_API_KEY, then redeploy.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <header style={{ padding: "12px 0" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>RAnesthesia</h1>
        <p style={{ margin: "6px 0 0", color: "#475467", fontSize: 13 }}>
          Public, English-only. Educational decision support.
        </p>
      </header>

      <section style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#475467" }}>Answer:</span>
          <Chip active={mode === "Quick"} onClick={() => setMode("Quick")}>Quick</Chip>
          <Chip active={mode === "Detailed"} onClick={() => setMode("Detailed")}>Detailed</Chip>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#475467" }}>Citations:</span>
          <Chip active={!citations} onClick={() => setCitations(false)}>Off</Chip>
          <Chip active={citations} onClick={() => setCitations(true)}>On</Chip>
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #eaecf0", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TEMPLATES.map((t) => (
            <button key={t.title} onClick={() => setInput(t.prompt)} style={{ border: "1px solid #d0d5dd", background: "transparent", borderRadius: 10, padding: "8px 10px", cursor: "pointer", fontSize: 13 }}>
              {t.title}
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #eaecf0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #eaecf0" }}>
          <strong style={{ fontSize: 13 }}>Chat</strong>
        </div>

        <div style={{ height: "56vh", overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{ whiteSpace: "pre-wrap", background: m.role === "user" ? "#e7f0ff" : "#f2f4f7", border: "1px solid #eaecf0", borderRadius: 12, padding: "10px 12px", fontSize: 14 }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: "#667085", fontSize: 13 }}>Thinking…</div>}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #eaecf0", display: "flex", gap: 8 }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder="Ask an anesthesia question (no patient identifiers)…" style={{ flex: 1, resize: "vertical", padding: 10, borderRadius: 12, border: "1px solid #d0d5dd", fontSize: 14 }} />
          <button onClick={send} disabled={loading} style={{ width: 110, borderRadius: 12, border: "1px solid #d0d5dd", background: "#111827", color: "white", cursor: "pointer", fontSize: 14 }}>
            Send
          </button>
        </div>
      </section>
    </main>
  );
}
