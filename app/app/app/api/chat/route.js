export const runtime = "nodejs";

const SYSTEM = `You are RAnesthesia, an anesthesia resident education assistant (English-only).
Educational use only. No patient identifiers. Use safe, concise bullet points.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), { status: 500 });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, ...(messages || [])],
        temperature: 0.2
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "No response";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
