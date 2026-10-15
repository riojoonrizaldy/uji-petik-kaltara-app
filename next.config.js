/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/uploads/:filename', destination: '/api/uploads/:filename' },
      ],
    };
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  }
};

module.exports = nextConfig;
