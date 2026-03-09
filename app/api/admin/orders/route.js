// ============================================================
// FILE: app/api/admin/orders/route.js  (replace fully)
// Returns orders joined with delivery address + user info
// ============================================================
import { db } from '@/lib/db'
import { orders, addresses, users, orderItems, products } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

async function isAdmin() {
  const user = await getOrCreateUser()
  return user?.isAdmin === true
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all orders newest first
  const allOrders = await db.select().from(orders).orderBy(orders.createdAt)

  // For each order, fetch address + user + items in parallel
  const enriched = await Promise.all(
    allOrders.map(async (order) => {
      // Get delivery address
      const [address] = order.addressId
        ? await db.select().from(addresses).where(eq(addresses.id, order.addressId))
        : [null]

      // Get user info
      const [user] = order.userId
        ? await db.select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
          }).from(users).where(eq(users.clerkId, order.userId))
        : [null]

      // Get order items with product names
      const items = await db
        .select({
          quantity: orderItems.quantity,
          price: orderItems.price,
          name: products.name,
          imageUrl: products.imageUrl,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id))

      return {
        ...order,
        address: address ?? null,
        user: user ?? null,
        items: items ?? [],
      }
    })
  )

  return NextResponse.json(enriched)
}

export async function PUT(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning()
  return NextResponse.json(order)
}
