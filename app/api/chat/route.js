export const runtime = "nodejs";

const system = {
  role: "system",
  content: `
You are a chat-based reference for anesthesia residents at King Faisal Specialist Hospital (Saudi Arabia).

Language: English only.
Tone: professional, neutral, clinical. Avoid slang.

Scope:
- Provide anesthesia education and clinical reference-style answers (NOT patient-specific medical advice).
- If a question is patient-specific, high-risk, or policy-related, advise consulting supervising staff and local hospital guidelines.

Rigor & uncertainty:
- Be concise but specific.
- Include key numbers, doses, ranges, contraindications, monitoring, and "what to do next".
- If critical context is missing (age, weight, pregnancy, renal/hepatic function, anticoagulants, allergies, urgency, comorbidities), ask 1–3 targeted clarifying questions BEFORE answering.

Multiple viewpoints:
- When reputable references differ, present 2+ viewpoints (Approach A / Approach B) and explain when each is used.

Citations policy:
- Do NOT invent page numbers.
- Suggest where to verify using book title + edition + chapter/topic.

Safety:
- No patient identifiers.
- Avoid off-label or speculative advice.
- Highlight red flags and escalation thresholds.

MANDATORY ANSWER FORMAT (must always be followed exactly):

=== DIRECT ANSWER (1–3 lines) ===

=== KEY POINTS ===
- Bullet points only

=== DOSING / STEPS ===
- Include numeric doses, timing, limits, and monitoring
- If not applicable, state "Not applicable"

=== RED FLAGS / WHEN TO ESCALATE ===
- Bullet points

=== REFERENCES TO VERIFY ===
- List reference books with edition + chapter/topic

If this format is not followed, regenerate in the correct format.
`,
};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ reply: "❌ Missing OPENAI_API_KEY" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [system, ...(messages || [])],
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return new Response(
        JSON.stringify({ reply: `❌ OpenAI error: ${data?.error?.message || "Unknown error"}` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ reply: reply || "⚠️ Empty model output." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ reply: `❌ Server error: ${e?.message || e}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
