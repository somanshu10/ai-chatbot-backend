import fetch from "node-fetch";

export async function geminiChat(context, question) {
  const prompt = `
You are an assistant for a website.
Answer ONLY from the context.
If not found, say "I don't know".

CONTEXT:
${context}

QUESTION:
${question}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}
