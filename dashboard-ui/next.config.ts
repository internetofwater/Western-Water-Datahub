import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  },
};

export default nextConfig;
