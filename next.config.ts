import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/mobile",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://abvc-surveillance.org/nlp/api/v1/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "https://abvc-surveillance.org/nlp/api/v1/:path*",
        basePath: false,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/mobile",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
