import { geminiEmbed } from "../embeddings/gemini.js";
import { fakeEmbed } from "../embeddings/fake.js";
import { geminiChat } from "./gemini.js";
import { localChat } from "./local.js";

export async function embedWithFallback(text) {
  try {
    return await geminiEmbed(text);
  } catch {
    return fakeEmbed(text);
  }
}

export async function chatWithFallback(context, question) {
  try {
    return await geminiChat(context, question);
  } catch {
    return await localChat(context, question);
  }
}
