import { geminiChat } from "./gemini.js";
import { localChat } from "./local.js";

export async function chatWithFallback(context, question) {
  try {
    const reply = await geminiChat(context, question);

    // 🔴 CRITICAL FIX
    if (!reply || reply.trim().length === 0) {
      throw new Error("Gemini returned empty response");
    }

    return reply;
  } catch (err) {
    console.warn("⚠️ Gemini failed, using local LLM:", err.message);
    return await localChat(context, question);
  }
}
