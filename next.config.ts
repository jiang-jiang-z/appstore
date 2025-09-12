import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 忽略 ESLint 错误，允许在有 lint 错误的情况下进行生产构建
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略 TypeScript 构建错误
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
