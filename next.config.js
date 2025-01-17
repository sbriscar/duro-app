/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Handle www to non-www redirect
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'volleyballthreads.com',
            },
          ],
          destination: 'https://www.volleyballthreads.com/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig 