/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3100/:path*' // Proxy to Backend
      }
    ]
  },
  async redirects() {
    return [
        {
            source: '/login',
            destination: '/auth/login',
            permanent: true,
        }
    ]
  }
}

module.exports = nextConfig
