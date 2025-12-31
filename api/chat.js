import { supabase } from "../lib/supabase.js";
import { embedWithFallback, chatWithFallback } from "../lib/models/index.js";

export default async function handler(req, res) {
  // CORS headers (must exist on ALL responses)
  res.setHeader("Access-Control-Allow-Origin", "https://somanshu10.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Let Vercel handle OPTIONS automatically
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, clientId } = req.body;

  if (!message || !clientId) {
    return res.status(400).json({ error: "Missing message or clientId" });
  }

  // 🔐 Validate client
  const { data: client } = await supabase
    .from("clients")
    .select("allowed_domain")
    .eq("id", clientId)
    .single();

  if (!client || client.allowed_domain !== "https://somanshu10.github.io") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 🔍 RAG
  const embedding = await embedWithFallback(message);

  const { data: docs } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: 5,
    client: clientId
  });

  const context = docs?.map(d => d.content).join("\n\n") || "";

  const reply = await chatWithFallback(context, message);

  return res.status(200).json({ reply });
}
