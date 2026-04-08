'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [activeIndex, setActiveIndex] = useState(0) // carousel index
  const [touchStart, setTouchStart] = useState(null) // for swipe on mobile

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        const p = data[0] || null
        setProduct(p)
        // Set first image: use extra images if available, else fall back to imageUrl
        if (p) {
          setActiveIndex(0) // always start from first image
        }
        setLoading(false)
      })
      .catch(() => { setProduct(null); setLoading(false) })
  }, [slug])

  useEffect(() => {
    const saved = localStorage.getItem('ushas-cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const addToCart = () => {
    if (!product) return
    const existing = cart.find(i => i.id === product.id)
    const newCart = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { ...product, qty }]
    setCart(newCart)
    localStorage.setItem('ushas-cart', JSON.stringify(newCart))
    setAddedToCart(true)
    showToast(`🛒 ${product.name} added to cart!`)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const addToWishlist = async () => {
    if (!product) return
    if (!isSignedIn) { router.push('/sign-in'); return }
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      setWishlisted(true)
      showToast('❤️ Added to wishlist!')
    } catch {
      showToast('❌ Something went wrong')
    }
  }

  // Build full image list: extra images first, then fall back to main imageUrl
  const getAllImages = (p) => {
    if (!p) return []
    const all = []
    // Always include the main imageUrl first
    if (p.imageUrl) all.push(p.imageUrl)
    // Then add any extra uploaded images (avoid duplicates)
    for (const img of (p.images || [])) {
      if (img.imageUrl && img.imageUrl !== p.imageUrl) all.push(img.imageUrl)
    }
    return all
  }

  const discount = product ? Math.round((1 - product.price / product.mrp) * 100) : 0

  // ── LOADING ──
  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
        body { font-family:'Nunito',sans-serif; background:#FDFAF3; }
        .skel-page { padding:48px 80px; display:grid; grid-template-columns:1fr 1fr; gap:60px; }
        .skel { background:linear-gradient(90deg,#F4EDD8 25%,#EDE0C4 50%,#F4EDD8 75%); background-size:200% 100%; animation:sh 1.5s infinite; border-radius:12px; }
        @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(max-width:768px){ .skel-page{grid-template-columns:1fr;padding:24px 20px;gap:24px;} }
      `}</style>
      <div className="skel-page">
        <div className="skel" style={{ height: 420, borderRadius: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[60, 200, 80, 100, 120, 60].map((w, i) => (
            <div key={i} className="skel" style={{ height: 16, width: `${w}%`, maxWidth: w + 'px' }} />
          ))}
        </div>
      </div>
    </>
  )

  // ── NOT FOUND ──
  if (!product) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@400;700;800&display=swap');
        body { font-family:'Nunito',sans-serif; background:#FDFAF3; }
        .nf { text-align:center; padding:100px 24px; }
        .nf-icon { font-size:64px; margin-bottom:20px; }
        .nf h2 { font-family:'Tiro Malayalam',serif; font-size:32px; margin-bottom:12px; color:#1E120A; }
        .nf p { font-size:15px; color:#7A5C3A; margin-bottom:28px; }
        .nf a { display:inline-flex; align-items:center; gap:8px; padding:13px 28px; background:#3A6B35; color:#fff; border-radius:10px; text-decoration:none; font-weight:800; font-size:14px; }
      `}</style>
      <div className="nf">
        <div className="nf-icon">🌿</div>
        <h2>Product Not Found</h2>
        <p>This product doesn't exist or may have been removed.</p>
        <Link href="/shop">← Back to Shop</Link>
      </div>
    </>
  )

  const allImages = getAllImages(product)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --cream:#FDFAF3; --cream2:#F4EDD8; --cream3:#EDE0C4;
          --gold:#C8790A; --gold-lt:#F0B429; --gold-pl:#FDE8A8;
          --green:#2D5A27; --green-m:#3A6B35; --green-lt:#5A9E52; --green-pl:#D6EDD4;
          --red:#C0392B; --brown:#4A2810; --brown-lt:#6B3F1A;
          --text:#1E120A; --muted:#7A5C3A; --border:rgba(92,51,23,0.12);
          --shadow:rgba(30,18,10,0.08);
        }
        body { font-family:'Nunito',sans-serif; background:var(--cream); color:var(--text); }

        .bc {
          padding:14px 80px;
          background:var(--cream2);
          border-bottom:1px solid var(--border);
          font-size:12.5px; color:var(--muted); font-weight:600;
          display:flex; align-items:center; gap:6px;
        }
        .bc a { color:var(--muted); text-decoration:none; transition:color 0.2s; }
        .bc a:hover { color:var(--green-m); }
        .bc-sep { color:var(--border); font-size:14px; }
        .bc-current { color:var(--text); }

        .pd-wrap { padding:56px 80px; }
        .pd-layout {
          display:grid; grid-template-columns:1fr 1fr;
          gap:64px; align-items:start;
        }

        /* ── IMAGE CAROUSEL ── */
        .pd-img-side {}

        .pd-carousel {
          position:relative;
          border-radius:24px;
          overflow:hidden;          /* keeps arrows/dots inside rounded corners */
          border:1px solid var(--border);
          box-shadow:0 16px 56px var(--shadow);
          background:#fff;
          user-select:none;
        }
        .pd-slides-wrapper {
          width:100%;
          overflow:hidden;
          border-radius:24px;
        }

        /* Slides track */
        .pd-slides-wrapper {
          width:100%;
          overflow:hidden;       /* ✅ clips slides outside view */
        }
        .pd-slides-track {
          display:flex;
          transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);
          will-change:transform;
          width:100%;
        }
        .pd-slide {
          min-width:100%;
          width:100%;
          height:480px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#fff;
          padding:16px;
          flex-shrink:0;
          box-sizing:border-box;
        }
        .pd-slide img {
          max-width:100%; max-height:100%;
          width:auto; height:auto;
          object-fit:contain;   /* ✅ never cropped */
          display:block;
        }

        /* Prev / Next arrow buttons */
        .pd-arrow {
          position:absolute; top:50%; transform:translateY(-50%);
          width:40px; height:40px; border-radius:50%;
          background:rgba(255,255,255,0.92);
          border:1px solid var(--border);
          box-shadow:0 2px 12px var(--shadow);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; z-index:10;
          font-size:18px; color:var(--text);
          transition:background 0.2s, transform 0.15s;
        }
        .pd-arrow:hover { background:#fff; transform:translateY(-50%) scale(1.08); }
        .pd-arrow.prev { left:12px; }
        .pd-arrow.next { right:12px; }
        .pd-arrow.hidden { display:none; }

        /* Dot indicators */
        .pd-dots {
          position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
          display:flex; gap:7px; z-index:10;
        }
        .pd-dot {
          width:8px; height:8px; border-radius:50%;
          background:rgba(30,18,10,0.2);
          cursor:pointer;
          transition:background 0.2s, transform 0.2s;
          border:none;
          padding:0;
        }
        .pd-dot.active {
          background:var(--green-m);
          transform:scale(1.3);
        }

        /* Badge on carousel */
        .pd-img-badge {
          position:absolute; top:20px; left:20px;
          display:flex; flex-direction:column; gap:8px;
          pointer-events:none; z-index:10;
        }
        .pd-badge {
          font-size:10px; font-weight:800; padding:5px 14px;
          border-radius:20px; letter-spacing:0.06em; text-transform:uppercase;
          backdrop-filter:blur(4px);
        }
        .pd-badge.sale { background:var(--red); color:#fff; }
        .pd-badge.new { background:var(--green-m); color:#fff; }
        .pd-badge.organic { background:var(--gold); color:#fff; }
        .pd-badge.bestseller { background:var(--brown); color:#fff; }
        .pd-badge.discount {
          background:rgba(255,255,255,0.92);
          color:var(--red); font-size:12px;
        }

        /* Image counter e.g. 2 / 5 */
        .pd-counter {
          position:absolute; top:14px; right:14px;
          background:rgba(30,18,10,0.5); color:#fff;
          font-size:11px; font-weight:700;
          padding:4px 10px; border-radius:20px;
          z-index:10; pointer-events:none;
        }

        /* Out of stock overlay */
        .pd-out-overlay {
          position:absolute; inset:0;
          background:rgba(255,255,255,0.75);
          display:flex; align-items:center; justify-content:center;
          backdrop-filter:blur(3px); z-index:5;
        }
        .pd-out-label {
          background:var(--brown); color:#fff;
          font-size:14px; font-weight:800; padding:10px 28px;
          border-radius:8px; letter-spacing:0.08em; text-transform:uppercase;
        }

        /* Trust row below thumbnails */
        .pd-img-trust {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:12px; margin-top:16px;
        }
        .pd-trust-item {
          background:#fff; border:1px solid var(--border);
          border-radius:12px; padding:14px 12px; text-align:center;
        }
        .pd-trust-icon { font-size:20px; margin-bottom:4px; }
        .pd-trust-label { font-size:11px; font-weight:700; color:var(--text); }
        .pd-trust-sub { font-size:10px; color:var(--muted); margin-top:2px; }

        /* ── INFO SIDE ── */
        .pd-info {}
        .pd-category {
          display:inline-flex; align-items:center; gap:6px;
          background:var(--green-pl); color:var(--green-m);
          font-size:11px; font-weight:800; letter-spacing:0.14em;
          text-transform:uppercase; padding:5px 14px; border-radius:40px;
          margin-bottom:16px;
        }
        .pd-name {
          font-family:'Tiro Malayalam',serif; font-size:42px;
          line-height:1.12; color:var(--text); margin-bottom:12px;
        }
        .pd-rating {
          display:flex; align-items:center; gap:10px; margin-bottom:20px;
        }
        .pd-stars { color:var(--gold-lt); font-size:17px; letter-spacing:1px; }
        .pd-rating-num { font-size:14px; font-weight:800; color:var(--text); }
        .pd-rating-count { font-size:13px; color:var(--muted); }
        .pd-rating-dot { width:4px; height:4px; border-radius:50%; background:var(--border); }
        .pd-price-block {
          background:linear-gradient(135deg, var(--cream2), var(--gold-pl));
          border:1px solid rgba(200,121,10,0.15);
          border-radius:16px; padding:20px 24px; margin-bottom:24px;
          display:flex; align-items:center; gap:16px; flex-wrap:wrap;
        }
        .pd-price { font-family:'Tiro Malayalam',serif; font-size:44px; font-weight:700; color:var(--gold); line-height:1; }
        .pd-mrp { font-size:16px; color:var(--muted); text-decoration:line-through; font-weight:500; }
        .pd-save {
          display:inline-flex; align-items:center; gap:4px;
          background:var(--green-pl); color:var(--green);
          font-size:12px; font-weight:800; padding:4px 12px;
          border-radius:20px; margin-left:auto;
        }
        .pd-desc { font-size:15px; color:var(--muted); line-height:1.85; margin-bottom:24px; }
        .pd-meta {
          background:#fff; border:1px solid var(--border);
          border-radius:14px; overflow:hidden; margin-bottom:24px;
        }
        .pd-meta-row {
          display:flex; align-items:center;
          padding:12px 18px; border-bottom:1px solid var(--border);
          font-size:13.5px;
        }
        .pd-meta-row:last-child { border-bottom:none; }
        .pd-meta-key {
          width:110px; flex-shrink:0;
          font-weight:800; color:var(--text); font-size:12.5px;
          text-transform:uppercase; letter-spacing:0.06em;
        }
        .pd-meta-val { color:var(--muted); font-weight:600; }
        .pd-meta-val.green { color:var(--green-m); font-weight:800; }
        .pd-meta-val.red { color:var(--red); font-weight:800; }
        .pd-qty-row {
          display:flex; align-items:center; gap:16px; margin-bottom:20px;
        }
        .pd-qty-label { font-size:14px; font-weight:800; color:var(--text); }
        .pd-qty-ctrl {
          display:flex; align-items:center; overflow:hidden;
          border:1.5px solid var(--border); border-radius:10px;
          background:#fff;
        }
        .pd-qty-btn {
          width:40px; height:40px; background:transparent; border:none;
          font-size:20px; cursor:pointer; color:var(--text); font-weight:600;
          transition:background 0.15s; display:flex; align-items:center; justify-content:center;
        }
        .pd-qty-btn:hover { background:var(--green-pl); }
        .pd-qty-num {
          width:48px; text-align:center; font-weight:800; font-size:16px;
          border-left:1px solid var(--border); border-right:1px solid var(--border);
          height:40px; display:flex; align-items:center; justify-content:center;
        }
        .pd-btns { display:flex; gap:12px; margin-bottom:20px; }
        .pd-btn-cart {
          flex:1; padding:15px 24px;
          background:linear-gradient(135deg, var(--green-m) 0%, var(--green) 100%);
          color:#fff; border:none; border-radius:12px;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:800;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow:0 4px 20px rgba(45,90,39,0.3);
          transition:transform 0.15s, box-shadow 0.15s;
          letter-spacing:0.02em;
        }
        .pd-btn-cart:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 28px rgba(45,90,39,0.4); }
        .pd-btn-cart:disabled { background:#c8c8c8; cursor:not-allowed; box-shadow:none; }
        .pd-btn-cart.added { background:linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%); color:#1E120A; }
        .pd-btn-wish {
          width:52px; height:52px; flex-shrink:0; border-radius:12px;
          background:#fff; border:1.5px solid var(--border);
          display:flex; align-items:center; justify-content:center;
          font-size:22px; cursor:pointer;
          transition:border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .pd-btn-wish:hover { border-color:var(--red); transform:scale(1.08); }
        .pd-btn-wish.active { border-color:var(--red); background:#fff5f5; }
        .pd-badges { display:flex; gap:10px; flex-wrap:wrap; }
        .pd-info-badge {
          display:flex; align-items:center; gap:6px;
          padding:8px 14px; background:var(--cream2);
          border:1px solid var(--border); border-radius:8px;
          font-size:12px; font-weight:700; color:var(--text);
        }

        /* ── TABS ── */
        .pd-tabs-wrap { padding:0 80px 72px; }
        .pd-tabs-nav {
          display:flex; gap:0; border-bottom:2px solid var(--border);
          margin-bottom:32px;
        }
        .pd-tab-btn {
          padding:13px 28px; background:none; border:none;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:700;
          cursor:pointer; color:var(--muted);
          border-bottom:2px solid transparent; margin-bottom:-2px;
          transition:color 0.2s, border-color 0.2s;
          letter-spacing:0.02em;
        }
        .pd-tab-btn:hover { color:var(--text); }
        .pd-tab-btn.active { color:var(--green-m); border-bottom-color:var(--green-m); }
        .pd-tab-content { font-size:15px; color:var(--muted); line-height:1.85; max-width:680px; }
        .pd-tab-content h4 { font-size:16px; font-weight:800; color:var(--text); margin-bottom:10px; margin-top:20px; }
        .pd-tab-content h4:first-child { margin-top:0; }
        .pd-tab-content ul { padding-left:20px; display:flex; flex-direction:column; gap:6px; }
        .pd-tab-content li { font-size:14px; }

        /* ── STICKY MOBILE CTA ── */
        .pd-sticky-cta {
          display:none;
          position:fixed; bottom:0; left:0; right:0;
          background:#fff; border-top:1px solid var(--border);
          padding:14px 20px; gap:12px; z-index:100;
          box-shadow:0 -4px 20px var(--shadow);
        }
        .pd-sticky-price { font-family:'Tiro Malayalam',serif; font-size:24px; color:var(--gold); font-weight:700; }
        .pd-sticky-btn {
          flex:1; padding:14px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          color:#fff; border:none; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer;
        }

        /* ── TOAST ── */
        .toast {
          position:fixed; bottom:32px; right:32px; z-index:1000;
          background:var(--green-m); color:#fff;
          padding:14px 20px; border-radius:12px;
          font-size:14px; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,0.18);
          animation:slideUp 0.3s ease;
          display:flex; align-items:center; gap:10px;
          border-left:4px solid var(--gold-lt);
          max-width:300px;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ── RESPONSIVE ── */
        @media(max-width:1200px) {
          .bc { padding:14px 48px; }
          .pd-wrap { padding:48px 48px; }
          .pd-tabs-wrap { padding:0 48px 60px; }
        }
        @media(max-width:1024px) {
          .bc { padding:12px 40px; }
          .pd-wrap { padding:40px; }
          .pd-tabs-wrap { padding:0 40px 48px; }
          .pd-layout { gap:40px; }
          .pd-name { font-size:34px; }
          .pd-price { font-size:36px; }
          .pd-img-main { height:380px; }
        }
        @media(max-width:768px) {
          .bc { padding:12px 20px; }
          .pd-wrap { padding:24px 20px; }
          .pd-layout { grid-template-columns:1fr; gap:32px; }
          .pd-img-main { height:300px; }
          .pd-name { font-size:30px; }
          .pd-price { font-size:34px; }
          .pd-tabs-wrap { padding:0 20px 80px; }
          .pd-sticky-cta { display:flex; align-items:center; }
          .pd-thumb { width:62px; height:62px; }
        }
        @media(max-width:480px) {
          .bc { padding:10px 16px; }
          .pd-wrap { padding:16px; }
          .pd-name { font-size:26px; }
          .pd-price { font-size:28px; }
          .pd-img-main { height:260px; }
          .pd-img-trust { grid-template-columns:repeat(3,1fr); }
          .pd-tab-btn { padding:11px 16px; font-size:13px; }
          .pd-tabs-wrap { padding:0 16px 80px; }
          .pd-thumb { width:54px; height:54px; }
        }
      `}</style>

      {/* BREADCRUMB */}
      <div className="bc">
        <Link href="/">Home</Link>
        <span className="bc-sep">›</span>
        <Link href="/shop">Shop</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">{product.name}</span>
      </div>

      {/* MAIN */}
      <div className="pd-wrap">
        <div className="pd-layout">

          {/* ── IMAGE CAROUSEL ── */}
          <div className="pd-img-side">
            <div
              className="pd-carousel"
              onTouchStart={e => setTouchStart(e.touches[0].clientX)}
              onTouchEnd={e => {
                if (touchStart === null) return
                const diff = touchStart - e.changedTouches[0].clientX
                if (diff > 50) setActiveIndex(i => Math.min(allImages.length - 1, i + 1)) // swipe left → next
                if (diff < -50) setActiveIndex(i => Math.max(0, i - 1))                    // swipe right → prev
                setTouchStart(null)
              }}
            >

              {/* Slides */}
              <div className="pd-slides-wrapper">
                <div
                  className="pd-slides-track"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {allImages.map((url, i) => (
                    <div className="pd-slide" key={i}>
                      <img src={url} alt={`${product.name} — image ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev arrow */}
              <button
                className={`pd-arrow prev ${activeIndex === 0 ? 'hidden' : ''}`}
                onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
                aria-label="Previous image"
              >‹</button>

              {/* Next arrow */}
              <button
                className={`pd-arrow next ${activeIndex === allImages.length - 1 ? 'hidden' : ''}`}
                onClick={() => setActiveIndex(i => Math.min(allImages.length - 1, i + 1))}
                aria-label="Next image"
              >›</button>

              {/* Dot indicators — only if more than 1 image */}
              {allImages.length > 1 && (
                <div className="pd-dots">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      className={`pd-dot ${activeIndex === i ? 'active' : ''}`}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="pd-counter">{activeIndex + 1} / {allImages.length}</div>
              )}

              {/* Badges */}
              <div className="pd-img-badge">
                {product.badge && (
                  <span className={`pd-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>
                )}
                {discount > 0 && (
                  <span className="pd-badge discount">🏷️ {discount}% OFF</span>
                )}
              </div>

              {/* Out of stock overlay */}
              {!product.inStock && (
                <div className="pd-out-overlay">
                  <span className="pd-out-label">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Trust row */}
            <div className="pd-img-trust">
              {[
                ['🌿', '100% Natural', 'No additives'],
                ['📦', 'Well Packed', 'Stays fresh'],
                ['🚚', 'Fast Delivery', 'Pan India'],
              ].map(([ic, label, sub]) => (
                <div className="pd-trust-item" key={label}>
                  <div className="pd-trust-icon">{ic}</div>
                  <div className="pd-trust-label">{label}</div>
                  <div className="pd-trust-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── INFO ── */}
          <div className="pd-info">
            <div className="pd-category">🌿 {product.category}</div>
            <h1 className="pd-name">{product.name}</h1>

            {product.rating && (
              <div className="pd-rating">
                <span className="pd-stars">
                  {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span className="pd-rating-num">{product.rating}</span>
                <div className="pd-rating-dot" />
                <span className="pd-rating-count">{product.reviews} reviews</span>
              </div>
            )}

            <div className="pd-price-block">
              <div>
                <span className="pd-price">₹{product.price}</span>
                {product.mrp && (
                  <span className="pd-mrp" style={{ marginLeft: 10 }}>₹{product.mrp}</span>
                )}
              </div>
              {discount > 0 && (
                <span className="pd-save">🎉 Save ₹{product.mrp - product.price}</span>
              )}
            </div>

            <p className="pd-desc">{product.description}</p>

            <div className="pd-meta">
              {[
                ['Weight', product.weight],
                ['Shelf Life', product.shelfLife],
                ['Category', product.category],
                ['Delivery', 'Free above ₹500', 'green'],
                ['Stock', product.inStock ? '✅ In Stock' : '❌ Out of Stock', product.inStock ? 'green' : 'red'],
              ].filter(([, val]) => val).map(([key, val, cls]) => (
                <div className="pd-meta-row" key={key}>
                  <span className="pd-meta-key">{key}</span>
                  <span className={`pd-meta-val ${cls || ''}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="pd-qty-row">
              <span className="pd-qty-label">Quantity</span>
              <div className="pd-qty-ctrl">
                <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="pd-qty-num">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              {qty > 1 && (
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  Total: ₹{product.price * qty}
                </span>
              )}
            </div>

            <div className="pd-btns">
              <button
                className={`pd-btn-cart ${addedToCart ? 'added' : ''}`}
                onClick={addToCart}
                disabled={!product.inStock}
              >
                {addedToCart ? '✅ Added to Cart!' : '🛒 Add to Cart'}
              </button>
              <button
                className={`pd-btn-wish ${wishlisted ? 'active' : ''}`}
                onClick={addToWishlist}
                title="Add to wishlist"
              >
                {wishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="pd-badges">
              {['🌿 Natural', '📦 Well Packed', '✅ FSSAI Certified'].map(b => (
                <span className="pd-info-badge" key={b}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pd-tabs-wrap">
        <div className="pd-tabs-nav">
          {[
            ['description', '📄 Description'],
            ['details', '📋 Product Details'],
            ['shipping', '🚚 Shipping & Returns'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`pd-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pd-tab-content">
          {activeTab === 'description' && (
            <div>
              <h4>About this product</h4>
              <p>{product.description}</p>
              <h4>Why you'll love it</h4>
              <ul>
                <li>Made using authentic Kerala recipes passed down through generations</li>
                <li>No artificial colours, flavours or preservatives</li>
                <li>Carefully sourced ingredients from local Kerala farmers</li>
              </ul>
            </div>
          )}
          {activeTab === 'details' && (
            <div>
              <h4>Product Specifications</h4>
              <ul>
                {product.weight && <li><strong>Weight:</strong> {product.weight}</li>}
                {product.shelfLife && <li><strong>Shelf Life:</strong> {product.shelfLife}</li>}
                <li><strong>Category:</strong> {product.category}</li>
                {product.tag && <li><strong>Tag:</strong> {product.tag}</li>}
                <li><strong>Storage:</strong> Store in a cool, dry place away from sunlight</li>
                <li><strong>Certifications:</strong> FSSAI Certified</li>
                <li><strong>Made in:</strong> Thrissur, Kerala, India</li>
              </ul>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div>
              <h4>Delivery</h4>
              <ul>
                <li>Free delivery on orders above ₹500</li>
                <li>Standard delivery in 4–6 business days</li>
                <li>Express delivery available at checkout</li>
                <li>We deliver pan-India</li>
              </ul>
              <h4>Returns & Refunds</h4>
              <ul>
                <li>7-day return policy for damaged or wrong items</li>
                <li>Contact us at hello@ushasproducts.com for returns</li>
                <li>Full refund processed within 5–7 business days</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* STICKY MOBILE CTA */}
      <div className="pd-sticky-cta">
        <div className="pd-sticky-price">₹{product.price}</div>
        <button
          className="pd-sticky-btn"
          onClick={addToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
        </button>
      </div>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
