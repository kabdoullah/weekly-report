import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (.next/standalone).
  output: "standalone",
  // Native module — keep it external (not bundled) so its .node binary loads.
  serverExternalPackages: ["better-sqlite3"],
  // Ship the .pptx template with the traced server bundle (read at runtime).
  outputFileTracingIncludes: {
    "/api/reports/**": ["./templates/**"],
  },
};

export default nextConfig;
