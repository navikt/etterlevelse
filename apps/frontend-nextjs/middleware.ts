import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const backendUrl = new URL(request.nextUrl)
  backendUrl.host = 'localhost:8080'

  const headers = request.headers
  headers.set('Nav-Consumer-Id', 'behandlingskatalog-local')

  return NextResponse.rewrite(backendUrl, { headers })
}

export const config = {
  matcher: ['/api/:path*', '/login/:path*', '/oauth2/:path*', '/logout/:path*'],
}
