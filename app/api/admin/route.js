// ============================================================
// FILE: app/api/admin/route.js  (replace fully)
// ============================================================
import { db } from '@/lib/db'
import { users, products, orders, addresses, orderItems, announcements, popups, banners, featuredProducts, siteImages } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

async function isAdmin() {
  const user = await getOrCreateUser()
  return user?.isAdmin === true
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allProducts = await db.select().from(products)
  const allUsers    = await db.select().from(users)

  // ── Enrich orders with address + user + items ──
  const rawOrders = await db.select().from(orders).orderBy(orders.createdAt)

  const allOrders = await Promise.all(
    rawOrders.map(async (order) => {
      const [address] = order.addressId
        ? await db.select().from(addresses).where(eq(addresses.id, order.addressId))
        : [null]

      const [user] = order.userId
        ? await db.select({
            firstName: users.firstName,
            lastName:  users.lastName,
            email:     users.email,
            phone:     users.phone,
          }).from(users).where(eq(users.clerkId, order.userId))
        : [null]

      const items = await db
        .select({
          quantity: orderItems.quantity,
          price:    orderItems.price,
          name:     products.name,
          imageUrl: products.imageUrl,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id))

      return {
        ...order,
        address: address ?? null,
        user:    user    ?? null,
        items:   items   ?? [],
      }
    })
  )

  const allAnnouncements = await db.select().from(announcements)
  const allPopups        = await db.select().from(popups)
  const allBanners       = await db.select().from(banners)
  const allFeatured      = await db.select().from(featuredProducts)
  const allSiteImages    = await db.select().from(siteImages)

  return NextResponse.json({
    stats: {
      totalProducts: allProducts.length,
      totalOrders:   allOrders.length,
      totalUsers:    allUsers.length,
      totalRevenue:  allOrders.reduce((s, o) => s + (o.total || 0), 0),
    },
    products:      allProducts,
    orders:        allOrders,       // now includes address, user, items
    users:         allUsers,
    announcements: allAnnouncements,
    popups:        allPopups,
    banners:       allBanners,
    featured:      allFeatured,
    siteImages:    allSiteImages,
  })
}
