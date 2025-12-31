import fetch from "node-fetch";

export async function geminiChat(context, question) {
  const prompt = `
You are a website assistant.
Answer ONLY from the context.
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

  return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
