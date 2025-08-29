/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for development
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;