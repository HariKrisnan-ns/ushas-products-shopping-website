import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that require the user to be signed in
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/cart(.*)',
  '/checkout(.*)',
  '/orders(.*)',
  '/profile(.*)',
  '/wishlist(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()

    // Not signed in → redirect to sign-in page
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Run middleware on all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
