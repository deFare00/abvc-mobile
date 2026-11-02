import type { NextConfig } from "next";

const apiDestination =
  process.env.API_DESTINATION ||
  process.env.NEXT_PUBLIC_API_DESTINATION ||
  (process.env.NODE_ENV === "production"
    ? "https://abvc-surveillance.org/nlp/api/v1/:path*"
    : "http://127.0.0.1:8081/api/v1/:path*");

const nextConfig: NextConfig = {
  basePath: "/mobile",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: apiDestination,
      },
      {
        source: "/api/v1/:path*",
        destination: apiDestination,
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
