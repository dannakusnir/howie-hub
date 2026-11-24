import type { NextConfig } from "next";

const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/portal/:path*", headers: NOINDEX },
      { source: "/api/portal/:path*", headers: NOINDEX },
    ];
  },
};

export default nextConfig;
