import fetch from "node-fetch";

export async function localChat(context, question) {
  const prompt = `
Answer ONLY from the context.

CONTEXT:
${context}

QUESTION:
${question}
`;

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    })
  });

  const json = await res.json();
  return json.response;
}
