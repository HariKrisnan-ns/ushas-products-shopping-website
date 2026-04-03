import { pgTable, serial, text, integer, boolean, decimal, timestamp, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: text('clerk_id').unique().notNull(),
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    isAdmin: boolean('is_admin').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    pincode: text('pincode').notNull(),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    category: text('category').notNull(),
    price: integer('price').notNull(),
    mrp: integer('mrp').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    weight: text('weight'),
    shelfLife: text('shelf_life'),
    tag: text('tag'),
    badge: text('badge'),
    rating: decimal('rating', { precision: 2, scale: 1 }).default('0'),
    reviews: integer('reviews').default(0),
    inStock: boolean('in_stock').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    orderNumber: text('order_number').unique().notNull(),
    userId: text('user_id').notNull().references(() => users.clerkId),
    addressId: integer('address_id').references(() => addresses.id),
    status: text('status').default('processing'),
    subtotal: integer('subtotal').notNull(),
    deliveryFee: integer('delivery_fee').default(0),
    total: integer('total').notNull(),
    paymentMethod: text('payment_method').default('COD'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
})

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(),
})

export const wishlist = pgTable('wishlist', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').defaultNow(),
}, (t) => ({
    unq: unique().on(t.userId, t.productId),
}))

// Announcements bar (top of home page)
export const announcements = pgTable('announcements', {
    id: serial('id').primaryKey(),
    message: text('message').notNull(),
    isActive: boolean('is_active').default(true),
    color: text('color').default('#3A6B35'),
    createdAt: timestamp('created_at').defaultNow(),
})

// Popup notifications
export const popups = pgTable('popups', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    isActive: boolean('is_active').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

// Sale banners
export const banners = pgTable('banners', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

// Featured products (admin picks which show on home)
export const featuredProducts = pgTable('featured_products', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    position: integer('position').default(0),
    createdAt: timestamp('created_at').defaultNow(),
})

// Site images (hero, about, team)
export const siteImages = pgTable('site_images', {
    id: serial('id').primaryKey(),
    key: text('key').unique().notNull(), // e.g. 'hero', 'about_story', 'team_1'
    imageUrl: text('image_url').notNull(),
    label: text('label'),
    updatedAt: timestamp('updated_at').defaultNow(),
})
// Multiple images per product
export const productImages = pgTable('product_images', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    position: integer('position').default(0), // controls display order
    createdAt: timestamp('created_at').defaultNow(),
})