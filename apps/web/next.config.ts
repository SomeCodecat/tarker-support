import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The workspace packages ship raw TypeScript, so Next must transpile them.
  transpilePackages: ["@tarker/data", "@tarker/tools"],
};

export default nextConfig;
