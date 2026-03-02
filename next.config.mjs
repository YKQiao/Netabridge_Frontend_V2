/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },

  // Proxy API calls to backend (only if API URL is configured)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://idealring-api.whitepond-90b8fa05.canadacentral.azurecontainerapps.io";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
