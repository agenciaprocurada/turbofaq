import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

/**
 * Middleware usa auth.config.ts (sem Prisma/bcrypt) — Edge Runtime compatível.
 */
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname === '/admin/login'

  // Injeta pathname como header para o layout server component ler
  // (necessário pois a login page está dentro do mesmo layout)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  if (!req.auth && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin))
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
})

export const config = {
  matcher: ['/admin/:path*'],
}
