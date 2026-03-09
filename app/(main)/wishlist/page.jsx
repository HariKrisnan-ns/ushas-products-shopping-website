// ============================================================
// WISHLIST PAGE → save as: app/(main)/wishlist/page.jsx
// ============================================================
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function WishlistPage() {
  const { isSignedIn } = useUser()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [removing, setRemoving] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    fetch('/api/wishlist')
      .then(res => res.json())
      .then(data => { setWishlist(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isSignedIn])

  const removeFromWishlist = async (productId) => {
    setRemoving(productId)
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    })
    setWishlist(prev => prev.filter(i => i.productId !== productId))
    setRemoving(null)
    showToast('💔 Removed from wishlist')
  }

  const addToCart = (item) => {
    const saved = localStorage.getItem('ushas-cart')
    const cart = saved ? JSON.parse(saved) : []
    const existing = cart.find(i => i.id === item.productId)
    const updated = existing
      ? cart.map(i => i.id === item.productId ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { id: item.productId, name: item.name, price: item.price, mrp: item.mrp, imageUrl: item.imageUrl, category: item.category, qty: 1 }]
    localStorage.setItem('ushas-cart', JSON.stringify(updated))
    showToast(`🛒 ${item.name} added to cart!`)
  }

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
        body { font-family:'Nunito',sans-serif; background:var(--cream); color:var(--text); overflow-x:hidden; }

        /* ── HERO — identical gradient/pattern to shop header ── */
        .wl-hero {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:56px 80px;
          position:relative; overflow:hidden;
        }
        .wl-hero::before {
          content:'❤️';
          position:absolute; right:60px; top:50%;
          transform:translateY(-50%);
          font-size:180px; opacity:0.05;
          pointer-events:none; user-select:none;
          line-height:1;
        }
        .wl-hero::after {
          content:''; position:absolute; inset:0; opacity:0.03;
          background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
          background-size:28px 28px; pointer-events:none;
        }
        .wl-hero-inner { position:relative; z-index:1; }

        /* Breadcrumb — same as shop */
        .wl-bc {
          display:flex; align-items:center; gap:8px;
          font-size:12.5px; color:rgba(255,255,255,0.45);
          margin-bottom:16px; font-weight:600; letter-spacing:0.04em;
        }
        .wl-bc a { color:rgba(255,255,255,0.45); text-decoration:none; transition:color 0.2s; }
        .wl-bc a:hover { color:var(--gold-lt); }
        .wl-bc span { color:rgba(255,255,255,0.25); }

        .wl-hero h1 {
          font-family:'Tiro Malayalam',serif; font-size:48px; color:#fff;
          margin-bottom:10px; line-height:1.1;
        }
        .wl-hero h1 em { color:var(--gold-lt); font-style:normal; }
        .wl-hero p { font-size:15px; color:rgba(255,255,255,0.65); max-width:480px; line-height:1.7; }

        /* Stats bar — identical to shop */
        .wl-hero-stats {
          display:flex; gap:28px; margin-top:28px;
          padding-top:24px; border-top:1px solid rgba(255,255,255,0.08);
        }
        .wl-stat { display:flex; align-items:center; gap:8px; }
        .wl-stat-dot { width:6px; height:6px; border-radius:50%; background:var(--gold-lt); }
        .wl-stat-text { font-size:12.5px; color:rgba(255,255,255,0.5); font-weight:600; }

        /* ── CONTENT ── */
        .wl-content { padding:48px 80px; }

        /* Topbar — mirrors shop topbar */
        .wl-topbar {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:28px; gap:16px; flex-wrap:wrap;
        }
        .wl-topbar-title {
          font-family:'Tiro Malayalam',serif; font-size:26px; color:var(--text);
        }
        .wl-topbar-count { font-size:13px; color:var(--muted); font-family:'Nunito',sans-serif; font-weight:600; }
        .wl-clear-btn {
          display:flex; align-items:center; gap:8px;
          padding:10px 18px; background:#fff;
          border:1.5px solid var(--red); border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:13.5px; font-weight:700;
          cursor:pointer; color:var(--red);
          transition:all 0.2s;
        }
        .wl-clear-btn:hover { background:var(--red); color:#fff; }

        /* ── PRODUCT GRID — identical to shop prod-grid ── */
        .wl-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:20px;
        }

        .wl-card {
          background:#fff; border-radius:18px; overflow:hidden;
          border:1px solid var(--border);
          transition:box-shadow 0.28s, transform 0.28s;
          display:flex; flex-direction:column;
        }
        .wl-card:hover {
          box-shadow:0 16px 48px var(--shadow);
          transform:translateY(-5px);
        }
        .wl-card.removing {
          opacity:0.4; transform:scale(0.97);
          transition:opacity 0.3s, transform 0.3s;
          pointer-events:none;
        }

        /* Image wrap — same as prod-img-wrap */
        .wl-img-wrap { position:relative; overflow:hidden; height:195px; flex-shrink:0; }
        .wl-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
        .wl-card:hover .wl-img { transform:scale(1.08); }

        /* Badge — same as prod-badge */
        .wl-badge {
          position:absolute; top:12px; left:12px;
          font-size:9.5px; font-weight:800; padding:4px 10px;
          border-radius:20px; letter-spacing:0.06em; text-transform:uppercase;
        }
        .wl-badge.sale { background:var(--red); color:#fff; }
        .wl-badge.new { background:var(--green-m); color:#fff; }
        .wl-badge.organic { background:var(--gold); color:#fff; }
        .wl-badge.bestseller { background:var(--brown); color:#fff; }

        /* Remove (heart) button — mirrors prod-wishlist-btn */
        .wl-heart-btn {
          position:absolute; top:12px; right:12px;
          width:34px; height:34px; border-radius:50%;
          background:rgba(255,255,255,0.92); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; backdrop-filter:blur(4px);
          transition:transform 0.2s, background 0.2s;
          box-shadow:0 2px 8px rgba(0,0,0,0.12);
        }
        .wl-heart-btn:hover { transform:scale(1.15); background:#fff8f8; }

        /* Card body — same as prod-body */
        .wl-body { padding:16px; flex:1; display:flex; flex-direction:column; }
        .wl-cat {
          font-size:10px; color:var(--green-m); font-weight:800;
          letter-spacing:0.14em; text-transform:uppercase; margin-bottom:4px;
        }
        .wl-name { font-size:14.5px; font-weight:800; margin-bottom:5px; line-height:1.35; color:var(--text); }
        .wl-desc { font-size:12px; color:var(--muted); line-height:1.6; margin-bottom:auto; padding-bottom:12px; }

        /* Rating — same as prod-rating */
        .wl-rating { display:flex; align-items:center; gap:4px; margin-bottom:10px; }
        .wl-stars { color:var(--gold-lt); font-size:12px; letter-spacing:1px; }
        .wl-rating-num { font-size:11.5px; color:var(--muted); font-weight:600; }

        /* Footer — same as prod-footer */
        .wl-footer {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:12px; border-top:1px solid var(--border);
        }
        .wl-price { font-size:19px; font-weight:900; color:var(--gold); font-family:'Tiro Malayalam',serif; }
        .wl-mrp { font-size:11.5px; color:var(--muted); text-decoration:line-through; margin-left:4px; }
        .wl-off { font-size:10px; font-weight:800; color:var(--red); margin-left:4px; }

        /* Actions — same as prod-actions */
        .wl-actions { display:flex; gap:8px; }
        .wl-add {
          width:36px; height:36px; border-radius:9px;
          background:var(--green-m); color:#fff; border:none;
          cursor:pointer; font-size:18px;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s, transform 0.15s;
          flex-shrink:0;
        }
        .wl-add:hover { background:var(--green); transform:scale(1.08); }
        .wl-view {
          padding:0 14px; height:36px; border-radius:9px;
          background:var(--cream2); color:var(--text);
          border:1.5px solid var(--border);
          font-family:'Nunito',sans-serif; font-size:12.5px; font-weight:800;
          cursor:pointer; text-decoration:none;
          display:flex; align-items:center; justify-content:center;
          transition:border-color 0.2s, background 0.2s;
          white-space:nowrap;
        }
        .wl-view:hover { border-color:var(--green-m); background:var(--green-pl); color:var(--green-m); }

        /* ── SKELETON — same shimmer as shop ── */
        .skel { background:linear-gradient(90deg, var(--cream2) 25%, var(--cream3) 50%, var(--cream2) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .skel-card { background:#fff; border-radius:18px; overflow:hidden; border:1px solid var(--border); }
        .skel-img { height:195px; border-radius:0; }
        .skel-body { padding:16px; display:flex; flex-direction:column; gap:10px; }
        .skel-line { height:11px; }
        .skel-line.s { width:45%; }
        .skel-line.m { width:75%; }
        .skel-line.l { width:90%; }

        /* ── EMPTY STATE — same style as shop ── */
        .wl-empty {
          grid-column:1/-1; text-align:center; padding:80px 24px;
        }
        .wl-empty-icon { font-size:56px; margin-bottom:20px; }
        .wl-empty h3 { font-family:'Tiro Malayalam',serif; font-size:26px; margin-bottom:10px; }
        .wl-empty p { font-size:14.5px; color:var(--muted); margin-bottom:24px; }
        .wl-empty-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px; background:var(--green-m); color:#fff;
          border:none; border-radius:10px; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:800; cursor:pointer; text-decoration:none;
          transition:background 0.2s;
        }
        .wl-empty-btn:hover { background:var(--green); }

        /* Sign-in gate — same as shop's signed-out state */
        .wl-signin-wrap {
          text-align:center; padding:80px 24px;
        }
        .wl-signin-icon { font-size:56px; margin-bottom:20px; }
        .wl-signin-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--green-pl); color:var(--green-m);
          font-size:11px; font-weight:800; letter-spacing:0.18em;
          text-transform:uppercase; padding:5px 16px; border-radius:40px;
          margin-bottom:14px;
        }
        .wl-signin-wrap h3 { font-family:'Tiro Malayalam',serif; font-size:32px; margin-bottom:12px; }
        .wl-signin-wrap p { font-size:15px; color:var(--muted); margin-bottom:28px; max-width:360px; margin-left:auto; margin-right:auto; line-height:1.75; }
        .wl-signin-btn {
          display:inline-block; padding:14px 32px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          color:#fff; border-radius:12px; text-decoration:none;
          font-size:15px; font-weight:900;
          box-shadow:0 4px 20px rgba(45,90,39,0.3);
          transition:transform 0.15s, box-shadow 0.2s;
        }
        .wl-signin-btn:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(45,90,39,0.4); }

        /* ── TOAST — identical to shop ── */
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
          .wl-hero { padding:48px 48px; }
          .wl-content { padding:40px 48px; }
          .wl-grid { grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:1024px) {
          .wl-hero { padding:40px 40px; }
          .wl-content { padding:32px 40px; }
          .wl-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:768px) {
          .wl-hero { padding:36px 24px; }
          .wl-hero h1 { font-size:36px; }
          .wl-content { padding:24px 16px; }
          .wl-hero-stats { display:none; }
          .wl-grid { grid-template-columns:repeat(2,1fr); gap:14px; }
        }
        @media(max-width:480px) {
          .wl-hero { padding:28px 16px; }
          .wl-hero h1 { font-size:28px; }
          .wl-grid { gap:10px; }
          .wl-img-wrap { height:155px; }
          .wl-desc { display:none; }
          .wl-footer { flex-direction:column; align-items:flex-start; gap:10px; }
          .wl-actions { width:100%; }
          .wl-view { flex:1; justify-content:center; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="wl-hero">
        <div className="wl-hero-inner">
          <div className="wl-bc">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/profile">Account</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Wishlist</span>
          </div>
          <h1>My <em>Wishlist</em></h1>
          <p>Your hand-picked favourites — saved and ready whenever you are.</p>
          <div className="wl-hero-stats">
            {[
              ['❤️', `${wishlist.length} Saved item${wishlist.length !== 1 ? 's' : ''}`],
              ['🛒', 'Quick add to cart'],
              ['🌿', 'All authentic Kerala'],
            ].map(([ic, txt]) => (
              <div className="wl-stat" key={txt}>
                <div className="wl-stat-dot" />
                <div className="wl-stat-text">{ic} {txt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="wl-content">

        {/* Not signed in */}
        {!isSignedIn ? (
          <div className="wl-signin-wrap">
            <div className="wl-signin-icon">🔒</div>
            <div className="wl-signin-kicker">Members Only</div>
            <h3>Please Sign In</h3>
            <p>Sign in to view and manage your saved products.</p>
            <Link href="/sign-in" className="wl-signin-btn">Sign In →</Link>
          </div>

        ) : loading ? (
          /* Skeleton — same as shop */
          <div className="wl-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="skel-card">
                <div className="skel skel-img" />
                <div className="skel-body">
                  <div className="skel skel-line s" />
                  <div className="skel skel-line m" />
                  <div className="skel skel-line l" />
                  <div className="skel skel-line s" />
                </div>
              </div>
            ))}
          </div>

        ) : wishlist.length === 0 ? (
          /* Empty state — same as shop */
          <div className="wl-grid">
            <div className="wl-empty">
              <div className="wl-empty-icon">🤍</div>
              <h3>Your wishlist is empty</h3>
              <p>Save your favourite products here for easy access later.</p>
              <Link href="/shop" className="wl-empty-btn">Explore Products →</Link>
            </div>
          </div>

        ) : (
          <>
            {/* Topbar */}
            <div className="wl-topbar">
              <div>
                <span className="wl-topbar-title">Saved Products </span>
                <span className="wl-topbar-count">({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})</span>
              </div>
              <button
                className="wl-clear-btn"
                onClick={async () => {
                  for (const item of wishlist) await removeFromWishlist(item.productId)
                }}
              >
                🗑 Clear All
              </button>
            </div>

            {/* Grid */}
            <div className="wl-grid">
              {wishlist.map(item => {
                const discount = item.mrp && item.price ? Math.round((1 - item.price / item.mrp) * 100) : 0
                return (
                  <div key={item.id} className={`wl-card ${removing === item.productId ? 'removing' : ''}`}>
                    <div className="wl-img-wrap">
                      <img src={item.imageUrl} alt={item.name} className="wl-img" />
                      {item.badge && (
                        <span className={`wl-badge ${item.badge?.toLowerCase()}`}>{item.badge}</span>
                      )}
                      {/* Remove from wishlist — filled heart */}
                      <button
                        className="wl-heart-btn"
                        onClick={() => removeFromWishlist(item.productId)}
                        title="Remove from wishlist"
                      >❤️</button>
                    </div>
                    <div className="wl-body">
                      <div className="wl-cat">{item.category}</div>
                      <div className="wl-name">{item.name}</div>
                      <div className="wl-desc">{item.description?.slice(0, 68)}…</div>
                      {item.rating && (
                        <div className="wl-rating">
                          <span className="wl-stars">★★★★★</span>
                          <span className="wl-rating-num">{item.rating} ({item.reviews || 0})</span>
                        </div>
                      )}
                      <div className="wl-footer">
                        <div>
                          <span className="wl-price">₹{item.price}</span>
                          {item.mrp && <span className="wl-mrp">₹{item.mrp}</span>}
                          {discount > 0 && <span className="wl-off">{discount}% off</span>}
                        </div>
                        <div className="wl-actions">
                          <button className="wl-add" onClick={() => addToCart(item)} title="Add to cart">+</button>
                          <Link href={`/shop/${item.slug}`} className="wl-view">View →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── TOAST — identical to shop ── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
