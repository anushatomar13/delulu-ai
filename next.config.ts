import type { NextConfig } from "next";
const nextConfig = {
  output: 'export',
  webpack: (config:any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};


export default nextConfig;
