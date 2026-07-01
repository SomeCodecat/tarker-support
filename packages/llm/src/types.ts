export interface LlmMessage { role: "system" | "user" | "assistant"; content: string; }

export interface LlmProvider {
  readonly name: "openai" | "gemini" | "anthropic";
  generateText(messages: LlmMessage[]): Promise<string>;
  // vision + tool-calling methods are added in Slice 2/3 when first needed (YAGNI).
}
