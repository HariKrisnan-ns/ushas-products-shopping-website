// ============================================================
// FILE: app/api/auth/redirect/route.js
// This runs after Clerk sign-in and checks if the user is admin
// ============================================================
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getOrCreateUser()

    if (!user) {
      // Not authenticated yet — send to home
      return NextResponse.json({ redirect: '/' })
    }

    if (user.isAdmin === true) {
      return NextResponse.json({ redirect: '/admin' })
    }

    return NextResponse.json({ redirect: '/' })

  } catch (error) {
    console.error('Auth redirect error:', error)
    return NextResponse.json({ redirect: '/' })
  }
}
