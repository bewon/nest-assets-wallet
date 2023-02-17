const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  i18n,
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
