import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function getOrCreateUser() {
    const { userId } = await auth()
    if (!userId) return null

    // Check if user already exists in DB
    const [existing] = await db.select().from(users).where(eq(users.clerkId, userId))
    if (existing) return existing

    // If not, fetch from Clerk and create in DB
    const clerkUser = await currentUser()

    const [newUser] = await db.insert(users).values({
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
        isAdmin: false,
    }).returning()

    return newUser
}