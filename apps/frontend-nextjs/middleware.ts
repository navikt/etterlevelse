import { NextRequest, NextResponse } from 'next/server'
import { URL } from 'url'

export async function middleware(request: NextRequest) {
  const backendUrl: URL = new URL(request.nextUrl)
  backendUrl.host = 'localhost:8080'

  if (backendUrl.pathname.includes('/api')) {
    backendUrl.pathname = backendUrl.pathname.replace('/api', '')
  }

  const headers = request.headers
  headers.set('Nav-Consumer-Id', 'behandlingskatalog-local')

  return NextResponse.rewrite(backendUrl, { headers })
}

export const config = {
  matcher: ['/api/:path*', '/login/:path*', '/oauth2/:path*', '/logout/:path*'],
}
