'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState({ announcements: [], popups: [], banners: [], featuredProducts: [], siteImages: [] })
  const [showPopup, setShowPopup] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [toast, setToast] = useState(null)
  const [visibleSections, setVisibleSections] = useState({})
  const [heroSlide, setHeroSlide] = useState(0)

  const HERO_SLIDES = [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&auto=format&fit=crop&q=80',
  ]

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setProducts([]); setLoading(false) })

    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data)
        if (data.popups?.length > 0) {
          setActivePopup(data.popups[0])
          setTimeout(() => setShowPopup(true), 2500)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [HERO_SLIDES.length])

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [loading])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const addToCart = (p) => {
    const saved = localStorage.getItem('ushas-cart')
    const cart = saved ? JSON.parse(saved) : []
    const existing = cart.find(i => i.id === p.id)
    const updated = existing
      ? cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...p, qty: 1 }]
    localStorage.setItem('ushas-cart', JSON.stringify(updated))
    showToast(`🛒 ${p.name} added to cart!`)
  }

  const featuredList = content.featuredProducts?.length > 0 ? content.featuredProducts : products.slice(0, 4)

  const getSiteImage = (key, fallback) => {
    const img = content.siteImages?.find(i => i.key === key)
    return img?.imageUrl || fallback
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        :root {
          --cream:   #FDFAF3;
          --cream2:  #F4EDD8;
          --cream3:  #EDE0C4;
          --gold:    #C8790A;
          --gold-lt: #F0B429;
          --gold-pl: #FDE8A8;
          --green:   #2D5A27;
          --green-m: #3A6B35;
          --green-lt:#5A9E52;
          --green-pl:#D6EDD4;
          --red:     #C0392B;
          --brown:   #4A2810;
          --brown-lt:#6B3F1A;
          --text:    #1E120A;
          --muted:   #7A5C3A;
          --border:  rgba(92,51,23,0.12);
          --shadow:  rgba(30,18,10,0.08);
        }

        html { scroll-behavior: smooth; }
        body { font-family:'Nunito',sans-serif; background:var(--cream); color:var(--text); overflow-x:hidden; }

        /* ── SCROLL ANIMATIONS ── */
        .reveal { opacity:0; transform:translateY(32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-left { opacity:0; transform:translateX(-32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal-left.visible { opacity:1; transform:translateX(0); }
        .reveal-right { opacity:0; transform:translateX(32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal-right.visible { opacity:1; transform:translateX(0); }

        /* ── ANNOUNCEMENT BAR ── */
        .ann-bar {
          display:flex; align-items:center; justify-content:center; gap:10px;
          padding:10px 48px; font-size:13px; font-weight:700; color:#fff;
          text-align:center; position:relative; letter-spacing:0.02em;
        }
        .ann-bar::before {
          content:'✦'; margin-right:6px; opacity:0.6; font-size:10px;
        }
        .ann-bar::after {
          content:'✦'; margin-left:6px; opacity:0.6; font-size:10px;
        }
        .ann-close {
          position:absolute; right:16px; background:none; border:none;
          color:rgba(255,255,255,0.7); font-size:16px; cursor:pointer; line-height:1;
          transition:color 0.2s;
        }
        .ann-close:hover { color:#fff; }

        /* ── HERO ── */
        .hero {
          min-height:92vh;
          display:grid; grid-template-columns:1fr 1fr;
          align-items:center;
          padding:80px;
          position:relative; overflow:hidden;
          background: #0e2a0c;
        }

        /* ── HERO SLIDER ── */
        .hero-slides {
          position:absolute; inset:0; z-index:0;
        }
        .hero-slide {
          position:absolute; inset:0;
          background-size:cover; background-position:center;
          opacity:0;
          transition:opacity 1.2s ease;
          transform:scale(1.08);
          animation:none;
        }
        .hero-slide.active {
          opacity:1;
          animation:kenBurns 10s ease-in-out forwards;
        }
        @keyframes kenBurns {
          0%   { transform:scale(1.08) translateX(0); }
          100% { transform:scale(1) translateX(-8px); }
        }
        .hero-slide-overlay {
          position:absolute; inset:0; z-index:1;
          background:linear-gradient(
            105deg,
            rgba(10,30,8,0.88) 0%,
            rgba(10,30,8,0.72) 45%,
            rgba(10,30,8,0.35) 75%,
            rgba(10,30,8,0.15) 100%
          );
        }
        /* Slide dots */
        .hero-dots {
          position:absolute; bottom:28px; left:80px; z-index:10;
          display:flex; gap:8px; align-items:center;
        }
        .hero-dot {
          width:8px; height:8px; border-radius:50%;
          background:rgba(255,255,255,0.35);
          border:none; cursor:pointer; padding:0;
          transition:all 0.3s;
        }
        .hero-dot.active {
          width:28px; border-radius:4px;
          background:var(--gold-lt);
        }
        .hero-dot:hover { background:rgba(255,255,255,0.7); }

        /* Decorative background circles */
        .hero::before {
          content:'';
          position:absolute; top:-120px; right:-80px; z-index:2;
          width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle, rgba(200,121,10,0.14) 0%, transparent 70%);
          pointer-events:none;
        }
        .hero-bg-pattern {
          position:absolute; inset:0; opacity:0.03; z-index:2;
          background-image: repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 50%);
          background-size:28px 28px;
          pointer-events:none;
        }
        .hero-glow {
          position:absolute; bottom:-60px; left:30%; z-index:2;
          width:400px; height:300px;
          background:radial-gradient(ellipse, rgba(200,121,10,0.18) 0%, transparent 70%);
          pointer-events:none;
        }

        .hero-content { position:relative; z-index:5; }
        .hero-visual { position:relative; z-index:5; display:flex; align-items:center; justify-content:center; }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(240,180,41,0.15); border:1px solid rgba(240,180,41,0.3);
          color:var(--gold-lt); font-size:11px; font-weight:800;
          letter-spacing:0.22em; text-transform:uppercase;
          padding:6px 16px; border-radius:40px; margin-bottom:24px;
        }
        .hero-eyebrow span { width:6px; height:6px; border-radius:50%; background:var(--gold-lt); display:inline-block; }

        .hero h1 {
          font-family:'Tiro Malayalam', serif;
          font-size:68px; line-height:1.08; color:#fff;
          margin-bottom:24px;
          text-shadow:0 2px 20px rgba(0,0,0,0.25);
        }
        .hero h1 .accent { color:var(--gold-lt); position:relative; display:inline-block; }
        .hero h1 .accent::after {
          content:'';
          position:absolute; bottom:-4px; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--gold-lt), transparent);
          border-radius:2px;
        }
        .hero-sub {
          font-size:17px; color:rgba(255,255,255,0.78);
          line-height:1.8; max-width:440px; margin-bottom:40px;
          font-weight:400;
        }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }

        .btn-gold {
          display:inline-flex; align-items:center; gap:8px;
          padding:15px 32px;
          background:linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 100%);
          color:#1E120A; border:none; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; text-decoration:none;
          box-shadow:0 4px 20px rgba(200,121,10,0.45);
          transition:transform 0.2s, box-shadow 0.2s;
          letter-spacing:0.02em;
        }
        .btn-gold:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(200,121,10,0.55); }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 28px;
          background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.88);
          border:1.5px solid rgba(255,255,255,0.22); border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:600;
          cursor:pointer; text-decoration:none;
          transition:background 0.2s, border-color 0.2s;
          backdrop-filter:blur(4px);
        }
        .btn-ghost:hover { background:rgba(255,255,255,0.14); border-color:rgba(255,255,255,0.4); }

        /* Hero stats */
        .hero-stats {
          display:flex; gap:32px; margin-top:48px;
          padding-top:32px;
          border-top:1px solid rgba(255,255,255,0.1);
        }
        .hero-stat-num {
          font-family:'Tiro Malayalam',serif;
          font-size:30px; color:var(--gold-lt); font-weight:700; line-height:1;
        }
        .hero-stat-label { font-size:12px; color:rgba(255,255,255,0.5); font-weight:600; margin-top:4px; letter-spacing:0.04em; }

        /* Hero image side */
        .hero-img-frame {
          position:relative; width:100%; max-width:480px;
        }
        .hero-img-main {
          width:100%; aspect-ratio:4/5; object-fit:cover;
          border-radius:24px 24px 80px 24px;
          box-shadow:0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
        }
        /* Floating badge on hero image */
        .hero-float-badge {
          position:absolute; bottom:28px; left:-24px;
          background:rgba(255,255,255,0.96); backdrop-filter:blur(12px);
          border-radius:14px; padding:14px 18px;
          box-shadow:0 8px 32px rgba(0,0,0,0.18);
          display:flex; align-items:center; gap:12px;
          animation:floatBadge 3s ease-in-out infinite;
        }
        .hero-float-icon { font-size:28px; }
        .hero-float-title { font-size:13px; font-weight:800; color:var(--text); }
        .hero-float-sub { font-size:11px; color:var(--muted); }
        @keyframes floatBadge {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-6px); }
        }
        .hero-float-badge2 {
          position:absolute; top:24px; right:-20px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          border-radius:12px; padding:12px 16px;
          box-shadow:0 8px 24px rgba(0,0,0,0.2);
          color:#fff; text-align:center;
          animation:floatBadge 3s ease-in-out infinite 1.5s;
        }
        .hero-float-badge2 .num { font-size:22px; font-weight:900; font-family:'Tiro Malayalam',serif; }
        .hero-float-badge2 .lbl { font-size:10px; opacity:0.8; letter-spacing:0.06em; }

        /* ── TRUST BAR ── */
        .trust {
          background:var(--brown);
          display:grid; grid-template-columns:repeat(4,1fr);
          border-bottom:3px solid var(--gold);
        }
        .trust-item {
          display:flex; align-items:center; gap:12px;
          padding:20px 28px; color:rgba(255,255,255,0.88);
          font-size:13px; font-weight:600;
          border-right:1px solid rgba(255,255,255,0.07);
          transition:background 0.2s;
        }
        .trust-item:last-child { border-right:none; }
        .trust-item:hover { background:rgba(255,255,255,0.04); }
        .trust-icon {
          width:40px; height:40px; border-radius:10px;
          background:rgba(240,180,41,0.15);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0;
        }
        .trust-text strong { display:block; font-size:13.5px; color:#fff; }
        .trust-text span { font-size:11.5px; color:rgba(255,255,255,0.5); }

        /* ── SALE BANNERS ── */
        .banners-wrap { padding:48px 80px 0; display:flex; flex-direction:column; gap:20px; }
        .sale-banner {
          border-radius:20px; overflow:hidden;
          position:relative; min-height:180px;
          display:flex; align-items:center;
          box-shadow:0 8px 32px var(--shadow);
        }
        .sale-banner-bg { position:absolute; inset:0; object-fit:cover; width:100%; height:100%; }
        .sale-banner-overlay {
          position:absolute; inset:0;
          background:linear-gradient(100deg, rgba(30,58,27,0.95) 0%, rgba(30,58,27,0.7) 55%, rgba(30,58,27,0.1) 100%);
        }
        .sale-banner-content { position:relative; z-index:1; padding:40px 52px; }
        .sale-banner-tag {
          display:inline-block; background:var(--gold-lt); color:#1E120A;
          font-size:10px; font-weight:800; letter-spacing:0.16em;
          text-transform:uppercase; padding:4px 12px; border-radius:20px; margin-bottom:10px;
        }
        .sale-banner-content h3 {
          font-family:'Tiro Malayalam',serif; font-size:34px; color:#fff;
          margin-bottom:8px; line-height:1.2;
        }
        .sale-banner-content p { font-size:15px; color:rgba(255,255,255,0.8); margin-bottom:20px; }
        .sale-banner-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:11px 26px; background:var(--gold-lt); color:#1E120A;
          border:none; border-radius:8px; font-family:'Nunito',sans-serif;
          font-size:13.5px; font-weight:800; cursor:pointer; text-decoration:none;
          transition:transform 0.2s, background 0.2s;
        }
        .sale-banner-btn:hover { background:#fff; transform:translateY(-1px); }

        /* ── SECTION SHARED ── */
        .section { padding:88px 80px; }
        .section-alt { background:var(--cream2); }
        .section-dark { background:var(--brown); }

        .sec-head { text-align:center; margin-bottom:56px; }
        .sec-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--green-pl); color:var(--green);
          font-size:11px; font-weight:800; letter-spacing:0.18em;
          text-transform:uppercase; padding:5px 16px; border-radius:40px; margin-bottom:14px;
        }
        .sec-kicker::before, .sec-kicker::after { content:'—'; opacity:0.4; font-size:10px; }
        .sec-title {
          font-family:'Tiro Malayalam',serif; font-size:44px; color:var(--text);
          line-height:1.15; margin-bottom:14px;
        }
        .sec-title .gold { color:var(--gold); }
        .sec-sub { font-size:15.5px; color:var(--muted); max-width:520px; margin:0 auto; line-height:1.8; }

        /* ── CATEGORIES ── */
        .cat-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:20px;
        }
        .cat-card {
          display:flex; flex-direction:column; align-items:center; gap:12px;
          padding:28px 16px; background:#fff;
          border:2px solid var(--border); border-radius:20px;
          text-decoration:none; color:var(--text);
          transition:all 0.25s; position:relative; overflow:hidden;
        }
        .cat-card::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, var(--green-pl), transparent);
          opacity:0; transition:opacity 0.25s;
        }
        .cat-card:hover { border-color:var(--green-m); transform:translateY(-4px); box-shadow:0 12px 32px rgba(45,90,39,0.14); }
        .cat-card:hover::before { opacity:1; }
        .cat-icon-wrap {
          width:64px; height:64px; border-radius:18px;
          background:var(--cream2);
          display:flex; align-items:center; justify-content:center;
          font-size:30px; position:relative; z-index:1;
          transition:transform 0.25s;
        }
        .cat-card:hover .cat-icon-wrap { transform:scale(1.1) rotate(-4deg); }
        .cat-label { font-size:13px; font-weight:800; position:relative; z-index:1; letter-spacing:0.02em; }
        .cat-count { font-size:11px; color:var(--muted); position:relative; z-index:1; }

        /* ── PRODUCT CARDS ── */
        .prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }

        .prod-card {
          background:#fff; border-radius:20px; overflow:hidden;
          border:1px solid var(--border);
          transition:box-shadow 0.3s, transform 0.3s;
          display:flex; flex-direction:column;
        }
        .prod-card:hover {
          box-shadow:0 16px 48px rgba(30,18,10,0.12);
          transform:translateY(-6px);
        }

        .prod-img-wrap { position:relative; overflow:hidden; height:200px; flex-shrink:0; }
        .prod-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
        .prod-card:hover .prod-img { transform:scale(1.08); }

        .prod-badge {
          position:absolute; top:12px; left:12px;
          font-size:10px; font-weight:800; padding:4px 12px;
          border-radius:20px; letter-spacing:0.06em; text-transform:uppercase;
        }
        .prod-badge.sale { background:var(--red); color:#fff; }
        .prod-badge.new { background:var(--green-m); color:#fff; }
        .prod-badge.organic { background:var(--gold); color:#fff; }
        .prod-badge.bestseller { background:var(--brown); color:#fff; }

        .prod-wishlist {
          position:absolute; top:12px; right:12px;
          width:32px; height:32px; border-radius:50%;
          background:rgba(255,255,255,0.9); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; backdrop-filter:blur(4px);
          transition:transform 0.2s, background 0.2s;
          opacity:0;
        }
        .prod-card:hover .prod-wishlist { opacity:1; }
        .prod-wishlist:hover { transform:scale(1.15); background:#fff; }

        .prod-body { padding:18px; flex:1; display:flex; flex-direction:column; }
        .prod-cat {
          font-size:10.5px; color:var(--green-m); font-weight:800;
          letter-spacing:0.12em; text-transform:uppercase; margin-bottom:5px;
        }
        .prod-name { font-size:15px; font-weight:800; margin-bottom:6px; line-height:1.35; color:var(--text); }
        .prod-desc { font-size:12.5px; color:var(--muted); line-height:1.6; margin-bottom:auto; padding-bottom:14px; }

        .prod-footer { display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid var(--border); }
        .prod-price-wrap {}
        .prod-price { font-size:20px; font-weight:900; color:var(--gold); font-family:'Tiro Malayalam',serif; }
        .prod-mrp { font-size:12px; color:var(--muted); text-decoration:line-through; margin-left:4px; }
        .prod-discount { font-size:10px; font-weight:800; color:var(--red); margin-left:4px; }

        .prod-add {
          width:38px; height:38px; border-radius:10px;
          background:var(--green-m); color:#fff; border:none;
          cursor:pointer; font-size:18px;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s, transform 0.15s;
          flex-shrink:0;
        }
        .prod-add:hover { background:var(--green); transform:scale(1.08); }

        /* Skeleton loader */
        .skel { background:linear-gradient(90deg, var(--cream2) 25%, var(--cream3) 50%, var(--cream2) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        .skel-card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid var(--border); }
        .skel-img { height:200px; }
        .skel-body { padding:18px; display:flex; flex-direction:column; gap:10px; }
        .skel-line { height:12px; }
        .skel-line.short { width:60%; }
        .skel-line.med { width:80%; }

        /* ── WHY US ── */
        .why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .why-card {
          background:#fff; border-radius:20px; padding:36px 28px;
          border:1px solid var(--border); text-align:center;
          transition:box-shadow 0.25s, transform 0.25s;
          position:relative; overflow:hidden;
        }
        .why-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--green), var(--gold));
          transform:scaleX(0); transition:transform 0.3s;
          transform-origin:left;
        }
        .why-card:hover { box-shadow:0 8px 32px var(--shadow); transform:translateY(-4px); }
        .why-card:hover::after { transform:scaleX(1); }
        .why-icon {
          width:72px; height:72px; border-radius:20px;
          background:linear-gradient(135deg, var(--green-pl), var(--gold-pl));
          margin:0 auto 20px;
          display:flex; align-items:center; justify-content:center; font-size:32px;
        }
        .why-card h3 { font-size:16px; font-weight:800; margin-bottom:10px; color:var(--text); }
        .why-card p { font-size:13.5px; color:var(--muted); line-height:1.7; }

        /* ── TESTIMONIALS ── */
        .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .testi-card {
          background:#fff; border-radius:20px; padding:32px;
          border:1px solid var(--border);
          transition:box-shadow 0.25s, transform 0.25s;
          position:relative;
        }
        .testi-card:hover { box-shadow:0 8px 32px var(--shadow); transform:translateY(-3px); }
        .testi-quote {
          font-size:56px; line-height:0.6; color:var(--green-pl);
          font-family:'Tiro Malayalam',serif; margin-bottom:12px;
        }
        .testi-stars { color:var(--gold-lt); font-size:15px; letter-spacing:2px; margin-bottom:14px; }
        .testi-text { font-size:14px; color:var(--text); line-height:1.75; margin-bottom:20px; font-style:italic; }
        .testi-divider { height:1px; background:var(--border); margin-bottom:16px; }
        .testi-author { display:flex; align-items:center; gap:12px; }
        .testi-avatar {
          width:44px; height:44px; border-radius:50%;
          background:linear-gradient(135deg, var(--green), var(--green-lt));
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:800; color:#fff; flex-shrink:0;
        }
        .testi-name { font-size:14px; font-weight:800; color:var(--text); }
        .testi-loc { font-size:11.5px; color:var(--muted); margin-top:2px; }
        .testi-verified { font-size:10px; color:var(--green-m); font-weight:700; margin-top:2px; }

        /* ── NEWSLETTER ── */
        .newsletter-wrap { padding:0 80px 88px; }
        .newsletter {
          background:linear-gradient(135deg, var(--green) 0%, var(--green-m) 50%, #1a3a16 100%);
          border-radius:24px; padding:72px;
          text-align:center; position:relative; overflow:hidden;
          box-shadow:0 24px 64px rgba(45,90,39,0.3);
        }
        .newsletter::before {
          content:'ഉഷ';
          position:absolute; right:-20px; top:-20px;
          font-family:'Tiro Malayalam',serif; font-size:200px;
          color:rgba(255,255,255,0.04); line-height:1; pointer-events:none;
          user-select:none;
        }
        .newsletter h2 {
          font-family:'Tiro Malayalam',serif; font-size:40px; color:#fff;
          margin-bottom:12px; position:relative;
        }
        .newsletter p { font-size:16px; color:rgba(255,255,255,0.75); margin-bottom:32px; position:relative; }
        .nl-form {
          display:flex; gap:12px; max-width:460px; margin:0 auto; position:relative;
        }
        .nl-input {
          flex:1; padding:15px 20px; border-radius:10px;
          border:none; font-family:'Nunito',sans-serif; font-size:14px;
          outline:none; background:#fff;
          box-shadow:0 4px 16px rgba(0,0,0,0.12);
        }
        .nl-btn {
          padding:15px 28px; background:linear-gradient(135deg, var(--gold-lt), var(--gold));
          color:#1E120A; border:none; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; white-space:nowrap;
          box-shadow:0 4px 16px rgba(200,121,10,0.4);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .nl-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(200,121,10,0.5); }
        .nl-disclaimer { font-size:12px; color:rgba(255,255,255,0.4); margin-top:14px; position:relative; }

        /* ── FOOTER ── */
        .footer { background:var(--brown); padding:72px 80px 36px; }
        .footer-top { display:grid; grid-template-columns:2.2fr 1fr 1fr 1fr; gap:56px; margin-bottom:56px; }

        .footer-brand {}
        .footer-logo {
          font-family:'Tiro Malayalam',serif; font-size:30px;
          color:var(--gold-lt); margin-bottom:4px;
        }
        .footer-logo-sub { font-size:10px; color:rgba(255,255,255,0.35); letter-spacing:0.22em; text-transform:uppercase; margin-bottom:16px; }
        .footer-brand p { font-size:13.5px; color:rgba(255,255,255,0.55); line-height:1.8; max-width:240px; }

        /* Contact info in footer */
        .footer-contact { margin-top:20px; display:flex; flex-direction:column; gap:8px; }
        .footer-contact-item { display:flex; align-items:center; gap:8px; font-size:12.5px; color:rgba(255,255,255,0.45); }

        .footer-col h4 {
          font-size:11px; font-weight:800; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
          margin-bottom:20px; padding-bottom:10px;
          border-bottom:1px solid rgba(255,255,255,0.06);
        }
        .footer-col ul { list-style:none; display:flex; flex-direction:column; gap:10px; }
        .footer-col ul li a {
          font-size:13.5px; color:rgba(255,255,255,0.5);
          text-decoration:none; transition:color 0.2s;
          display:flex; align-items:center; gap:6px;
        }
        .footer-col ul li a:hover { color:var(--gold-lt); }
        .footer-col ul li a::before { content:'→'; font-size:10px; opacity:0; transition:opacity 0.2s, transform 0.2s; transform:translateX(-4px); }
        .footer-col ul li a:hover::before { opacity:1; transform:translateX(0); }

        .footer-bottom {
          border-top:1px solid rgba(255,255,255,0.07);
          padding-top:28px; display:flex;
          justify-content:space-between; align-items:center; gap:16px;
        }
        .footer-bottom p { font-size:12.5px; color:rgba(255,255,255,0.3); }
        .footer-socials { display:flex; gap:10px; }
        .footer-social {
          width:38px; height:38px; border-radius:10px;
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,0.5); font-size:16px; cursor:pointer;
          transition:all 0.2s; text-decoration:none;
        }
        .footer-social:hover { background:var(--gold); color:#fff; border-color:var(--gold); transform:translateY(-2px); }

        /* ── POPUP ── */
        .popup-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.6);
          z-index:9999; display:flex; align-items:center; justify-content:center;
          animation:fadeIn 0.3s ease; padding:20px;
          backdrop-filter:blur(4px);
        }
        .popup-box {
          background:#fff; border-radius:24px; padding:48px 40px;
          max-width:420px; width:100%; position:relative; text-align:center;
          animation:popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          box-shadow:0 32px 80px rgba(0,0,0,0.25);
        }
        .popup-top-bar { height:4px; background:linear-gradient(90deg,var(--green),var(--gold-lt)); border-radius:24px 24px 0 0; position:absolute; top:0; left:0; right:0; }
        .popup-icon { font-size:52px; margin-bottom:16px; }
        .popup-title { font-family:'Tiro Malayalam',serif; font-size:28px; margin-bottom:10px; color:var(--text); }
        .popup-msg { font-size:15px; color:var(--muted); line-height:1.75; margin-bottom:28px; }
        .popup-close { position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:var(--cream2); border:none; font-size:16px; cursor:pointer; color:var(--muted); display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
        .popup-close:hover { background:var(--cream3); color:var(--text); }
        .popup-shop-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 36px; background:var(--green-m); color:#fff;
          border:none; border-radius:10px; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:800; cursor:pointer;
          transition:background 0.2s, transform 0.15s;
          box-shadow:0 4px 16px rgba(45,90,39,0.3);
        }
        .popup-shop-btn:hover { background:var(--green); transform:translateY(-1px); }

        /* ── TOAST ── */
        .toast {
          position:fixed; bottom:32px; right:32px; z-index:10000;
          background:var(--green-m); color:#fff;
          padding:14px 22px; border-radius:12px;
          font-size:14px; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,0.2);
          animation:slideUp 0.3s ease;
          display:flex; align-items:center; gap:10px;
          max-width:320px;
          border-left:4px solid var(--gold-lt);
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }

        /* ── VIEW ALL BTN ── */
        .view-all-wrap { text-align:center; margin-top:48px; }
        .btn-outline-green {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 36px; background:transparent; color:var(--green-m);
          border:2px solid var(--green-m); border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; text-decoration:none;
          transition:background 0.2s, color 0.2s, transform 0.15s;
          letter-spacing:0.02em;
        }
        .btn-outline-green:hover { background:var(--green-m); color:#fff; transform:translateY(-2px); }

        /* ── STAGGER DELAYS ── */
        .d1 { transition-delay:0.1s !important; }
        .d2 { transition-delay:0.2s !important; }
        .d3 { transition-delay:0.3s !important; }
        .d4 { transition-delay:0.4s !important; }
        .d5 { transition-delay:0.5s !important; }

        /* ── RESPONSIVE ── */
        @media (max-width:1200px) {
          .hero { padding:60px 48px; }
          .hero h1 { font-size:56px; }
          .section { padding:72px 48px; }
          .banners-wrap { padding:40px 48px 0; }
          .newsletter-wrap { padding:0 48px 72px; }
          .footer { padding:60px 48px 28px; }
        }

        @media (max-width:1024px) {
          .hero { grid-template-columns:1fr; min-height:auto; padding:80px 40px 60px; }
          .hero-visual { display:none; }
          .hero h1 { font-size:48px; }
          .trust { grid-template-columns:repeat(2,1fr); }
          .prod-grid { grid-template-columns:repeat(2,1fr); }
          .why-grid { grid-template-columns:repeat(2,1fr); }
          .testi-grid { grid-template-columns:repeat(2,1fr); }
          .cat-grid { grid-template-columns:repeat(5,1fr); }
          .footer-top { grid-template-columns:1fr 1fr; gap:36px; }
        }

        @media (max-width:768px) {
          .hero { padding:60px 24px 48px; min-height:80vh; }
          .hero h1 { font-size:38px; }
          .hero-sub { font-size:15px; }
          .hero-stats { gap:20px; }
          .hero-stat-num { font-size:24px; }
          .trust { grid-template-columns:repeat(2,1fr); }
          .trust-item { padding:16px 20px; }
          .section { padding:56px 24px; }
          .sec-title { font-size:34px; }
          .cat-grid { grid-template-columns:repeat(3,1fr); gap:12px; }
          .prod-grid { grid-template-columns:repeat(2,1fr); gap:14px; }
          .why-grid { grid-template-columns:repeat(2,1fr); gap:16px; }
          .testi-grid { grid-template-columns:1fr; }
          .banners-wrap { padding:32px 24px 0; }
          .newsletter-wrap { padding:0 24px 56px; }
          .newsletter { padding:48px 28px; }
          .nl-form { flex-direction:column; }
          .footer { padding:48px 24px 24px; }
          .footer-top { grid-template-columns:1fr; gap:32px; }
          .footer-bottom { flex-direction:column; text-align:center; }
          .sale-banner-content { padding:28px 32px; }
          .sale-banner-content h3 { font-size:26px; }
        }

        @media (max-width:480px) {
          .hero { padding:48px 16px 40px; }
          .hero h1 { font-size:30px; }
          .hero-btns { flex-direction:column; }
          .btn-gold, .btn-ghost { width:100%; justify-content:center; }
          .trust { grid-template-columns:1fr 1fr; }
          .trust-item { padding:12px 14px; gap:8px; }
          .trust-icon { width:32px; height:32px; font-size:14px; }
          .section { padding:44px 16px; }
          .sec-title { font-size:28px; }
          .cat-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
          .cat-card { padding:18px 10px; }
          .cat-icon-wrap { width:48px; height:48px; font-size:22px; }
          .prod-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .prod-img-wrap { height:150px; }
          .prod-desc { display:none; }
          .why-grid { grid-template-columns:1fr; }
          .newsletter { padding:40px 20px; }
          .newsletter h2 { font-size:28px; }
          .footer { padding:40px 16px 20px; }
        }
      `}</style>

      {/* ANNOUNCEMENT BARS */}
      {content.announcements?.map(a => (
        <AnnouncementBar key={a.id} announcement={a} />
      ))}

      {/* ── HERO ── */}
      <section className="hero">
        {/* Sliding background images */}
        <div className="hero-slides">
          {HERO_SLIDES.map((src, i) => (
            <div
              key={i}
              className={`hero-slide${heroSlide === i ? ' active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
          <div className="hero-slide-overlay" />
        </div>

        <div className="hero-bg-pattern" />
        <div className="hero-glow" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span />
            God's Own Store
          </div>
          <h1>
            Taste the <span className="accent">Authentic</span><br />
            Soul of Kerala
          </h1>
          <p className="hero-sub">
            Traditional snacks, cold-pressed oils and timeless recipes —
            handcrafted with generations of love, delivered to your doorstep.
          </p>
          <div className="hero-btns">
            <Link href="/shop" className="btn-gold">
              Shop Now →
            </Link>
            <Link href="/about" className="btn-ghost">
              Our Story
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">50K+</div>
              <div className="hero-stat-label">Happy Customers</div>
            </div>
            <div>
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-label">Natural Ingredients</div>
            </div>
            <div>
              <div className="hero-stat-num">4.9★</div>
              <div className="hero-stat-label">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-frame">
            <img
              src={getSiteImage('hero', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop')}
              alt="Kerala Snacks"
              className="hero-img-main"
            />
            <div className="hero-float-badge">
              <div className="hero-float-icon">🥥</div>
              <div>
                <div className="hero-float-title">Cold-Pressed Coconut Oil</div>
                <div className="hero-float-sub">100% Pure · Kerala Sourced</div>
              </div>
            </div>
            <div className="hero-float-badge2">
              <div className="num">8+</div>
              <div className="lbl">Products</div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${heroSlide === i ? ' active' : ''}`}
              onClick={() => setHeroSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust">
        {[
          ['🌿', '100% Natural', 'No preservatives'],
          ['🥥', 'Made in Kerala', 'Authentic origin'],
          ['🚚', 'Free Delivery', 'Orders above ₹500'],
          ['⭐', '4.9 Rating', '50,000+ reviews'],
        ].map(([ic, strong, span]) => (
          <div className="trust-item" key={strong}>
            <div className="trust-icon">{ic}</div>
            <div className="trust-text">
              <strong>{strong}</strong>
              <span>{span}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── SALE BANNERS ── */}
      {content.banners?.length > 0 && (
        <div className="banners-wrap">
          {content.banners.map(banner => (
            <div key={banner.id} className="sale-banner">
              {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} className="sale-banner-bg" />}
              <div className="sale-banner-overlay" />
              <div className="sale-banner-content">
                <div className="sale-banner-tag">Limited Offer</div>
                <h3>{banner.title}</h3>
                {banner.subtitle && <p>{banner.subtitle}</p>}
                <Link href="/shop" className="sale-banner-btn">Shop Now →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="sec-head reveal" id="cat-head" data-animate>
          <div className="sec-kicker">Browse</div>
          <h2 className="sec-title">What are you <span className="gold">looking for?</span></h2>
          <p className="sec-sub">From crunchy traditional snacks to nourishing health foods — find your favourites.</p>
        </div>
        <div className="cat-grid">
          {[
            ['🍿', 'Snacks', 'Crispy & Tasty'],
            ['🫙', 'Pickles', 'Tangy & Spicy'],
            ['🫒', 'Oil', 'Pure & Natural'],
            ['🌶️', 'Powder', 'Fresh Ground'],
          ].map(([ic, lb, desc], i) => (
            <Link
              key={lb}
              href={`/shop?category=${lb}`}
              className={`cat-card reveal d${i + 1}`}
              id={`cat-${lb}`}
              data-animate
            >
              <div className="cat-icon-wrap">{ic}</div>
              <div className="cat-label">{lb}</div>
              <div className="cat-count">{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section section-alt">
        <div className="sec-head reveal" id="prod-head" data-animate>
          <div className="sec-kicker">Featured</div>
          <h2 className="sec-title">Customer <span className="gold">Favourites</span></h2>
          <p className="sec-sub">Handpicked bestsellers loved by thousands of families across Kerala and beyond.</p>
        </div>

        {loading ? (
          <div className="prod-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skel-card">
                <div className="skel skel-img" />
                <div className="skel-body">
                  <div className="skel skel-line short" />
                  <div className="skel skel-line med" />
                  <div className="skel skel-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prod-grid">
            {featuredList.map((p, i) => {
              const discount = p.mrp && p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
              return (
                <div key={p.id} className={`prod-card reveal d${i + 1}`} id={`prod-${p.id}`} data-animate>
                  <div className="prod-img-wrap">
                    <img src={p.imageUrl || null} alt={p.name} className="prod-img" />
                    {p.badge && (
                      <span className={`prod-badge ${p.badge.toLowerCase()}`}>{p.badge}</span>
                    )}
                    <button className="prod-wishlist" onClick={() => showToast(`❤️ Added to wishlist!`)}>🤍</button>
                  </div>
                  <div className="prod-body">
                    <div className="prod-cat">{p.category}</div>
                    <div className="prod-name">{p.name}</div>
                    <div className="prod-desc">{p.description?.slice(0, 72)}…</div>
                    <div className="prod-footer">
                      <div className="prod-price-wrap">
                        <span className="prod-price">₹{p.price}</span>
                        {p.mrp && <span className="prod-mrp">₹{p.mrp}</span>}
                        {discount > 0 && <span className="prod-discount">{discount}% off</span>}
                      </div>
                      <Link href={`/shop/${p.slug}`}>
                        <button className="prod-add" title="View product">→</button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="view-all-wrap reveal" id="view-all" data-animate>
          <Link href="/shop" className="btn-outline-green">View All Products →</Link>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section">
        <div className="sec-head reveal" id="why-head" data-animate>
          <div className="sec-kicker">Why Choose Us</div>
          <h2 className="sec-title">The <span className="gold">Ushas</span> Promise</h2>
        </div>
        <div className="why-grid">
          {[
            ['🌿', '100% Natural', 'No artificial colours, flavours or preservatives. Just pure, honest ingredients sourced directly from farmers.'],
            ['🥥', 'Coconut Oil Fried', 'All snacks are fried in fresh cold-pressed coconut oil for that authentic, unmistakable Kerala taste.'],
            ['📦', 'Safe Packaging', 'Vacuum-sealed freshness pouches that lock in flavour and ensure longer shelf life and hygiene.'],
            ['🚚', 'Pan-India Delivery', 'Fast and reliable delivery to your doorstep anywhere in India. Free shipping above ₹500.'],
          ].map(([ic, h, d], i) => (
            <div key={h} className={`why-card reveal d${i + 1}`} id={`why-${i}`} data-animate>
              <div className="why-icon">{ic}</div>
              <h3>{h}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section section-alt">
        <div className="sec-head reveal" id="testi-head" data-animate>
          <div className="sec-kicker">Reviews</div>
          <h2 className="sec-title">What Our Customers <span className="gold">Say</span></h2>
        </div>
        <div className="testi-grid">
          {[
            { q: "Banana chips taste exactly like the ones from my grandmother's house in Thrissur. The coconut oil aroma is so nostalgic. Absolutely love them!", name: 'Anitha R.', loc: 'Bangalore', init: 'A' },
            { q: "The coconut oil is incredibly pure. You can smell the freshness as soon as you open the bottle. I won't buy from anywhere else now.", name: 'Suresh M.', loc: 'Chennai', init: 'S' },
            { q: "Ordered the gift pack for Diwali — everyone in my office was so impressed with the quality and beautiful packaging. Will definitely reorder!", name: 'Priya N.', loc: 'Mumbai', init: 'P' },
          ].map((t, i) => (
            <div key={i} className={`testi-card reveal d${i + 1}`} id={`testi-${i}`} data-animate>
              <div className="testi-quote">"</div>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">{t.q}</div>
              <div className="testi-divider" />
              <div className="testi-author">
                <div className="testi-avatar">{t.init}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-loc">📍 {t.loc}</div>
                  <div className="testi-verified">✓ Verified Buyer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <div className="newsletter-wrap">
        <div className="newsletter reveal" id="newsletter" data-animate>
          <h2>Stay in the Loop 🌿</h2>
          <p>Get exclusive offers, new arrivals and Kerala food stories in your inbox. No spam, ever.</p>
          <div className="nl-form">
            <input className="nl-input" placeholder="Your email address" type="email" />
            <button className="nl-btn">Subscribe</button>
          </div>
          <div className="nl-disclaimer">🔒 We respect your privacy. Unsubscribe anytime.</div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Ushas products</div>
            <div className="footer-logo-sub">Kerala</div>
            <p>Bringing the authentic taste of Kerala's traditional snacks and health foods to every home across India since 2018.</p>
            <div className="footer-contact">
              <div className="footer-contact-item">📧 hello@ushasproducts.com</div>
              <div className="footer-contact-item">📞 +91 98765 43210</div>
              <div className="footer-contact-item">📍 Thrissur, Kerala, India</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={label}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {['Snacks', 'Health Foods', 'Oils & Ghee', 'Traditional', 'Organic'].map(c => (
                <li key={c}><Link href={`/shop?category=${c}`}>{c}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              {[['/profile', 'My Orders'], ['#', 'Return Policy'], ['#', 'Shipping Info'], ['#', 'FAQ'], ['#', 'Privacy Policy']].map(([href, label]) => (
                <li key={label}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Ushas Products. All rights reserved. Made with ❤️ in Kerala.</p>
          <div className="footer-socials">
            <a href="#" className="footer-social">📘</a>
            <a href="#" className="footer-social">📸</a>
            <a href="#" className="footer-social">▶️</a>
            <a href="#" className="footer-social">🐦</a>
          </div>
        </div>
      </footer>

      {/* ── POPUP ── */}
      {showPopup && activePopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            <div className="popup-top-bar" />
            <button className="popup-close" onClick={() => setShowPopup(false)}>✕</button>
            <div className="popup-icon">🎉</div>
            <div className="popup-title">{activePopup.title}</div>
            <div className="popup-msg">{activePopup.message}</div>
            <button className="popup-shop-btn" onClick={() => setShowPopup(false)}>
              Shop Now →
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="toast">{toast}</div>}

      {/* Scroll animation handler */}
      <ScrollAnimator key={String(loading)} />
    </>
  )
}

// Announcement bar component
function AnnouncementBar({ announcement }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="ann-bar" style={{ background: announcement.color || '#2D5A27' }}>
      <span>{announcement.message}</span>
      <button className="ann-close" onClick={() => setVisible(false)}>✕</button>
    </div>
  )
}

// Scroll animation trigger component
function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
