import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest): Promise<NextResponse<unknown>> {
  const backendUrl: URL = new URL(request.nextUrl)
  backendUrl.host = 'localhost:8080'

  if (backendUrl.pathname.includes('/api')) {
    backendUrl.pathname = backendUrl.pathname.replace('/api', '')
  }

  const headers: Headers = request.headers
  headers.set('Nav-Consumer-Id', 'behandlingskatalog-local')

  return NextResponse.rewrite(backendUrl, { headers })
}

export const config: {
  matcher: string[]
} = {
  matcher: ['/api/:path*', '/login/:path*', '/oauth2/:path*', '/logout/:path*'],
}
