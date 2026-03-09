import { db } from '@/lib/db'
import { announcements, popups, banners, featuredProducts, products, siteImages } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
    const activeAnnouncements = await db.select().from(announcements).where(eq(announcements.isActive, true))
    const activePopups = await db.select().from(popups).where(eq(popups.isActive, true))
    const activeBanners = await db.select().from(banners).where(eq(banners.isActive, true))
    const allSiteImages = await db.select().from(siteImages)
    const featured = await db.select().from(featuredProducts)
    const allProducts = await db.select().from(products)
    const featuredProductsList = allProducts.filter(p => featured.some(f => f.productId === p.id))

    return NextResponse.json({
        announcements: activeAnnouncements,
        popups: activePopups,
        banners: activeBanners,
        siteImages: allSiteImages,
        featuredProducts: featuredProductsList,
    })
}