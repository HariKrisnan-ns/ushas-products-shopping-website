import { db } from '@/lib/db'
import { products, productImages } from '@/lib/schema'
import { ilike, eq, and, inArray, ne } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Helper: attach extra images to each product
async function attachImages(productList) {
  if (!productList.length) return productList

  const ids = productList.map(p => p.id)
  const images = await db.select().from(productImages)
    .where(inArray(productImages.productId, ids))

  // Group images by productId
  const imageMap = {}
  for (const img of images) {
    if (!imageMap[img.productId]) imageMap[img.productId] = []
    imageMap[img.productId].push(img)
  }

  // Sort by position and attach to each product
  return productList.map(p => ({
    ...p,
    images: (imageMap[p.id] || []).sort((a, b) => a.position - b.position),
  }))
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const slug = searchParams.get('slug')

  try {
    let result
    const notDeleted = ne(products.isDeleted, true)  // ← filters out soft-deleted

    if (slug) {
      result = await db.select().from(products)
        .where(and(eq(products.slug, slug), notDeleted))
    } else if (category && search) {
      result = await db.select().from(products)
        .where(and(
          eq(products.category, category),
          ilike(products.name, `%${search}%`),
          notDeleted
        ))
    } else if (category) {
      result = await db.select().from(products)
        .where(and(eq(products.category, category), notDeleted))
    } else if (search) {
      result = await db.select().from(products)
        .where(and(ilike(products.name, `%${search}%`), notDeleted))
    } else {
      result = await db.select().from(products)
        .where(notDeleted)
    }

    // ✅ Attach extra images to every product
    const withImages = await attachImages(result)
    return NextResponse.json(withImages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}