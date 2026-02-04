export const runtime = "nodejs";

function extractText(data) {
  // 1) Best case: convenience field
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  // 2) Common case: output array with content blocks
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      // Some responses use {type:"output_text", text:"..."}
      if (typeof block?.text === "string" && block.text.trim()) return block.text.trim();
      // Some use nested shapes
      if (typeof block?.value === "string" && block.value.trim()) return block.value.trim();
    }
  }

  // 3) Fallback: look for any string fields that might contain text
  // (kept minimal; if nothing found, return empty)
  return "";
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ reply: "❌ OPENAI_API_KEY missing" }), { status: 200 });
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        // Use the recommended content-block format (most reliable)
        input: (messages || []).map((m) => ({
          role: m.role,
          content: [{ type: "input_text", text: String(m.content || "") }],
        })),
        temperature: 0.2,
        max_output_tokens: 300,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return new Response(
        JSON.stringify({ reply: `❌ OpenAI error: ${data?.error?.message || JSON.stringify(data)}` }),
        { status: 200 }
      );
    }

    const reply = extractText(data);

    // If still empty, return a debug-friendly message (no secrets)
    if (!reply) {
      return new Response(
        JSON.stringify({
          reply: "⚠️ Empty model output. Try again. If it repeats, your project may be blocked by model/output settings.",
          debug: {
            has_output_text: typeof data?.output_text === "string",
            output_len: Array.isArray(data?.output) ? data.output.length : 0,
          },
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ reply: `❌ Server error: ${e?.message || e}` }), { status: 200 });
  }
}
