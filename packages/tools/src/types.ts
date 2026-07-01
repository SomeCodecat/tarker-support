import type { z } from "zod";

export interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: z.ZodType<TInput>;
  handler: (input: TInput) => Promise<TOutput>;
}
