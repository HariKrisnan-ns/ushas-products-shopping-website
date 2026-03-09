import { db } from '@/lib/db'
import { orders, orderItems, products, addresses } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

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

    try {
        const { items, addressId, paymentMethod, subtotal, deliveryFee } = await req.json()

        const orderNumber = 'USH-' + Date.now()
        const total = subtotal + deliveryFee

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

        // create order items
        for (const item of items) {
            await db.insert(orderItems).values({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            })
        }

        return NextResponse.json({ success: true, order })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
    }
}