import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/oauth2') ||
    pathname.startsWith('/logout')
  ) {
    const response = NextResponse.next()
    response.headers.set('Nav-Consumer-Id', 'etterlevelsefront')
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    response.headers.set('X-Real-IP', forwardedFor.split(',')[0].trim())
    return response
  }
}

export const config: {
  matcher: string[]
} = {
  matcher: ['/api/:path*', '/login/:path*', '/oauth2/:path*', '/logout/:path*'],
}
