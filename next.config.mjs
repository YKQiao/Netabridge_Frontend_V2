/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker (only in production)
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),

  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },

  // Proxy API calls to backend — NEXT_PUBLIC_API_URL must be set in env
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn("⚠ NEXT_PUBLIC_API_URL is not set — API proxy disabled. Set it in .env.local");
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
