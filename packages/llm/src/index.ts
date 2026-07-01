export * from "./types.js";

export function selectProviderName(): "openai" | "gemini" | "anthropic" {
  const p = process.env.LLM_PROVIDER;
  if (p === "openai" || p === "gemini" || p === "anthropic") return p;
  return "gemini"; // default per spec: no Claude billing required
}
