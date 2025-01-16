/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true
  },
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
  // Ensure pages are properly exported
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/login': { page: '/login' },
      '/signup': { page: '/signup' },
      '/dashboard': { page: '/dashboard' },
    }
  }
}

module.exports = nextConfig; 