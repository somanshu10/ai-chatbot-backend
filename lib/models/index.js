import { geminiChat } from "./gemini.js";
import { localChat } from "./local.js";
import { geminiEmbed } from "../embeddings/gemini.js";
import { fakeEmbed } from "../embeddings/fake.js";

export async function embedWithFallback(text) {
  try {
    return await geminiEmbed(text);
  } catch {
    console.warn("Gemini embed failed → fake embed");
    return fakeEmbed(text);
  }
}

export async function chatWithFallback(context, question) {
  try {
    return await geminiChat(context, question);
  } catch {
    console.warn("Gemini chat failed → local LLM");
    return await localChat(context, question);
  }
}
