import { db } from '@/lib/db'
import { orders, orderItems, products, addresses } from '@/lib/schema'
import { eq, inArray } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

// GET - fetch user's orders
export async function GET() {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    try {
        const result = await db.select().from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(orders.createdAt)

        // fetch items for each order
        const ordersWithItems = await Promise.all(
            result.map(async (order) => {
                const items = await db
                    .select({
                        id: orderItems.id,
                        quantity: orderItems.quantity,
                        price: orderItems.price,
                        name: products.name,
                        imageUrl: products.imageUrl,
                    })
                    .from(orderItems)
                    .leftJoin(products, eq(orderItems.productId, products.id))
                    .where(eq(orderItems.orderId, order.id))

                return { ...order, items }
            })
        )

        return NextResponse.json(ordersWithItems)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

// POST - place a new order
export async function POST(req) {
    const user = await getOrCreateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.clerkId

    // ✅ Rate limit: max 10 order attempts per minute per user
    if (isRateLimited(userId, 10, 60_000)) {
        return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    try {
        // ✅ Security fix: only accept productId and quantity from client — never price
        const { items, addressId, paymentMethod } = await req.json()

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 })
        }

        // ✅ Fetch real prices from DB — never trust client-sent prices
        const productIds = items.map(i => i.productId)
        const dbProducts = await db.select().from(products)
            .where(inArray(products.id, productIds))

        // Map productId → real DB price
        const priceMap = {}
        for (const p of dbProducts) {
            priceMap[p.id] = p.price
        }

        // Verify all products exist and are in stock
        for (const item of items) {
            const product = dbProducts.find(p => p.id === item.productId)
            if (!product) {
                return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
            }
            if (!product.inStock) {
                return NextResponse.json({ error: `"${product.name}" is out of stock` }, { status: 400 })
            }
        }

        // ✅ Calculate subtotal server-side using real DB prices
        const subtotal = items.reduce((sum, item) => {
            return sum + (priceMap[item.productId] * item.quantity)
        }, 0)

        // ✅ Calculate delivery fee server-side (free above ₹500)
        const deliveryFee = subtotal >= 500 ? 0 : 49
        const total = subtotal + deliveryFee

        const orderNumber = 'USH-' + Date.now()

        // create order
        const [order] = await db.insert(orders)
            .values({
                orderNumber,
                userId,
                addressId,
                status: 'processing',
                subtotal,
                deliveryFee,
                total,
                paymentMethod: paymentMethod || 'COD',
            })
            .returning()

        // create order items with real DB prices
        for (const item of items) {
            await db.insert(orderItems).values({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: priceMap[item.productId], // ✅ real price from DB, not client
            })
        }

        return NextResponse.json({ success: true, order })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
    }
}