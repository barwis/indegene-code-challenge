import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  env: {
    COPILOTKIT_TELEMETRY_DISABLED: "true",
  },
};

export default nextConfig;
