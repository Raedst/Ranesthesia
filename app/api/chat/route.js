export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ reply: "❌ OPENAI_API_KEY missing" }), { status: 200 });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages || [],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return new Response(
        JSON.stringify({ reply: `❌ OpenAI error: ${data?.error?.message || JSON.stringify(data)}` }),
        { status: 200 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({ reply: reply || "⚠️ OpenAI returned no message content." }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ reply: `❌ Server error: ${e?.message || e}` }), { status: 200 });
  }
}
