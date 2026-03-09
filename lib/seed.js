import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

const products = [
    {
        name: 'Banana Chips',
        slug: 'banana-chips',
        category: 'Snacks',
        price: 120,
        mrp: 150,
        description: 'Crispy golden chips made from raw nendran bananas, fried in pure coconut oil.',
        imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&auto=format&fit=crop',
        weight: '200g',
        shelfLife: '6 months',
        tag: 'Traditional',
        badge: 'Bestseller',
        rating: '4.8',
        reviews: 248,
    },
    {
        name: 'Kerala Mixture',
        slug: 'kerala-mixture',
        category: 'Snacks',
        price: 95,
        mrp: 110,
        description: 'A crunchy blend of sev, peanuts and spiced lentils — the perfect tea-time snack.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop',
        weight: '150g',
        shelfLife: '4 months',
        tag: 'Traditional',
        badge: 'New',
        rating: '4.6',
        reviews: 132,
    },
    {
        name: 'Organic Coconut Oil',
        slug: 'organic-coconut-oil',
        category: 'Health',
        price: 349,
        mrp: 420,
        description: 'Cold-pressed from fresh coconuts. 100% pure, no additives, rich in MCTs.',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop',
        weight: '500ml',
        shelfLife: '18 months',
        tag: 'Organic',
        badge: 'Organic',
        rating: '4.9',
        reviews: 389,
    },
    {
        name: 'Jackfruit Chips',
        slug: 'jackfruit-chips',
        category: 'Snacks',
        price: 140,
        mrp: 160,
        description: 'Sweet and crispy chakka chips made from ripe Kerala jackfruit.',
        imageUrl: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=400&auto=format&fit=crop',
        weight: '180g',
        shelfLife: '5 months',
        tag: 'Traditional',
        badge: '',
        rating: '4.7',
        reviews: 97,
    },
    {
        name: 'Turmeric Latte Mix',
        slug: 'turmeric-latte-mix',
        category: 'Beverages',
        price: 220,
        mrp: 280,
        description: 'Authentic Kerala turmeric with ginger and black pepper. Immunity booster.',
        imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&auto=format&fit=crop',
        weight: '200g',
        shelfLife: '12 months',
        tag: 'Health',
        badge: 'New',
        rating: '4.5',
        reviews: 76,
    },
    {
        name: 'Murukku',
        slug: 'murukku',
        category: 'Snacks',
        price: 80,
        mrp: 95,
        description: 'Rice flour murukku seasoned with cumin and asafoetida, spiral-shaped and crunchy.',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop',
        weight: '250g',
        shelfLife: '3 months',
        tag: 'Traditional',
        badge: '',
        rating: '4.6',
        reviews: 165,
    },
    {
        name: 'Moringa Powder',
        slug: 'moringa-powder',
        category: 'Health',
        price: 280,
        mrp: 350,
        description: '100% organic drumstick leaves — packed with iron, calcium and antioxidants.',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop',
        weight: '100g',
        shelfLife: '12 months',
        tag: 'Organic',
        badge: 'Organic',
        rating: '4.8',
        reviews: 210,
    },
    {
        name: 'Avalos Podi',
        slug: 'avalos-podi',
        category: 'Traditional',
        price: 65,
        mrp: 80,
        description: 'Classic Kerala roasted rice powder with coconut sugar. A nostalgic treat.',
        imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop',
        weight: '300g',
        shelfLife: '3 months',
        tag: 'Traditional',
        badge: '',
        rating: '4.4',
        reviews: 54,
    },
]

async function seed() {
    console.log('🌱 Seeding products...')
    for (const product of products) {
        await db.insert(schema.products).values(product).onConflictDoNothing()
        console.log(`✅ Added: ${product.name}`)
    }
    console.log('🎉 Seeding complete!')
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
})