import type { NextConfig } from "next";
const workspaceRoot = process.cwd();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
