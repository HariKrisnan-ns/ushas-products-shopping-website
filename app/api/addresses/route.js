import { db } from '@/lib/db'
import { addresses } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

// GET - fetch user's addresses
export async function GET() {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const result = await db.select().from(addresses)
            .where(eq(addresses.userId, userId))
            .orderBy(addresses.isDefault)

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }
}

// POST - add new address
export async function POST(req) {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const { name, phone, line1, line2, city, state, pincode, isDefault } = await req.json()

        // if new address is default, unset all others
        if (isDefault) {
            await db.update(addresses)
                .set({ isDefault: false })
                .where(eq(addresses.userId, userId))
        }

        const [newAddress] = await db.insert(addresses)
            .values({ userId, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || false })
            .returning()

        return NextResponse.json(newAddress)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
    }
}

// DELETE - remove address
export async function DELETE(req) {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const { id } = await req.json()

        // ✅ Security fix: only delete if the address belongs to the current user
        const result = await db.delete(addresses)
            .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
            .returning()

        if (result.length === 0) {
            return NextResponse.json({ error: 'Address not found or not yours' }, { status: 403 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }
}