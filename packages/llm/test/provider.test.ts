import { describe, it, expect, afterEach } from "vitest";
import { selectProviderName } from "../src/index.js";

const original = process.env.LLM_PROVIDER;
afterEach(() => {
  if (original === undefined) delete process.env.LLM_PROVIDER;
  else process.env.LLM_PROVIDER = original;
});

describe("selectProviderName", () => {
  it("defaults to gemini when unset", () => {
    delete process.env.LLM_PROVIDER;
    expect(selectProviderName()).toBe("gemini");
  });

  it("honors a valid provider override", () => {
    process.env.LLM_PROVIDER = "openai";
    expect(selectProviderName()).toBe("openai");
  });

  it("falls back to gemini for an unknown value", () => {
    process.env.LLM_PROVIDER = "bogus";
    expect(selectProviderName()).toBe("gemini");
  });
});
