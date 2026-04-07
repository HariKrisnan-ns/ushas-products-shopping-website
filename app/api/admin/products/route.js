import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'
import { CATEGORIES } from '@/lib/categories'

async function isAdmin() {
  const user = await getOrCreateUser()
  return user?.isAdmin === true
}

// ✅ Helper: extract only known product fields from request body
function extractProductFields(body) {
  const {
    name, slug, category, price, mrp, description,
    imageUrl, weight, shelfLife, tag, badge,
    rating, reviews, inStock
  } = body

  // Basic validation
  if (!name || typeof name !== 'string') throw new Error('Invalid name')
  if (!price || isNaN(Number(price))) throw new Error('Invalid price')
  if (!category || !CATEGORIES.includes(category)) throw new Error('Invalid category')
  return {
    name: String(name).trim(),
    slug: slug ? String(slug).trim() : name.toLowerCase().replace(/\s+/g, '-'),
    category: String(category).trim(),
    price: parseInt(price),
    mrp: mrp ? parseInt(mrp) : parseInt(price),
    description: description ? String(description).trim() : null,
    imageUrl: imageUrl ? String(imageUrl).trim() : null,
    weight: weight ? String(weight).trim() : null,
    shelfLife: shelfLife ? String(shelfLife).trim() : null,
    tag: tag ? String(tag).trim() : null,
    badge: badge ? String(badge).trim() : null,
    rating: rating ? parseFloat(rating) : 0,
    reviews: reviews ? parseInt(reviews) : 0,
    inStock: inStock !== undefined ? Boolean(inStock) : true,
  }
}

// POST — add new product
export async function POST(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const fields = extractProductFields(body) // ✅ only known fields, validated
    const [product] = await db.insert(products).values(fields).returning()
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 400 })
  }
}

// PUT — edit product
export async function PUT(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    const fields = extractProductFields(body) // ✅ only known fields, validated
    const [product] = await db.update(products).set(fields).where(eq(products.id, id)).returning()
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 400 })
  }
}

// DELETE — delete product
export async function DELETE(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    await db.delete(products).where(eq(products.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}