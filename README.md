# 🌿 Ushas Products — Kerala E-Commerce Store

A full-stack e-commerce web application built for **Ushas Products**, a Kerala-based traditional food brand. Built with Next.js 16, featuring a complete shopping experience, real-time order tracking, and a powerful admin panel.

---

## ✨ Live Features

### 🛍️ Shopping
- Browse products with **search**, **category filters**, **tag filters**, and **price range slider**
- Product detail pages with full description, weight, shelf life, ratings
- Add to cart with quantity controls — persisted in localStorage
- **Wishlist** — save products for later (requires sign in)
- Free delivery on orders above ₹500, else ₹49 flat
- Coupon code support (`USHAS10` for 10% off)

### 📦 Orders
- Full checkout flow with delivery address form and COD payment
- **Order Tracking Page** — animated 6-step timeline:
  `Processing → Confirmed → Shipped → Out for Delivery → Delivered`
  Cancelled orders show a dedicated banner
- Order history in user profile with direct tracking links

### 👤 User Account
- Sign in / Sign up via **Clerk** authentication
- Profile page with order history, account info, and wishlist link
- Delivery addresses saved per user

### 🖥️ Admin Panel (`/admin`)
- **Dashboard** — total products, orders, users, revenue stats
- **Products** — add, edit, delete, toggle stock on/off
- **Orders** — view all orders with customer info, delivery address, items breakdown. Update status across all 6 stages
- **Users** — view all registered users and admin roles
- **Announcements** — scrolling bar at top of home page
- **Popups** — modal notifications shown to visitors
- **Sale Banners** — promotional banners on home page
- **Featured Products** — pick which products show in "Customer Favourites"
- **Site Images** — update hero, about page, and team photos
- **Image Upload** — upload images directly from local computer via Cloudinary (drag & drop, progress bar, preview)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Database | Neon (PostgreSQL serverless) |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Image Storage | Cloudinary |
| Fonts | Tiro Malayalam + Nunito (Google Fonts) |
| Deployment | Vercel (recommended) |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # Clerk sign in page
│   │   └── sign-up/         # Clerk sign up page
│   ├── (main)/
│   │   ├── page.js          # Home page
│   │   ├── shop/
│   │   │   ├── page.js      # Shop listing with filters
│   │   │   └── [slug]/      # Product detail page
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   ├── orders/[id]/     # Order tracking timeline
│   │   ├── profile/         # User account & order history
│   │   ├── wishlist/        # Saved products
│   │   ├── about/           # About page
│   │   └── contact/         # Contact page
│   ├── admin/               # Admin panel
│   ├── api/
│   │   ├── products/        # Public products API
│   │   ├── orders/          # User orders API
│   │   ├── addresses/       # Delivery addresses API
│   │   ├── wishlist/        # Wishlist API
│   │   ├── content/         # Public content API
│   │   └── admin/           # Admin-only APIs
│   └── components/
│       ├── Navbar.jsx
│       └── AdminBar.jsx
├── components/
│   ├── SyncUser.jsx         # Syncs Clerk user to database
│   └── ImageUploader.jsx    # Cloudinary upload widget
└── lib/
    ├── db.js                # Neon database connection
    ├── schema.js            # Drizzle ORM schema
    ├── getOrCreateUser.js   # Auth helper
    └── seed.js              # Database seed data
```

---

## 🗄️ Database Schema

```
users          — Clerk auth sync, admin flag
addresses      — Delivery addresses per user
products       — Product catalog
orders         — Order records with status
orderItems     — Line items per order
wishlist       — Saved products per user
announcements  — Home page announcement bar
popups         — Visitor popup notifications
banners        — Sale banners on home page
featuredProducts — Home page featured section
siteImages     — Hero, about, team photos
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ushas-products.git
cd ushas-products
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# Neon Database
DATABASE_URL=your_neon_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Cloudinary Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Set up the database

Push the schema to your Neon database:

```bash
npm run db:push
```

Seed initial products:

```bash
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Service Setup

### Neon (Database)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Clerk (Authentication)
1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the API keys to your `.env.local`
4. Add `http://localhost:3000` to allowed origins

### Cloudinary (Image Upload)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Note your **Cloud Name** from the dashboard
3. Go to **Settings → Upload → Upload Presets**
4. Create a new preset with **Signing Mode: Unsigned**
5. Add both values to your `.env.local`

---

## 👑 Setting Up Admin Access

After signing up on the site, set your account as admin directly in the database:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

Or use Drizzle Studio:

```bash
npm run db:studio
```

Then navigate to `/admin` to access the panel.

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run db:push    # Push schema changes to database
npm run db:studio  # Open Drizzle visual database editor
npm run db:seed    # Seed database with sample products
```

---

## 🎨 Design

- **Color palette** — Kerala traditional theme: cream, gold, forest green, brown
- **Typography** — Tiro Malayalam (headings) + Nunito (body)
- **Animations** — scroll reveal, skeleton loaders, timeline pulse effects
- **Responsive** — fully mobile-friendly across all pages

---

## 📄 License

This project is private and built for **Ushas Products, Kerala**.

---

*Built with ❤️ in Kerala*
