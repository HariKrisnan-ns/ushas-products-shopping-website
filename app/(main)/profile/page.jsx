'use client'
import { CATEGORIES } from '@/lib/categories'
import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function ProfilePage() {
  const { isSignedIn, user } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [orders, activeTab]) // re-run when orders load or tab changes

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // API might return an error object instead of array
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          console.error('Orders API error:', data)
          setApiError(data?.error || 'Unknown error from API')
          setOrders([])
        }
        setLoading(false)
      })
      .catch(err => { console.error('Orders fetch failed:', err); setApiError(err.message); setLoading(false) })
  }, [isSignedIn])

  const statusStyle = (status) => {
    if (status === 'delivered') return { background: 'var(--green-pl)', color: 'var(--green-m)' }
    if (status === 'processing') return { background: 'var(--gold-pl)', color: 'var(--gold)' }
    if (status === 'shipped') return { background: '#DBEAFE', color: '#1D4ED8' }
    if (status === 'cancelled') return { background: '#FADBD8', color: 'var(--red)' }
    return { background: 'var(--cream3)', color: 'var(--brown-lt)' }
  }

  if (!isSignedIn) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito,sans-serif', background: 'var(--cream)',
          padding: '80px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--green-pl)', color: 'var(--green-m)',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em',
            textTransform: 'uppercase', padding: '5px 16px', borderRadius: '40px',
            marginBottom: '14px'
          }}>Members Only</div>
          <h2 style={{
            fontFamily: 'Tiro Malayalam,serif', fontSize: '36px',
            color: 'var(--text)', marginBottom: '12px'
          }}>Please Sign In</h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '28px', maxWidth: '360px', lineHeight: 1.75 }}>
            Sign in to view your orders, manage your profile, and access your wishlist.
          </p>
          <Link href="/sign-in" style={{
            padding: '14px 32px', background: 'linear-gradient(135deg, var(--green-m), var(--green))',
            color: '#fff', borderRadius: '12px', textDecoration: 'none',
            fontWeight: 900, fontSize: '15px',
            boxShadow: '0 4px 20px rgba(45,90,39,0.3)'
          }}>Sign In →</Link>
        </div>
      </>
    )
  }

  const avatarInitial = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')

  return (
    <>
      <style>{sharedStyles}</style>

      {/* ── HERO ── */}
      <div className="pf-hero">
        <div className="pf-hero-inner">
          <div className="ct-bc">
            <Link href="/">Home</Link><span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>My Account</span>
          </div>
          <div className="pf-hero-avatar">{avatarInitial}</div>
          <div className="ct-hero-kicker">Member Account</div>
          <h1 className="pf-hero-name">Hello, <em>{user?.firstName || 'there'}</em> 👋</h1>
          <p className="pf-hero-email">{user?.emailAddresses?.[0]?.emailAddress}</p>
          <div className="ct-hero-badges">
            <span className="ct-hero-badge">📦 Track your orders</span>
            <span className="ct-hero-badge">👤 Manage profile</span>
            <span className="ct-hero-badge">❤️ View wishlist</span>
          </div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="pf-layout">

        {/* ── SIDEBAR ── */}
        <div className="pf-sidebar reveal-left">
          {/* Nav card */}
          <div className="ct-card pf-nav-card">
            {[
              { id: 'orders', icon: '📦', label: 'My Orders', badge: orders.length || null },
              { id: 'profile', icon: '👤', label: 'My Profile' },
              { id: 'wishlist', icon: '❤️', label: 'Wishlist', href: '/wishlist' },
            ].map(item => (
              item.href ? (
                <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                  <div className="pf-nav-item">
                    <span className="pf-nav-icon">{item.icon}</span>
                    <span className="pf-nav-label">{item.label}</span>
                  </div>
                </Link>
              ) : (
                <div
                  key={item.id}
                  className={`pf-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="pf-nav-icon">{item.icon}</span>
                  <span className="pf-nav-label">{item.label}</span>
                  {item.badge ? <span className="pf-nav-badge">{item.badge}</span> : null}
                </div>
              )
            ))}
          </div>

          {/* Quick info card */}
          <div className="pf-quick-card reveal d1">
            <div className="pf-quick-title">🌿 Account Info</div>
            <div className="pf-quick-row">
              <span className="pf-quick-lbl">Member since</span>
              <span className="pf-quick-val">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
            <div className="pf-quick-row">
              <span className="pf-quick-lbl">Total orders</span>
              <span className="pf-quick-val">{orders.length}</span>
            </div>
          </div>

          {/* Sign out */}
          <SignOutButton redirectUrl="/">
            <button className="pf-signout-btn">🚪 Sign Out</button>
          </SignOutButton>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="pf-content">

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div>
              <div className="pf-content-head">
                <h2 className="pf-content-title">My <span className="gold">Orders</span></h2>
                <p className="pf-content-sub">Track and manage all your past and current orders.</p>
              </div>

              {loading ? (
                <div className="pf-loading">
                  <div className="pf-loading-spinner" />
                  <p>Loading your orders…</p>
                </div>
              ) : apiError ? (
                <div style={{
                  background: '#FADBD8', border: '1.5px solid var(--red)',
                  borderRadius: 16, padding: '28px 24px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)', marginBottom: 8 }}>
                    Could not load orders
                  </div>
                  <div style={{
                    fontSize: 13, color: 'var(--muted)', marginBottom: 20,
                    background: '#fff', borderRadius: 8, padding: '10px 16px',
                    fontFamily: 'monospace', wordBreak: 'break-all'
                  }}>
                    API Error: {apiError}
                  </div>
                  <button
                    onClick={() => {
                      setApiError(null); setLoading(true);
                      fetch('/api/orders').then(r => r.json()).then(d => {
                        if (Array.isArray(d)) setOrders(d)
                        else setApiError(d?.error || 'Unknown error')
                        setLoading(false)
                      }).catch(e => { setApiError(e.message); setLoading(false) })
                    }}
                    style={{
                      padding: '10px 24px', background: 'var(--green-m)', color: '#fff',
                      border: 'none', borderRadius: 10, fontFamily: 'Nunito,sans-serif',
                      fontSize: 14, fontWeight: 800, cursor: 'pointer'
                    }}
                  >🔄 Retry</button>
                </div>
              ) : orders.length === 0 ? (
                <div className="pf-empty">
                  <div className="pf-empty-icon">📦</div>
                  <h3>No orders yet</h3>
                  <p>Looks like you haven't placed any orders. Start exploring our store!</p>
                  <Link href="/shop" className="pf-shop-btn">Browse Products →</Link>
                </div>
              ) : (
                orders.map((order, i) => (
                  <div key={order.id} className="pf-order-card">
                    <div className="pf-order-top">
                      <div>
                        <div className="pf-order-id">{order.orderNumber}</div>
                        <div className="pf-order-date">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <span className="pf-order-status" style={statusStyle(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="pf-order-items">
                      {order.items?.map((item, j) => (
                        <span key={j} className="pf-order-chip">{item.name} ×{item.quantity}</span>
                      ))}
                    </div>
                    <div className="pf-order-foot">
                      <div className="pf-order-total">₹{order.total}</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {order.status === 'processing' && (
                          <button className="pf-order-action danger">Cancel</button>
                        )}
                        <Link href={`/orders/${order.id}`} className="pf-order-action" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Track Order →</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="reveal-right">
              <div className="pf-content-head">
                <h2 className="pf-content-title">My <span className="gold">Profile</span></h2>
                <p className="pf-content-sub">Your personal account information from Clerk.</p>
              </div>

              <div className="pf-profile-grid">
                {/* Avatar card */}
                <div className="pf-avatar-card ct-card reveal d1">
                  <div className="pf-avatar-circle">{avatarInitial}</div>
                  <div className="pf-avatar-name">{fullName || 'User'}</div>
                  <div className="pf-avatar-email">{user?.emailAddresses?.[0]?.emailAddress}</div>
                  <a
                    href="https://accounts.clerk.dev/user"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-edit-btn"
                  >✏️ Edit Profile</a>
                </div>

                {/* Details card */}
                <div className="pf-details-card ct-card reveal d2">
                  <div className="pf-details-title">Account Details</div>
                  {[
                    ['First Name', user?.firstName || '—'],
                    ['Last Name', user?.lastName || '—'],
                    ['Email', user?.emailAddresses?.[0]?.emailAddress || '—'],
                    ['Phone', user?.phoneNumbers?.[0]?.phoneNumber || '—'],
                    ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="pf-info-row">
                      <div className="pf-info-label">{label}</div>
                      <div className="pf-info-value">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Ushas products</div>
            <div className="footer-logo-sub">Kerala</div>
            <p>Bringing the authentic taste of Kerala's traditional snacks and health foods to every home across India since 2018.</p>
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
              {CATEGORIES.map(c => (<li key={c}><Link href={`/shop?category=${c}`}>{c}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              {[['/profile', 'My Orders'], ['#', 'Return Policy'], ['#', 'FAQ'], ['#', 'Privacy Policy']].map(([href, label]) => (
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
    </>
  )
}

/* ─────────────────────────────────────────
   SHARED STYLES — mirrors contact page exactly
───────────────────────────────────────── */
const sharedStyles = `
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

  /* ── ANIMATIONS ── */
  .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity:1; transform:translateY(0); }
  .reveal-left { opacity:0; transform:translateX(-28px); transition:opacity 0.7s ease, transform 0.7s ease; }
  .reveal-left.visible { opacity:1; transform:translateX(0); }
  .reveal-right { opacity:0; transform:translateX(28px); transition:opacity 0.7s ease, transform 0.7s ease; }
  .reveal-right.visible { opacity:1; transform:translateX(0); }
  .d1{transition-delay:0.1s!important} .d2{transition-delay:0.2s!important} .d3{transition-delay:0.3s!important}

  /* ── HERO ── */
  .pf-hero {
    background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
    padding:72px 80px 64px;
    text-align:center; position:relative; overflow:hidden;
  }
  .pf-hero::before {
    content:'👤'; position:absolute; right:80px; top:50%;
    transform:translateY(-50%); font-size:160px; opacity:0.05;
    pointer-events:none;
  }
  .pf-hero::after {
    content:''; position:absolute; inset:0; opacity:0.03;
    background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
    background-size:28px 28px; pointer-events:none;
  }
  .pf-hero-inner { position:relative; z-index:1; }

  /* breadcrumb — identical to contact */
  .ct-bc {
    display:inline-flex; align-items:center; gap:6px;
    font-size:12px; color:rgba(255,255,255,0.4); font-weight:600;
    margin-bottom:20px;
  }
  .ct-bc a { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
  .ct-bc a:hover { color:var(--gold-lt); }

  .pf-hero-avatar {
    width:84px; height:84px; border-radius:50%;
    background:linear-gradient(135deg, var(--gold-lt), var(--gold));
    display:flex; align-items:center; justify-content:center;
    font-size:32px; font-weight:900; color:var(--brown);
    margin:0 auto 16px;
    border:4px solid rgba(255,255,255,0.2);
    box-shadow:0 8px 32px rgba(0,0,0,0.2);
  }
  .ct-hero-kicker {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(240,180,41,0.15); border:1px solid rgba(240,180,41,0.3);
    color:var(--gold-lt); font-size:11px; font-weight:800;
    letter-spacing:0.22em; text-transform:uppercase;
    padding:6px 16px; border-radius:40px; margin-bottom:14px;
  }
  .pf-hero-name {
    font-family:'Tiro Malayalam',serif; font-size:48px; color:#fff;
    margin-bottom:8px; line-height:1.1;
  }
  .pf-hero-name em { color:var(--gold-lt); font-style:normal; }
  .pf-hero-email { font-size:14px; color:rgba(255,255,255,0.55); margin-bottom:24px; }
  .ct-hero-badges {
    display:flex; justify-content:center; gap:16px; flex-wrap:wrap;
  }
  .ct-hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
    color:rgba(255,255,255,0.75); font-size:12.5px; font-weight:700;
    padding:8px 16px; border-radius:40px; backdrop-filter:blur(4px);
  }

  /* ── LAYOUT ── */
  .pf-layout {
    display:grid; grid-template-columns:280px 1fr;
    gap:40px; padding:64px 80px;
    align-items:start;
  }

  /* ── SIDEBAR ── */
  .pf-sidebar {}

  /* Nav card — uses ct-card base */
  .ct-card {
    background:#fff; border-radius:16px; padding:20px;
    border:1px solid var(--border);
    transition:box-shadow 0.25s, transform 0.25s;
  }
  .pf-nav-card { padding:0; overflow:hidden; margin-bottom:16px; }
  .pf-nav-item {
    display:flex; align-items:center; gap:14px;
    padding:16px 20px; font-size:14px; font-weight:600;
    cursor:pointer; border-bottom:1px solid var(--border);
    transition:background 0.15s, color 0.15s; color:var(--text);
    text-decoration:none;
  }
  .pf-nav-item:last-child { border-bottom:none; }
  .pf-nav-item:hover { background:var(--green-pl); color:var(--green-m); }
  .pf-nav-item.active { background:var(--green-pl); color:var(--green-m); font-weight:800; }
  .pf-nav-icon { font-size:18px; flex-shrink:0; }
  .pf-nav-label { flex:1; }
  .pf-nav-badge {
    background:var(--green-m); color:#fff;
    font-size:11px; font-weight:800;
    padding:2px 8px; border-radius:20px;
  }

  /* Quick info card */
  .pf-quick-card {
    background:linear-gradient(135deg, var(--green-m), var(--green));
    border-radius:16px; padding:20px; margin-bottom:16px; color:#fff;
  }
  .pf-quick-title {
    font-size:13px; font-weight:800; letter-spacing:0.1em;
    text-transform:uppercase; color:rgba(255,255,255,0.6); margin-bottom:14px;
  }
  .pf-quick-row {
    display:flex; justify-content:space-between;
    font-size:13.5px; padding:6px 0;
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  .pf-quick-row:last-child { border-bottom:none; }
  .pf-quick-lbl { color:rgba(255,255,255,0.65); font-weight:600; }
  .pf-quick-val { color:#fff; font-weight:800; }

  /* Sign out */
  .pf-signout-btn {
    width:100%; padding:13px; background:transparent;
    color:var(--red); border:1.5px solid var(--red);
    border-radius:12px; font-family:'Nunito',sans-serif;
    font-size:14px; font-weight:800; cursor:pointer;
    transition:all 0.2s;
  }
  .pf-signout-btn:hover { background:var(--red); color:#fff; }

  /* ── CONTENT AREA ── */
  .pf-content {}
  .pf-content-head { margin-bottom:28px; }
  .pf-content-title {
    font-family:'Tiro Malayalam',serif; font-size:34px;
    color:var(--text); margin-bottom:8px; line-height:1.2;
  }
  .pf-content-title .gold { color:var(--gold); }
  .pf-content-sub { font-size:15px; color:var(--muted); line-height:1.8; }

  /* ── LOADING ── */
  .pf-loading {
    text-align:center; padding:60px 20px; color:var(--muted);
    display:flex; flex-direction:column; align-items:center; gap:16px;
  }
  .pf-loading-spinner {
    width:36px; height:36px; border-radius:50%;
    border:3px solid var(--green-pl); border-top-color:var(--green-m);
    animation:spin 0.8s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }
  .pf-loading p { font-size:15px; font-weight:600; }

  /* ── EMPTY STATE ── */
  .pf-empty {
    text-align:center; padding:72px 40px;
    background:#fff; border-radius:20px; border:1px solid var(--border);
  }
  .pf-empty-icon { font-size:56px; margin-bottom:16px; }
  .pf-empty h3 { font-family:'Tiro Malayalam',serif; font-size:26px; margin-bottom:10px; }
  .pf-empty p { font-size:14px; color:var(--muted); margin-bottom:24px; max-width:320px; margin-left:auto; margin-right:auto; line-height:1.7; }
  .pf-shop-btn {
    display:inline-block; padding:13px 28px;
    background:linear-gradient(135deg, var(--green-m), var(--green));
    color:#fff; border-radius:12px; text-decoration:none;
    font-size:14px; font-weight:900;
    box-shadow:0 4px 20px rgba(45,90,39,0.3);
    transition:transform 0.15s, box-shadow 0.2s;
  }
  .pf-shop-btn:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(45,90,39,0.4); }

  /* ── ORDER CARDS ── */
  .pf-order-card {
    background:#fff; border-radius:16px; border:1px solid var(--border);
    padding:24px; margin-bottom:16px;
    transition:box-shadow 0.25s, transform 0.25s;
  }
  .pf-order-card:hover { box-shadow:0 8px 28px var(--shadow); transform:translateY(-2px); }
  .pf-order-top {
    display:flex; justify-content:space-between; align-items:flex-start;
    margin-bottom:16px;
  }
  .pf-order-id { font-size:15px; font-weight:800; color:var(--text); }
  .pf-order-date { font-size:12.5px; color:var(--muted); margin-top:4px; }
  .pf-order-status {
    font-size:12px; font-weight:800; padding:5px 14px; border-radius:20px;
    flex-shrink:0;
  }
  .pf-order-items { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .pf-order-chip {
    font-size:12.5px; background:var(--cream2);
    padding:5px 14px; border-radius:20px; color:var(--text); font-weight:600;
  }
  .pf-order-foot {
    display:flex; justify-content:space-between; align-items:center;
    border-top:1px solid var(--border); padding-top:14px;
  }
  .pf-order-total { font-size:18px; font-weight:900; color:var(--gold); }
  .pf-order-action {
    font-size:13px; color:var(--green-m); font-weight:700;
    cursor:pointer; background:none; border:none;
    font-family:'Nunito',sans-serif; transition:color 0.2s;
    padding:6px 14px; border-radius:8px;
    border:1.5px solid var(--green-m);
  }
  .pf-order-action:hover { background:var(--green-pl); }
  .pf-order-action.danger { color:var(--red); border-color:var(--red); }
  .pf-order-action.danger:hover { background:#fff0ee; }

  /* ── PROFILE GRID ── */
  .pf-profile-grid {
    display:grid; grid-template-columns:220px 1fr;
    gap:24px; align-items:start;
  }

  /* Avatar card */
  .pf-avatar-card {
    text-align:center; padding:28px 20px;
  }
  .pf-avatar-circle {
    width:72px; height:72px; border-radius:50%;
    background:linear-gradient(135deg, var(--gold-lt), var(--gold));
    display:flex; align-items:center; justify-content:center;
    font-size:28px; font-weight:900; color:var(--brown);
    margin:0 auto 14px;
    border:3px solid var(--cream3);
  }
  .pf-avatar-name { font-size:16px; font-weight:800; color:var(--text); margin-bottom:4px; }
  .pf-avatar-email { font-size:12.5px; color:var(--muted); margin-bottom:18px; line-height:1.5; word-break:break-all; }
  .pf-edit-btn {
    display:inline-block; padding:10px 20px;
    background:linear-gradient(135deg, var(--green-m), var(--green));
    color:#fff; border-radius:10px; text-decoration:none;
    font-size:13px; font-weight:800;
    box-shadow:0 3px 12px rgba(45,90,39,0.25);
    transition:transform 0.15s;
  }
  .pf-edit-btn:hover { transform:translateY(-1px); }

  /* Details card */
  .pf-details-card { padding:0; overflow:hidden; }
  .pf-details-title {
    padding:18px 24px; font-size:13px; font-weight:800;
    letter-spacing:0.1em; text-transform:uppercase;
    color:var(--muted); background:var(--cream2);
    border-bottom:1px solid var(--border);
  }
  .pf-info-row {
    display:flex; gap:16px; padding:14px 24px;
    border-bottom:1px solid var(--border);
    transition:background 0.15s;
  }
  .pf-info-row:last-child { border-bottom:none; }
  .pf-info-row:hover { background:var(--cream); }
  .pf-info-label { font-size:13px; font-weight:700; color:var(--muted); min-width:120px; }
  .pf-info-value { font-size:14px; color:var(--text); font-weight:500; }

  /* ── FOOTER — identical to contact ── */
  .footer { background:var(--brown); padding:72px 80px 36px; }
  .footer-top { display:grid; grid-template-columns:2.2fr 1fr 1fr 1fr; gap:56px; margin-bottom:56px; }
  .footer-logo { font-family:'Tiro Malayalam',serif; font-size:30px; color:var(--gold-lt); margin-bottom:4px; }
  .footer-logo-sub { font-size:10px; color:rgba(255,255,255,0.35); letter-spacing:0.22em; text-transform:uppercase; margin-bottom:16px; }
  .footer-brand p { font-size:13.5px; color:rgba(255,255,255,0.55); line-height:1.8; max-width:240px; }
  .footer-col h4 { font-size:11px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); }
  .footer-col ul { list-style:none; display:flex; flex-direction:column; gap:10px; }
  .footer-col ul li a { font-size:13.5px; color:rgba(255,255,255,0.5); text-decoration:none; transition:color 0.2s; }
  .footer-col ul li a:hover { color:var(--gold-lt); }
  .footer-bottom { border-top:1px solid rgba(255,255,255,0.07); padding-top:28px; display:flex; justify-content:space-between; align-items:center; }
  .footer-bottom p { font-size:12.5px; color:rgba(255,255,255,0.3); }
  .footer-socials { display:flex; gap:10px; }
  .footer-social { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.5); font-size:16px; cursor:pointer; transition:all 0.2s; text-decoration:none; }
  .footer-social:hover { background:var(--gold); color:#fff; transform:translateY(-2px); }

  /* ── RESPONSIVE ── */
  @media(max-width:1200px) { .pf-hero{padding:56px 48px 52px;} .pf-layout{padding:52px 48px;} .footer{padding:60px 48px 28px;} }
  @media(max-width:1024px) { .pf-hero{padding:48px 40px;} .pf-layout{padding:44px 40px; gap:24px;} .footer{padding:52px 40px 24px;} .footer-top{grid-template-columns:1fr 1fr;gap:32px;} }
  @media(max-width:768px) {
    .pf-hero{padding:44px 24px;} .pf-hero-name{font-size:34px;}
    .pf-layout{grid-template-columns:1fr; padding:32px 24px;}
    .pf-sidebar{display:contents;}
    .pf-profile-grid{grid-template-columns:1fr;}
    .footer{padding:48px 24px 24px;} .footer-top{grid-template-columns:1fr;gap:28px;}
    .footer-bottom{flex-direction:column;gap:16px;text-align:center;}
  }
  @media(max-width:480px) {
    .pf-hero{padding:36px 16px;} .pf-hero-name{font-size:26px;}
    .pf-layout{padding:24px 16px;}
    .footer{padding:40px 16px 20px;}
  }
`
