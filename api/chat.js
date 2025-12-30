import { supabase } from "../lib/supabase.js";
import { embedWithFallback, chatWithFallback } from "../lib/models/index.js";

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // ✅ Allow requests from your frontend(s)
  const ALLOWED_ORIGINS = [
    "https://dreamyoga1.vercel.app",
    "https://somanshu10.github.io"
  ];

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Block everything except POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, clientId } = req.body;

    if (!message || !clientId) {
      return res.status(400).json({ error: "Missing message or clientId" });
    }

    // 🔒 Optional domain validation from DB
    const { data: client } = await supabase
      .from("clients")
      .select("allowed_domain")
      .eq("id", clientId)
      .single();

    if (!client || client.allowed_domain !== origin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 🔍 Embed query
    const embedding = await embedWithFallback(message);

    // 📚 Retrieve context
    const { data: docs } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: 5,
      client: clientId
    });

    const context = docs.map(d => d.content).join("\n\n");

    // 🤖 Generate answer
    const reply = await chatWithFallback(context, message);

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ reply: "AI service error" });
  }
}
