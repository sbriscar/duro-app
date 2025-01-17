/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Remove asset prefix since we're using a custom domain
  // Ensure proper base path
  basePath: '',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
      // Add www to non-www redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'volleyballthreads.com',
          },
        ],
        destination: 'https://www.volleyballthreads.com/:path*',
        permanent: true,
      }
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