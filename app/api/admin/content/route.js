import { db } from '@/lib/db'
import { announcements, popups, banners, featuredProducts, siteImages } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

async function isAdmin() {
  const user = await getOrCreateUser()
  return user?.isAdmin === true
}

export async function POST(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type, data } = await req.json()

  let result
  if (type === 'announcement') {
    ;[result] = await db.insert(announcements).values(data).returning()
  } else if (type === 'popup') {
    ;[result] = await db.insert(popups).values(data).returning()
  } else if (type === 'banner') {
    ;[result] = await db.insert(banners).values(data).returning()
  } else if (type === 'featured') {
    ;[result] = await db.insert(featuredProducts).values(data).returning()
  } else if (type === 'siteImage') {
    ;[result] = await db.insert(siteImages)
      .values(data)
      .onConflictDoUpdate({ target: siteImages.key, set: { imageUrl: data.imageUrl, updatedAt: new Date() } })
      .returning()
  }
  return NextResponse.json(result)
}

export async function PUT(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type, id, data } = await req.json()

  let result
  if (type === 'announcement') {
    ;[result] = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning()
  } else if (type === 'popup') {
    ;[result] = await db.update(popups).set(data).where(eq(popups.id, id)).returning()
  } else if (type === 'banner') {
    ;[result] = await db.update(banners).set(data).where(eq(banners.id, id)).returning()
  }
  return NextResponse.json(result)
}

export async function DELETE(req) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type, id } = await req.json()

  if (type === 'announcement') await db.delete(announcements).where(eq(announcements.id, id))
  else if (type === 'popup') await db.delete(popups).where(eq(popups.id, id))
  else if (type === 'banner') await db.delete(banners).where(eq(banners.id, id))
  else if (type === 'featured') await db.delete(featuredProducts).where(eq(featuredProducts.id, id))

  return NextResponse.json({ success: true })
}
