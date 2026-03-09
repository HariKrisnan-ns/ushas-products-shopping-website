import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

async function isAdmin() {
  const user = await getOrCreateUser()
  return user?.isAdmin === true
}

// POST — add new product
export async function POST(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const [product] = await db.insert(products).values(body).returning()
  return NextResponse.json(product)
}

// PUT — edit product
export async function PUT(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...data } = await req.json()
  const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning()
  return NextResponse.json(product)
}

// DELETE — delete product
export async function DELETE(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.delete(products).where(eq(products.id, id))
  return NextResponse.json({ success: true })
}
