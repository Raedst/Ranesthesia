export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ reply: "❌ OPENAI_API_KEY is missing (Vercel env var)." }), { status: 200 });
    }

    // Responses API expects input as either a string or an array of items/messages
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: (messages || []).map((m) => ({
          role: m.role,
          content: m.content, // keep it simple: plain string
        })),
        temperature: 0.2,
      }),
    });

    const data = await r.json();

    // If OpenAI returns an error, show it in the UI
    if (!r.ok) {
      return new Response(
        JSON.stringify({ reply: `❌ OpenAI error: ${data?.error?.message || JSON.stringify(data)}` }),
        { status: 200 }
      );
    }

    // Responses API gives a convenience field: output_text
    const reply = data?.output_text;

    return new Response(
      JSON.stringify({ reply: reply && reply.trim() ? reply : "⚠️ Empty model output (no text returned)." }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ reply: `❌ Server error: ${e?.message || e}` }), { status: 200 });
  }
}
