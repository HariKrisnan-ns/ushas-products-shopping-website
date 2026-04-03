import { db } from '@/lib/db'
import { productImages } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/getOrCreateUser'
import { NextResponse } from 'next/server'

async function isAdmin() {
    const user = await getOrCreateUser()
    return user?.isAdmin === true
}

// GET - fetch all images for a product
export async function GET(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const productId = parseInt(searchParams.get('productId'))
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

    const images = await db.select().from(productImages)
        .where(eq(productImages.productId, productId))
    return NextResponse.json(images.sort((a, b) => a.position - b.position))
}

// POST - add image to a product
export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { productId, imageUrl, position } = await req.json()
    if (!productId || !imageUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const [image] = await db.insert(productImages)
        .values({ productId, imageUrl, position: position || 0 })
        .returning()
    return NextResponse.json(image)
}

// DELETE - remove an image
export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await db.delete(productImages).where(eq(productImages.id, id))
    return NextResponse.json({ success: true })
}
