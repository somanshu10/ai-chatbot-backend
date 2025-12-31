import fetch from "node-fetch";

export async function geminiChat(context, question) {
  const prompt = `
You are a website assistant.
Answer ONLY from the context below.
If the answer is not present, say "I don't know".

CONTEXT:
${context}

QUESTION:
${question}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const json = await res.json();

  console.log("🔍 GEMINI RAW RESPONSE:", JSON.stringify(json, null, 2));

  // ✅ SAFE TEXT EXTRACTION
  const candidate = json.candidates?.[0];
  if (!candidate || !candidate.content || !candidate.content.parts) {
    return null;
  }

  const text = candidate.content.parts
    .map(p => p.text)
    .filter(Boolean)
    .join("");

  return text || null;
}
