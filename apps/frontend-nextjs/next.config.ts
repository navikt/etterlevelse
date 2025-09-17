import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const backendUrl =
      process.env.NODE_ENV === 'production'
        ? 'http://etterlevelse-backend'
        : 'http://localhost:8080'
    return [
      // Block /api/internal (handled in middleware, not rewrites)
      // Proxy /api (except /api/internal) to backend, stripping /api
      {
        source: '/api/:path((?!internal).*)',
        destination: `${backendUrl}/:path*`,
      },
      // Proxy /login, /oauth2, /logout to backend
      {
        source: '/login/:path*',
        destination: `${backendUrl}/login/:path*`,
      },
      {
        source: '/oauth2/:path*',
        destination: `${backendUrl}/oauth2/:path*`,
      },
      {
        source: '/logout/:path*',
        destination: `${backendUrl}/logout/:path*`,
      },
      // All other routes: handled by Next.js (static, SPA fallback)
    ]
  },
}

export default nextConfig
