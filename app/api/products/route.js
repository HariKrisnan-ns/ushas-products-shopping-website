import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { ilike, eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    try {
        let result

        if (slug) {
            result = await db.select().from(products).where(eq(products.slug, slug))
        } else if (category && search) {
            result = await db.select().from(products)
                .where(and(
                    eq(products.category, category),
                    ilike(products.name, `%${search}%`)
                ))
        } else if (category) {
            result = await db.select().from(products)
                .where(eq(products.category, category))
        } else if (search) {
            result = await db.select().from(products)
                .where(ilike(products.name, `%${search}%`))
        } else {
            result = await db.select().from(products)
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}