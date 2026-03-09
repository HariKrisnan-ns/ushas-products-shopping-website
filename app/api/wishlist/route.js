import { db } from '@/lib/db'
import { wishlist, products } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

// GET - fetch user's wishlist
export async function GET() {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const items = await db
            .select({
                id: wishlist.id,
                productId: wishlist.productId,
                addedAt: wishlist.addedAt,
                name: products.name,
                price: products.price,
                mrp: products.mrp,
                imageUrl: products.imageUrl,
                category: products.category,
                slug: products.slug,
            })
            .from(wishlist)
            .leftJoin(products, eq(wishlist.productId, products.id))
            .where(eq(wishlist.userId, userId))

        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
    }
}

// POST - add item to wishlist
export async function POST(req) {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const { productId } = await req.json()
        await db.insert(wishlist)
            .values({ userId, productId })
            .onConflictDoNothing()

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
    }
}

// DELETE - remove item from wishlist
export async function DELETE(req) {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const { productId } = await req.json()
        await db.delete(wishlist)
            .where(
                and(
                    eq(wishlist.userId, userId),
                    eq(wishlist.productId, productId)
                )
            )

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
    }
}