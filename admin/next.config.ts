/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://urban-rush.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
