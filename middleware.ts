// ============================================================
// FILE: proxy.ts  (replace fully)
// ============================================================
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const isProtectedRoute = createRouteMatcher([
  '/cart(.*)',
  '/checkout(.*)',
  '/orders(.*)',
  '/wishlist(.*)',
  '/profile(.*)',
  '/admin(.*)',
])

// Only redirect to /admin when landing on the sign-in page
const isSignInPage = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // 1. Protect private routes
  if (isProtectedRoute(req)) auth.protect()

  // 2. Only on sign-in page — if already signed in, check if admin
  if (userId && isSignInPage(req)) {
    try {
      const [user] = await db
        .select({ isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1)

      if (user?.isAdmin === true) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      // Non-admin already signed in — send to home
      return NextResponse.redirect(new URL('/', req.url))
    } catch (e) {
      console.error('Middleware DB check failed:', e)
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}