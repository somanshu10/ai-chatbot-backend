import { supabase } from "../lib/supabase.js";
import { embedWithFallback, chatWithFallback } from "../lib/models/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, clientId } = req.body;

  const embedding = await embedWithFallback(message);

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: 5,
    client: clientId
  });

  const context = data.map(d => d.content).join("\n\n");
  const reply = await chatWithFallback(context, message);

  res.json({ reply });
}
