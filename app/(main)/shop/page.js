'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [activeFilters, setActiveFilters] = useState([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) setActiveFilters([category])
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (activeFilters.length === 1) params.append('category', activeFilters[0])
    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        let sorted = [...data]
        if (sort === 'price-low') sorted.sort((a, b) => a.price - b.price)
        if (sort === 'price-high') sorted.sort((a, b) => b.price - a.price)
        if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        // Apply price range filter client-side
        sorted = sorted.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
        setProducts(sorted)
        setLoading(false)
      })
  }, [search, activeFilters, sort, priceRange])

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const addToCart = (p) => {
    if (typeof window === 'undefined') return  // ← add this guard
    const saved = localStorage.getItem('ushas-cart')
    const cart = saved ? JSON.parse(saved) : []
    const existing = cart.find(i => i.id === p.id)
    const updated = existing
      ? cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...p, qty: 1 }]
    localStorage.setItem('ushas-cart', JSON.stringify(updated))
    showToast(`🛒 ${p.name} added to cart!`)
  }
  const activeCount = activeFilters.length

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

        /* ── HEADER ── */
        .sh-header {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:56px 80px;
          position:relative; overflow:hidden;
        }
        .sh-header::before {
          content:'ഉഷ';
          position:absolute; right:-20px; top:-30px;
          font-family:'Tiro Malayalam',serif; font-size:220px;
          color:rgba(255,255,255,0.04); line-height:1;
          pointer-events:none; user-select:none;
        }
        .sh-header-inner { position:relative; z-index:1; }
        .sh-breadcrumb {
          display:flex; align-items:center; gap:8px;
          font-size:12.5px; color:rgba(255,255,255,0.45);
          margin-bottom:16px; font-weight:600; letter-spacing:0.04em;
        }
        .sh-breadcrumb a { color:rgba(255,255,255,0.45); text-decoration:none; transition:color 0.2s; }
        .sh-breadcrumb a:hover { color:var(--gold-lt); }
        .sh-breadcrumb span { color:rgba(255,255,255,0.25); }
        .sh-header h1 {
          font-family:'Tiro Malayalam',serif; font-size:48px; color:#fff;
          margin-bottom:10px; line-height:1.1;
        }
        .sh-header h1 em { color:var(--gold-lt); font-style:normal; }
        .sh-header p { font-size:15px; color:rgba(255,255,255,0.65); max-width:480px; line-height:1.7; }

        /* Header stats */
        .sh-header-stats {
          display:flex; gap:28px; margin-top:28px;
          padding-top:24px; border-top:1px solid rgba(255,255,255,0.08);
        }
        .sh-stat { display:flex; align-items:center; gap:8px; }
        .sh-stat-dot { width:6px; height:6px; border-radius:50%; background:var(--gold-lt); }
        .sh-stat-text { font-size:12.5px; color:rgba(255,255,255,0.5); font-weight:600; }

        /* ── LAYOUT ── */
        .sh-layout {
          display:grid; grid-template-columns:272px 1fr;
          gap:32px; padding:48px 80px;
          align-items:start;
        }

        /* ── SIDEBAR ── */
        .sidebar { display:flex; flex-direction:column; gap:16px; position:sticky; top:80px; }

        .filter-card {
          background:#fff; border-radius:16px;
          border:1px solid var(--border);
          overflow:hidden;
        }
        .filter-card-head {
          padding:16px 20px;
          display:flex; justify-content:space-between; align-items:center;
          border-bottom:1px solid var(--border);
          background:var(--cream2);
        }
        .filter-card-title {
          font-size:13px; font-weight:800; letter-spacing:0.08em;
          text-transform:uppercase; color:var(--text);
          display:flex; align-items:center; gap:8px;
        }
        .filter-card-title span { font-size:16px; }
        .filter-clear {
          font-size:11.5px; color:var(--green-m); cursor:pointer;
          background:none; border:none; font-family:'Nunito',sans-serif;
          font-weight:700; padding:4px 10px; border-radius:6px;
          transition:background 0.2s;
        }
        .filter-clear:hover { background:var(--green-pl); }
        .filter-card-body { padding:12px 8px; }

        .filter-opt {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:10px; cursor:pointer;
          font-size:13.5px; font-weight:600; color:var(--text);
          transition:background 0.15s;
          user-select:none;
        }
        .filter-opt:hover { background:var(--cream2); }
        .filter-opt.active { background:var(--green-pl); color:var(--green); }

        /* Custom checkbox */
        .filter-check {
          width:18px; height:18px; border-radius:5px;
          border:2px solid var(--border); background:#fff;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all 0.15s; font-size:11px;
        }
        .filter-opt.active .filter-check {
          background:var(--green-m); border-color:var(--green-m); color:#fff;
        }

        /* Custom radio */
        .filter-radio {
          width:18px; height:18px; border-radius:50%;
          border:2px solid var(--border); background:#fff;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all 0.15s;
        }
        .filter-radio-dot {
          width:8px; height:8px; border-radius:50%;
          background:var(--green-m); opacity:0; transition:opacity 0.15s;
        }
        .filter-opt.active .filter-radio { border-color:var(--green-m); }
        .filter-opt.active .filter-radio-dot { opacity:1; }

        .filter-count {
          margin-left:auto; font-size:11px; font-weight:700;
          background:var(--cream2); color:var(--muted);
          padding:2px 8px; border-radius:20px;
        }
        .filter-opt.active .filter-count { background:rgba(45,90,39,0.15); color:var(--green); }

        /* Active filters bar */
        .active-filters {
          display:flex; flex-wrap:wrap; gap:8px;
          padding:12px 20px; background:var(--cream2);
          border-bottom:1px solid var(--border);
        }
        .active-tag {
          display:inline-flex; align-items:center; gap:6px;
          background:var(--green-m); color:#fff;
          font-size:12px; font-weight:700; padding:4px 12px;
          border-radius:20px; cursor:pointer;
          transition:background 0.2s;
        }
        .active-tag:hover { background:var(--green); }
        .active-tag span { font-size:14px; line-height:1; }

        /* ── MAIN CONTENT ── */
        .sh-main {}

        /* Topbar */
        .sh-topbar {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:20px; gap:16px; flex-wrap:wrap;
        }
        .sh-topbar-left { display:flex; align-items:center; gap:14px; }
        .sh-count-label {
          font-family:'Tiro Malayalam',serif; font-size:26px; color:var(--text);
        }
        .sh-count {
          font-size:13px; color:var(--muted); font-family:'Nunito',sans-serif;
          font-weight:600;
        }

        /* Mobile filter button */
        .mobile-filter-btn {
          display:none;
          align-items:center; gap:8px;
          padding:10px 18px; background:#fff;
          border:1.5px solid var(--border); border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:13.5px; font-weight:700;
          cursor:pointer; color:var(--text); position:relative;
          transition:border-color 0.2s;
        }
        .mobile-filter-btn:hover { border-color:var(--green-m); }
        .mobile-filter-badge {
          position:absolute; top:-6px; right:-6px;
          width:18px; height:18px; border-radius:50%;
          background:var(--green-m); color:#fff;
          font-size:10px; font-weight:800;
          display:flex; align-items:center; justify-content:center;
        }

        /* Sort select */
        .sh-sort {
          padding:10px 16px; border-radius:10px;
          border:1.5px solid var(--border); background:#fff;
          font-family:'Nunito',sans-serif; font-size:13.5px;
          font-weight:600; color:var(--text); outline:none; cursor:pointer;
          transition:border-color 0.2s;
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A5C3A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat;
          background-position:right 12px center;
          padding-right:36px;
        }
        .sh-sort:focus { border-color:var(--green-m); }

        /* Search */
        .sh-search {
          display:flex; align-items:center; gap:12px;
          background:#fff; border:1.5px solid var(--border);
          border-radius:12px; padding:12px 18px;
          margin-bottom:24px;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .sh-search:focus-within {
          border-color:var(--green-m);
          box-shadow:0 0 0 3px rgba(45,90,39,0.08);
        }
        .sh-search-icon { font-size:16px; flex-shrink:0; opacity:0.5; }
        .sh-search input {
          border:none; outline:none; font-family:'Nunito',sans-serif;
          font-size:14px; width:100%; background:transparent; color:var(--text);
          font-weight:500;
        }
        .sh-search input::placeholder { color:var(--muted); }
        .sh-search-clear {
          background:var(--cream2); border:none; border-radius:6px;
          padding:4px 8px; font-size:12px; cursor:pointer; color:var(--muted);
          font-family:'Nunito',sans-serif; font-weight:700;
          flex-shrink:0; transition:background 0.2s;
        }
        .sh-search-clear:hover { background:var(--cream3); }

        /* ── PRODUCT GRID ── */
        .prod-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }

        .prod-card {
          background:#fff; border-radius:18px; overflow:hidden;
          border:1px solid var(--border);
          transition:box-shadow 0.28s, transform 0.28s;
          display:flex; flex-direction:column;
        }
        .prod-card:hover {
          box-shadow:0 16px 48px var(--shadow);
          transform:translateY(-5px);
        }

        .prod-img-wrap { position:relative; overflow:hidden; height:195px; flex-shrink:0; }
        .prod-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
        .prod-card:hover .prod-img { transform:scale(1.08); }

        .prod-badge {
          position:absolute; top:12px; left:12px;
          font-size:9.5px; font-weight:800; padding:4px 10px;
          border-radius:20px; letter-spacing:0.06em; text-transform:uppercase;
        }
        .prod-badge.sale { background:var(--red); color:#fff; }
        .prod-badge.new { background:var(--green-m); color:#fff; }
        .prod-badge.organic { background:var(--gold); color:#fff; }
        .prod-badge.bestseller { background:var(--brown); color:#fff; }

        .prod-out {
          position:absolute; inset:0; background:rgba(255,255,255,0.7);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:800; color:var(--muted);
          letter-spacing:0.06em; text-transform:uppercase;
          backdrop-filter:blur(2px);
        }

        .prod-wishlist-btn {
          position:absolute; top:12px; right:12px;
          width:34px; height:34px; border-radius:50%;
          background:rgba(255,255,255,0.92); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; backdrop-filter:blur(4px);
          transition:transform 0.2s, background 0.2s;
          opacity:0; box-shadow:0 2px 8px rgba(0,0,0,0.12);
        }
        .prod-card:hover .prod-wishlist-btn { opacity:1; }
        .prod-wishlist-btn:hover { transform:scale(1.15); background:#fff; }

        .prod-body { padding:16px; flex:1; display:flex; flex-direction:column; }
        .prod-cat {
          font-size:10px; color:var(--green-m); font-weight:800;
          letter-spacing:0.14em; text-transform:uppercase; margin-bottom:4px;
        }
        .prod-name { font-size:14.5px; font-weight:800; margin-bottom:5px; line-height:1.35; color:var(--text); }
        .prod-desc { font-size:12px; color:var(--muted); line-height:1.6; margin-bottom:auto; padding-bottom:12px; }

        .prod-rating { display:flex; align-items:center; gap:4px; margin-bottom:10px; }
        .prod-stars { color:var(--gold-lt); font-size:12px; letter-spacing:1px; }
        .prod-rating-num { font-size:11.5px; color:var(--muted); font-weight:600; }

        .prod-footer {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:12px; border-top:1px solid var(--border);
        }
        .prod-price { font-size:19px; font-weight:900; color:var(--gold); font-family:'Tiro Malayalam',serif; }
        .prod-mrp { font-size:11.5px; color:var(--muted); text-decoration:line-through; margin-left:4px; }
        .prod-off { font-size:10px; font-weight:800; color:var(--red); margin-left:4px; }

        .prod-actions { display:flex; gap:8px; }
        .prod-add {
          width:36px; height:36px; border-radius:9px;
          background:var(--green-m); color:#fff; border:none;
          cursor:pointer; font-size:18px;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s, transform 0.15s;
          flex-shrink:0;
        }
        .prod-add:hover { background:var(--green); transform:scale(1.08); }
        .prod-view {
          padding:0 14px; height:36px; border-radius:9px;
          background:var(--cream2); color:var(--text);
          border:1.5px solid var(--border);
          font-family:'Nunito',sans-serif; font-size:12.5px; font-weight:800;
          cursor:pointer; text-decoration:none;
          display:flex; align-items:center; justify-content:center;
          transition:border-color 0.2s, background 0.2s;
          white-space:nowrap;
        }
        .prod-view:hover { border-color:var(--green-m); background:var(--green-pl); color:var(--green); }

        /* ── SKELETON ── */
        .skel { background:linear-gradient(90deg, var(--cream2) 25%, var(--cream3) 50%, var(--cream2) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        .skel-card { background:#fff; border-radius:18px; overflow:hidden; border:1px solid var(--border); }
        .skel-img { height:195px; border-radius:0; }
        .skel-body { padding:16px; display:flex; flex-direction:column; gap:10px; }
        .skel-line { height:11px; }
        .skel-line.s { width:45%; }
        .skel-line.m { width:75%; }
        .skel-line.l { width:90%; }

        /* ── EMPTY STATE ── */
        .empty {
          grid-column:1/-1; text-align:center; padding:80px 24px;
        }
        .empty-icon { font-size:56px; margin-bottom:20px; }
        .empty h3 { font-family:'Tiro Malayalam',serif; font-size:26px; margin-bottom:10px; }
        .empty p { font-size:14.5px; color:var(--muted); margin-bottom:24px; }
        .empty-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px; background:var(--green-m); color:#fff;
          border:none; border-radius:10px; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:800; cursor:pointer;
          transition:background 0.2s;
        }
        .empty-btn:hover { background:var(--green); }

        /* ── MOBILE SIDEBAR OVERLAY ── */
        .sidebar-overlay {
          display:none;
          position:fixed; inset:0; background:rgba(0,0,0,0.5);
          z-index:800; backdrop-filter:blur(2px);
        }
        .sidebar-overlay.open { display:block; }
        .sidebar-drawer {
          position:fixed; top:0; left:0; bottom:0; width:300px;
          background:var(--cream); z-index:801; overflow-y:auto;
          transform:translateX(-100%); transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
          padding:24px 20px;
        }
        .sidebar-drawer.open { transform:translateX(0); }
        .sidebar-drawer-head {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:20px;
        }
        .sidebar-drawer-title { font-family:'Tiro Malayalam',serif; font-size:24px; color:var(--text); }
        .sidebar-close {
          width:36px; height:36px; border-radius:50%; background:var(--cream2);
          border:none; cursor:pointer; font-size:18px; color:var(--muted);
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s;
        }
        .sidebar-close:hover { background:var(--cream3); }

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
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        /* ── RESPONSIVE ── */
        @media (max-width:1200px) {
          .sh-header { padding:48px 48px; }
          .sh-layout { padding:40px 48px; }
          .prod-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:1024px) {
          .sh-header { padding:40px 40px; }
          .sh-layout { padding:32px 40px; grid-template-columns:240px 1fr; gap:24px; }
        }
        @media (max-width:768px) {
          .sh-header { padding:36px 24px; }
          .sh-header h1 { font-size:36px; }
          .sh-layout { grid-template-columns:1fr; padding:24px 16px; }
          .sidebar { display:none; }
          .mobile-filter-btn { display:flex; }
          .prod-grid { grid-template-columns:repeat(2,1fr); gap:14px; }
          .sh-header-stats { display:none; }
        }
        @media (max-width:480px) {
          .sh-header { padding:28px 16px; }
          .sh-header h1 { font-size:28px; }
          .sh-layout { padding:16px 12px; }
          .prod-grid { gap:10px; }
          .prod-img-wrap { height:155px; }
          .prod-desc { display:none; }
          .prod-footer { flex-direction:column; align-items:flex-start; gap:10px; }
          .prod-actions { width:100%; }
          .prod-view { flex:1; justify-content:center; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="sh-header">
        <div className="sh-header-inner">
          <div className="sh-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Shop</span>
          </div>
          <h1>Our <em>Products</em></h1>
          <p>Authentic Kerala snacks, cold-pressed oils and traditional treats — made with generations of love.</p>
          <div className="sh-header-stats">
            {[
              ['🛍️', `${products.length || '8'}+ Products`],
              ['🌿', '100% Natural'],
              ['⭐', '4.9 Rated'],
            ].map(([ic, txt]) => (
              <div className="sh-stat" key={txt}>
                <div className="sh-stat-dot" />
                <div className="sh-stat-text">{ic} {txt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="sh-layout">

        {/* ── DESKTOP SIDEBAR ── */}
        <div className="sidebar">
          <SidebarContent
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            sort={sort}
            setSort={setSort}
            setActiveFilters={setActiveFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>

        {/* ── MAIN ── */}
        <div className="sh-main">

          {/* Topbar */}
          <div className="sh-topbar">
            <div className="sh-topbar-left">
              {/* Mobile filter button */}
              <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
                ⚙️ Filters
                {activeCount > 0 && <span className="mobile-filter-badge">{activeCount}</span>}
              </button>
              <div>
                <span className="sh-count-label">All Products </span>
                <span className="sh-count">({products.length} items)</span>
              </div>
            </div>
            <select
              className="sh-sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Active filter tags */}
          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map(f => (
                <span key={f} className="active-tag" onClick={() => toggleFilter(f)}>
                  {f} <span>✕</span>
                </span>
              ))}
              <span className="active-tag" style={{ background: 'var(--muted)' }} onClick={() => setActiveFilters([])}>
                Clear all <span>✕</span>
              </span>
            </div>
          )}

          {/* Search */}
          <div className="sh-search">
            <span className="sh-search-icon">🔍</span>
            <input
              placeholder="Search for banana chips, coconut oil, murukku…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="sh-search-clear" onClick={() => setSearch('')}>Clear</button>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="prod-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : products.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🌿</div>
              <h3>No products found</h3>
              <p>Try different filters or search for something else.</p>
              <button className="empty-btn" onClick={() => { setActiveFilters([]); setSearch('') }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="prod-grid">
              {products.map(p => {
                const discount = p.mrp && p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
                return (
                  <div key={p.id} className="prod-card">
                    <div className="prod-img-wrap">
                      <img src={p.imageUrl || null} alt={p.name} className="prod-img" />
                      {p.badge && (
                        <span className={`prod-badge ${p.badge.toLowerCase()}`}>{p.badge}</span>
                      )}
                      {!p.inStock && <div className="prod-out">Out of Stock</div>}
                      <button
                        className="prod-wishlist-btn"
                        onClick={() => showToast(`❤️ Added to wishlist!`)}
                        title="Add to wishlist"
                      >🤍</button>
                    </div>
                    <div className="prod-body">
                      <div className="prod-cat">{p.category}</div>
                      <div className="prod-name">{p.name}</div>
                      <div className="prod-desc">{p.description?.slice(0, 68)}…</div>
                      {p.rating && (
                        <div className="prod-rating">
                          <span className="prod-stars">★★★★★</span>
                          <span className="prod-rating-num">{p.rating} ({p.reviews || 0})</span>
                        </div>
                      )}
                      <div className="prod-footer">
                        <div>
                          <span className="prod-price">₹{p.price}</span>
                          {p.mrp && <span className="prod-mrp">₹{p.mrp}</span>}
                          {discount > 0 && <span className="prod-off">{discount}% off</span>}
                        </div>
                        <div className="prod-actions">
                          {p.inStock !== false && (
                            <button className="prod-add" onClick={() => addToCart(p)} title="Add to cart">+</button>
                          )}
                          <Link href={`/shop/${p.slug}`} className="prod-view">View →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-drawer-head">
          <div className="sidebar-drawer-title">Filters</div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <SidebarContent
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          sort={sort}
          setSort={setSort}
          setActiveFilters={setActiveFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

function SidebarContent({ activeFilters, toggleFilter, sort, setSort, setActiveFilters, priceRange, setPriceRange }) {
  const MIN = 0
  const MAX = 1000

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), priceRange[1] - 50)
    setPriceRange([val, priceRange[1]])
  }
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), priceRange[0] + 50)
    setPriceRange([priceRange[0], val])
  }
  const isPriceFiltered = priceRange[0] > MIN || priceRange[1] < MAX

  return (
    <>
      {/* Categories */}
      <div className="filter-card">
        <div className="filter-card-head">
          <div className="filter-card-title"><span>🗂️</span> Category</div>
          {activeFilters.length > 0 && (
            <button className="filter-clear" onClick={() => setActiveFilters([])}>Clear</button>
          )}
        </div>
        <div className="filter-card-body">
          {[
            ['🍿', 'Snacks'],
            ['🫙', 'Pickles'],
            ['🫒', 'Oil'],
            ['🌶️', 'Powder'],
          ].map(([ic, cat]) => (
            <div
              key={cat}
              className={`filter-opt ${activeFilters.includes(cat) ? 'active' : ''}`}
              onClick={() => toggleFilter(cat)}
            >
              <div className="filter-check">{activeFilters.includes(cat) ? '✓' : ''}</div>
              <span>{ic} {cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-card">
        <div className="filter-card-head">
          <div className="filter-card-title"><span>₹</span> Price Range</div>
          {isPriceFiltered && (
            <button className="filter-clear" onClick={() => setPriceRange([MIN, MAX])}>Reset</button>
          )}
        </div>
        <div className="filter-card-body" style={{ padding: '16px 16px 12px' }}>
          {/* Price display */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14
          }}>
            <span style={{
              background: 'var(--green-pl)', color: 'var(--green-m)',
              fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 8
            }}>₹{priceRange[0]}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>to</span>
            <span style={{
              background: 'var(--green-pl)', color: 'var(--green-m)',
              fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 8
            }}>₹{priceRange[1] >= MAX ? `${MAX}+` : priceRange[1]}</span>
          </div>

          {/* Dual range sliders */}
          <div style={{ position: 'relative', height: 28, marginBottom: 4 }}>
            {/* Track background */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: 0, right: 0, height: 4, background: 'var(--cream3)',
              borderRadius: 4, pointerEvents: 'none'
            }} />
            {/* Track fill */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: `${((priceRange[0] - MIN) / (MAX - MIN)) * 100}%`,
              right: `${((MAX - priceRange[1]) / (MAX - MIN)) * 100}%`,
              height: 4, background: 'var(--green-m)',
              borderRadius: 4, pointerEvents: 'none'
            }} />
            {/* Min slider */}
            <input
              type="range" min={MIN} max={MAX} step={50}
              value={priceRange[0]}
              onChange={handleMinChange}
              style={{
                position: 'absolute', width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', margin: 0,
                WebkitAppearance: 'none', pointerEvents: 'all'
              }}
            />
            {/* Max slider */}
            <input
              type="range" min={MIN} max={MAX} step={50}
              value={priceRange[1]}
              onChange={handleMaxChange}
              style={{
                position: 'absolute', width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', margin: 0,
                WebkitAppearance: 'none', pointerEvents: 'all'
              }}
            />
            {/* Visual thumb - min */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              left: `${((priceRange[0] - MIN) / (MAX - MIN)) * 100}%`,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', border: '2.5px solid var(--green-m)',
              boxShadow: '0 2px 6px rgba(45,90,39,0.2)',
              pointerEvents: 'none', zIndex: 1
            }} />
            {/* Visual thumb - max */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              left: `${((priceRange[1] - MIN) / (MAX - MIN)) * 100}%`,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', border: '2.5px solid var(--green-m)',
              boxShadow: '0 2px 6px rgba(45,90,39,0.2)',
              pointerEvents: 'none', zIndex: 1
            }} />
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {[
              ['Under ₹100', [0, 100]],
              ['₹100–₹300', [100, 300]],
              ['₹300+', [300, 1000]],
            ].map(([label, range]) => {
              const active = priceRange[0] === range[0] && priceRange[1] === range[1]
              return (
                <button
                  key={label}
                  onClick={() => setPriceRange(range)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11.5,
                    fontWeight: 700, cursor: 'pointer', border: 'none',
                    fontFamily: 'Nunito, sans-serif',
                    background: active ? 'var(--green-m)' : 'var(--cream2)',
                    color: active ? '#fff' : 'var(--muted)',
                    transition: 'all 0.15s'
                  }}
                >{label}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="filter-card">
        <div className="filter-card-head">
          <div className="filter-card-title"><span>🏷️</span> Tag</div>
        </div>
        <div className="filter-card-body">
          {['Organic', 'Traditional', 'Health', 'Bestseller'].map(tag => (
            <div
              key={tag}
              className={`filter-opt ${activeFilters.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleFilter(tag)}
            >
              <div className="filter-check">{activeFilters.includes(tag) ? '✓' : ''}</div>
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="filter-card">
        <div className="filter-card-head">
          <div className="filter-card-title"><span>↕️</span> Sort By</div>
        </div>
        <div className="filter-card-body">
          {[
            ['popular', '🔥 Most Popular'],
            ['price-low', '↑ Price: Low to High'],
            ['price-high', '↓ Price: High to Low'],
            ['rating', '⭐ Highest Rated'],
          ].map(([val, label]) => (
            <div
              key={val}
              className={`filter-opt ${sort === val ? 'active' : ''}`}
              onClick={() => setSort(val)}
            >
              <div className="filter-radio">
                <div className="filter-radio-dot" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function ShopFallback() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito,sans-serif', color: '#7A5C3A',
      fontSize: '16px', fontWeight: 600, background: '#FDFAF3'
    }}>
      🌿 Loading...
    </div>
  )
}

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopPage />
    </Suspense>
  )
}