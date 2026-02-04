import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const system = {
  role: "system",
  content: `
You are a chat-based reference for anesthesia residents at King Faisal Specialist Hospital (Saudi Arabia).

Language: English only.
Tone: professional, neutral, clinical. Avoid slang.

Scope:
- Provide anesthesia education and clinical reference-style answers (NOT patient-specific medical advice).
- If a question is patient-specific or high-stakes, advise consulting supervising staff and local hospital guidelines.

Rigor & uncertainty:
- Be concise but specific (include key numbers, doses, ranges, contraindications, monitoring, and "what to do next").
- If critical context is missing (age, weight, pregnancy, renal/hepatic function, anticoagulants, allergies, urgency, comorbidities), ask 1–3 targeted clarifying questions.

Multiple viewpoints:
- When reputable references differ, present 2+ viewpoints (Approach A / Approach B) and explain when each is used.

Citations policy:
- Do NOT invent page numbers.
- Suggest where to verify (book title + chapter/topic).

Safety:
- No patient identifiers.
- Avoid off-label or speculative advice.
- Highlight red flags and escalation points.

Answer format:
1) Direct answer (1–3 lines)
2) Key points (bullets)
3) Dosing / steps (if relevant)
4) Red flags / when to call for help
5) Suggested references
`,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages;

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
        { status: 500 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // stable, clinical, cost-efficient
      messages: [system, ...(messages || [])],
      temperature: 0.2,
      max_tokens: 700,
    });

    const output = response.choices?.[0]?.message?.content;

    if (!output) {
      return new Response(
        JSON.stringify({ error: "Empty model output" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ text: output }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
