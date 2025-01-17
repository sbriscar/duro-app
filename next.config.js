/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Ensure proper asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  // Ensure proper base path
  basePath: '',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  // Add trailing slashes to ensure consistent routing
  trailingSlash: true,
  // Image optimization configuration
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true
  },
  // Static file serving configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig; 