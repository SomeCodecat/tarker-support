import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The workspace packages ship raw TypeScript, so Next must transpile them.
  transpilePackages: ["@tarker/data", "@tarker/tools"],
  // Emit a self-contained server bundle for the Docker runtime image.
  output: "standalone",
  // In a pnpm monorepo the real dependencies live in the repo-root store, so
  // tracing must start from the workspace root to follow the symlinks. `next
  // build` runs with cwd = apps/web (Turbo package dir / Docker WORKDIR), so
  // two levels up is the monorepo root.
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
};

export default nextConfig;
