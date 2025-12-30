import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { supabase } from "../lib/supabase.js";
import { embedWithFallback } from "../lib/models/index.js";

const CLIENT_ID = "dreamyoga";
const URL = "https://dreamyoga1.vercel.app/";

async function extractText(url) {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

async function run() {
  const text = await extractText(URL);
  const chunks = text.match(/.{1,400}/g);

  for (const chunk of chunks) {
    const embedding = await embedWithFallback(chunk);
    const { error } = await supabase.from("documents").insert({
  client_id: CLIENT_ID,
  content: chunk,
  embedding
});

if (error) {
  console.error("❌ Insert error:", error);
}
  }

  console.log("✅ Website embedded");
}

run();
