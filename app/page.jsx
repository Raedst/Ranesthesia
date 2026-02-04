"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!input.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await res.json();
      setReply(data.reply || "⚠️ No reply field returned");
    } catch (e) {
      setReply("❌ Frontend error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>RAnesthesia</h1>
      <p>Educational anesthesia assistant (no patient identifiers).</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask an anesthesia question..."
        rows={4}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={ask} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {reply && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
          {reply}
        </pre>
      )}
    </main>
  );
}
