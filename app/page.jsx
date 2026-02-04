"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function ask() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: question }],
      }),
    });
    const data = await res.json();
    setAnswer(data.reply || "No response");
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>RAnesthesia</h1>
      <p>Educational anesthesia assistant (no patient identifiers).</p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
        placeholder="Ask an anesthesia question…"
      />

      <br /><br />

      <button onClick={ask}>Ask</button>

      <pre style={{ whiteSpace: "pre-wrap" }}>{answer}</pre>
    </main>
  );
}
