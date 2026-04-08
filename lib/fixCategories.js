import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'
import { eq, notInArray } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

const VALID_CATEGORIES = ['Snacks', 'Pickles', 'Oil', 'Powder']

async function fix() {
    console.log('🔍 Checking for products with invalid categories...')

    // Find all products with bad category values
    const bad = await db.select().from(schema.products)
        .where(notInArray(schema.products.category, VALID_CATEGORIES))

    if (bad.length === 0) {
        console.log('✅ All products have valid categories!')
        process.exit(0)
    }

    console.log(`⚠️  Found ${bad.length} products with invalid categories:`)
    for (const p of bad) {
        console.log(`   - "${p.name}" → category: "${p.category}", tag: "${p.tag}"`)
    }

    // Fix them: if category is actually a tag value, move it to tag and set category to 'Snacks'
    for (const p of bad) {
        const fixedTag = p.tag || p.category  // preserve old category as tag if tag is empty
        await db.update(schema.products)
            .set({ category: 'Snacks', tag: fixedTag })
            .where(eq(schema.products.id, p.id))
        console.log(`✅ Fixed "${p.name}": category → "Snacks", tag → "${fixedTag}"`)
    }

    console.log('🎉 Done!')
    process.exit(0)
}

fix().catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
})