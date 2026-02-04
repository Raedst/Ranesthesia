export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ reply: "❌ OPENAI_API_KEY missing" }),
        { status: 200 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: messages.map(m => ({
          role: m.role,
          content: [{ type: "text", text: m.content }]
        })),
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    const reply =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "⚠️ No response from model";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ reply: `❌ Server error: ${err.message}` }),
      { status: 200 }
    );
  }
}

