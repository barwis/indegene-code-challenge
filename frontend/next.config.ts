import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    COPILOTKIT_TELEMETRY_DISABLED: "true",
  },
};

export default nextConfig;
