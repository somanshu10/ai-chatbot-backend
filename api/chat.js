import { supabase } from "../lib/supabase.js";
import { embedWithFallback, chatWithFallback } from "../lib/models/index.js";

export default async function handler(req, res) {
  const origin = req.headers.origin || "*";

  // ✅ ALWAYS set CORS headers FIRST
res.setHeader("Access-Control-Allow-Origin", "https://somanshu10.github.io");
res.setHeader("Access-Control-Allow-Methods", "POST");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");


  // ✅ Handle preflight IMMEDIATELY
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Block non-POST after preflight
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, clientId } = req.body;

    if (!message || !clientId) {
      return res.status(400).json({ error: "Missing message or clientId" });
    }

    // 🔒 DOMAIN CHECK (POST only)
    const { data: client } = await supabase
      .from("clients")
      .select("allowed_domain")
      .eq("id", clientId)
      .single();

    if (!client) {
      return res.status(403).json({ error: "Unknown client" });
    }

    // Allow GitHub Pages + actual site
    const allowedDomains = [
      client.allowed_domain,
      "https://somanshu10.github.io"
    ];

    if (!allowedDomains.includes(origin)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 🔍 Embed query
    const embedding = await embedWithFallback(message);

    // 📚 Fetch context
    const { data: docs } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: 5,
      client: clientId
    });

    const context = docs?.map(d => d.content).join("\n\n") || "";

    // 🤖 Generate answer (Gemini → Local fallback)
    const reply = await chatWithFallback(context, message);

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ reply: "AI service error" });
  }
}
