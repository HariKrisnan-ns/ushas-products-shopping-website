'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('ushas-cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  const updateQty = (id, qty) => {
    const updated = qty < 1
      ? cart.filter(i => i.id !== id)
      : cart.map(i => i.id === id ? { ...i, qty } : i)
    setCart(updated)
    localStorage.setItem('ushas-cart', JSON.stringify(updated))
  }

  const removeItem = (id) => {
    const updated = cart.filter(i => i.id !== id)
    setCart(updated)
    localStorage.setItem('ushas-cart', JSON.stringify(updated))
  }

  const applyCoupon = () => {
    setCouponError('')
    if (coupon.trim().toUpperCase() === 'USHAS10') {
      setCouponApplied(true)
    } else {
      setCouponError('Invalid coupon code')
    }
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0
  const delivery = subtotal >= 500 ? 0 : 49
  const total = subtotal - discount + delivery
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const freeDeliveryLeft = Math.max(0, 500 - subtotal)
  const freeDeliveryProgress = Math.min(100, (subtotal / 500) * 100)

  const handleCheckout = () => {
    if (!isSignedIn) { router.push('/sign-in'); return }
    router.push('/checkout')
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
        body { font-family:'Nunito',sans-serif; background:var(--cream); color:var(--text); }

        /* ── HEADER ── */
        .ch-header {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:52px 80px; position:relative; overflow:hidden;
        }
        .ch-header::before {
          content:'🛒'; position:absolute; right:60px; top:50%;
          transform:translateY(-50%); font-size:120px; opacity:0.06;
          pointer-events:none;
        }
        .ch-header-inner { position:relative; z-index:1; }
        .ch-breadcrumb {
          display:flex; align-items:center; gap:6px;
          font-size:12.5px; color:rgba(255,255,255,0.4);
          font-weight:600; margin-bottom:14px;
        }
        .ch-breadcrumb a { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
        .ch-breadcrumb a:hover { color:var(--gold-lt); }
        .ch-header h1 {
          font-family:'Tiro Malayalam',serif; font-size:46px; color:#fff;
          margin-bottom:8px; line-height:1.1;
        }
        .ch-header p { font-size:14.5px; color:rgba(255,255,255,0.6); }

        /* Progress steps */
        .ch-steps {
          display:flex; align-items:center; gap:0;
          margin-top:28px; padding-top:24px;
          border-top:1px solid rgba(255,255,255,0.08);
        }
        .ch-step {
          display:flex; align-items:center; gap:8px;
          font-size:12px; font-weight:700; letter-spacing:0.04em;
        }
        .ch-step-num {
          width:26px; height:26px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:800; flex-shrink:0;
        }
        .ch-step.done .ch-step-num { background:var(--gold-lt); color:#1E120A; }
        .ch-step.active .ch-step-num { background:#fff; color:var(--green-m); }
        .ch-step.pending .ch-step-num { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.4); }
        .ch-step.done .ch-step-label { color:var(--gold-lt); }
        .ch-step.active .ch-step-label { color:#fff; }
        .ch-step.pending .ch-step-label { color:rgba(255,255,255,0.35); }
        .ch-step-line {
          flex:1; height:1px; background:rgba(255,255,255,0.12);
          margin:0 12px; min-width:32px;
        }

        /* ── LAYOUT ── */
        .cart-layout {
          display:grid; grid-template-columns:1fr 380px;
          gap:32px; padding:48px 80px;
          align-items:start;
        }

        /* ── FREE DELIVERY BANNER ── */
        .free-banner {
          background:#fff; border:1px solid var(--border);
          border-radius:14px; padding:16px 20px; margin-bottom:20px;
          overflow:hidden;
        }
        .free-banner-text {
          display:flex; align-items:center; justify-content:space-between;
          font-size:13.5px; font-weight:700; margin-bottom:10px;
        }
        .free-banner-text .left { display:flex; align-items:center; gap:8px; color:var(--text); }
        .free-banner-text .amt { color:var(--green-m); }
        .free-progress-bar {
          height:6px; background:var(--cream2); border-radius:4px; overflow:hidden;
        }
        .free-progress-fill {
          height:100%; border-radius:4px;
          background:linear-gradient(90deg, var(--green-m), var(--green-lt));
          transition:width 0.4s ease;
        }
        .free-banner.reached {
          background:var(--green-pl); border-color:var(--green-m);
        }
        .free-banner.reached .free-banner-text .left { color:var(--green-m); }

        /* ── CART ITEMS ── */
        .cart-items { display:flex; flex-direction:column; gap:14px; }

        .cart-item {
          background:#fff; border-radius:16px; padding:20px;
          border:1px solid var(--border);
          display:flex; gap:18px; align-items:flex-start;
          transition:box-shadow 0.25s, transform 0.25s;
        }
        .cart-item:hover { box-shadow:0 8px 28px var(--shadow); transform:translateY(-2px); }

        .cart-img {
          width:96px; height:96px; object-fit:cover;
          border-radius:12px; border:1px solid var(--border);
          flex-shrink:0;
        }

        .cart-info { flex:1; min-width:0; }
        .cart-cat {
          font-size:10px; color:var(--green-m); font-weight:800;
          letter-spacing:0.12em; text-transform:uppercase; margin-bottom:4px;
        }
        .cart-name { font-size:16px; font-weight:800; margin-bottom:4px; line-height:1.3; color:var(--text); }
        .cart-meta { font-size:12.5px; color:var(--muted); font-weight:500; margin-bottom:14px; }

        .cart-item-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }

        .qty-ctrl {
          display:flex; align-items:center; overflow:hidden;
          border:1.5px solid var(--border); border-radius:10px; background:#fff;
        }
        .qty-btn {
          width:36px; height:36px; background:transparent; border:none;
          font-size:18px; cursor:pointer; color:var(--text); font-weight:600;
          transition:background 0.15s; display:flex; align-items:center; justify-content:center;
        }
        .qty-btn:hover { background:var(--green-pl); }
        .qty-num {
          width:44px; text-align:center; font-weight:800; font-size:15px;
          border-left:1px solid var(--border); border-right:1px solid var(--border);
          height:36px; display:flex; align-items:center; justify-content:center;
        }

        .cart-item-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
        .cart-price { font-family:'Tiro Malayalam',serif; font-size:22px; font-weight:700; color:var(--gold); }
        .cart-unit-price { font-size:11.5px; color:var(--muted); }
        .remove-btn {
          font-size:12px; color:var(--muted); cursor:pointer;
          background:none; border:none; font-family:'Nunito',sans-serif;
          font-weight:700; padding:4px 10px; border-radius:6px;
          transition:background 0.2s, color 0.2s;
          display:flex; align-items:center; gap:4px;
        }
        .remove-btn:hover { background:#fff0f0; color:var(--red); }

        /* ── ORDER SUMMARY ── */
        .order-summary {
          background:#fff; border-radius:20px;
          border:1px solid var(--border);
          overflow:hidden;
          position:sticky; top:88px;
          box-shadow:0 8px 32px var(--shadow);
        }

        .os-head {
          padding:22px 24px 18px;
          border-bottom:1px solid var(--border);
          background:var(--cream2);
        }
        .os-head h3 {
          font-family:'Tiro Malayalam',serif; font-size:22px; color:var(--text);
        }
        .os-head p { font-size:12.5px; color:var(--muted); margin-top:2px; }

        .os-body { padding:20px 24px; }

        .os-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:9px 0; font-size:14px; color:var(--muted);
          border-bottom:1px dashed var(--border);
        }
        .os-row:last-of-type { border-bottom:none; }
        .os-row .label { display:flex; align-items:center; gap:6px; }
        .os-row.total {
          font-size:17px; font-weight:900; color:var(--text);
          border-top:2px solid var(--border); margin-top:8px;
          padding-top:16px; border-bottom:none;
        }
        .os-row.total .value { color:var(--gold); font-family:'Tiro Malayalam',serif; font-size:22px; }
        .os-row .free { color:var(--green-m); font-weight:800; }
        .os-row .discount-val { color:var(--red); font-weight:800; }

        /* Coupon */
        .coupon-wrap { margin:16px 0; }
        .coupon-label { font-size:12px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
        .coupon-row { display:flex; gap:8px; }
        .coupon-input {
          flex:1; padding:11px 14px; border-radius:10px;
          border:1.5px solid var(--border); background:var(--cream);
          font-family:'Nunito',sans-serif; font-size:13.5px; outline:none;
          color:var(--text); font-weight:600;
          transition:border-color 0.2s;
        }
        .coupon-input:focus { border-color:var(--green-m); }
        .coupon-input.applied { border-color:var(--green-m); background:var(--green-pl); }
        .coupon-btn {
          padding:11px 16px; border-radius:10px;
          background:var(--green-m); color:#fff;
          border:none; font-family:'Nunito',sans-serif;
          font-size:13px; font-weight:800; cursor:pointer;
          transition:background 0.2s, transform 0.15s;
          white-space:nowrap;
        }
        .coupon-btn:hover { background:var(--green); transform:translateY(-1px); }
        .coupon-success { font-size:12px; color:var(--green-m); font-weight:700; margin-top:6px; display:flex; align-items:center; gap:4px; }
        .coupon-error { font-size:12px; color:var(--red); font-weight:700; margin-top:6px; }

        /* Checkout button */
        .checkout-btn {
          width:100%; padding:16px;
          background:linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 100%);
          color:#1E120A; border:none; border-radius:12px;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:900;
          cursor:pointer; letter-spacing:0.02em;
          box-shadow:0 4px 20px rgba(200,121,10,0.35);
          transition:transform 0.15s, box-shadow 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .checkout-btn:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(200,121,10,0.45); }

        .os-secure {
          display:flex; align-items:center; justify-content:center; gap:6px;
          font-size:12px; color:var(--muted); margin-top:12px;
          font-weight:600;
        }

        .continue-link {
          display:flex; align-items:center; justify-content:center; gap:6px;
          margin-top:14px; font-size:13px; color:var(--green-m);
          text-decoration:none; font-weight:700;
          transition:color 0.2s;
        }
        .continue-link:hover { color:var(--green); }

        /* ── EMPTY STATE ── */
        .empty-wrap { padding:100px 80px; text-align:center; }
        .empty-icon { font-size:72px; margin-bottom:20px; opacity:0.6; }
        .empty-wrap h3 { font-family:'Tiro Malayalam',serif; font-size:32px; margin-bottom:12px; color:var(--text); }
        .empty-wrap p { font-size:15px; color:var(--muted); margin-bottom:28px; max-width:360px; margin-left:auto; margin-right:auto; }
        .empty-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 32px; background:var(--green-m); color:#fff;
          border:none; border-radius:12px; font-family:'Nunito',sans-serif;
          font-size:15px; font-weight:800; cursor:pointer; text-decoration:none;
          box-shadow:0 4px 16px rgba(45,90,39,0.3);
          transition:transform 0.15s, box-shadow 0.2s;
        }
        .empty-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(45,90,39,0.4); }

        /* ── RESPONSIVE ── */
        @media(max-width:1200px) {
          .ch-header { padding:44px 48px; }
          .cart-layout { padding:40px 48px; }
        }
        @media(max-width:1024px) {
          .ch-header { padding:36px 40px; }
          .cart-layout { padding:32px 40px; grid-template-columns:1fr 340px; gap:24px; }
        }
        @media(max-width:768px) {
          .ch-header { padding:32px 24px; }
          .ch-header h1 { font-size:34px; }
          .ch-steps { display:none; }
          .cart-layout { grid-template-columns:1fr; padding:24px 16px; }
          .order-summary { position:static; }
          .empty-wrap { padding:60px 24px; }
        }
        @media(max-width:480px) {
          .ch-header { padding:24px 16px; }
          .ch-header h1 { font-size:28px; }
          .cart-layout { padding:16px 12px; }
          .cart-img { width:76px; height:76px; }
          .cart-name { font-size:14px; }
          .cart-item-footer { flex-direction:column; align-items:flex-start; }
          .cart-item-right { flex-direction:row; align-items:center; width:100%; justify-content:space-between; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="ch-header">
        <div className="ch-header-inner">
          <div className="ch-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Cart</span>
          </div>
          <h1>Your Cart 🛒</h1>
          <p>{totalItems} item{totalItems !== 1 ? 's' : ''} waiting for you</p>

          {/* Progress Steps */}
          <div className="ch-steps">
            {[
              ['1', 'Cart', 'active'],
              ['line'],
              ['2', 'Checkout', 'pending'],
              ['line'],
              ['3', 'Confirm', 'pending'],
            ].map((s, i) =>
              s[0] === 'line'
                ? <div key={i} className="ch-step-line" />
                : (
                  <div key={i} className={`ch-step ${s[2]}`}>
                    <div className="ch-step-num">{s[0]}</div>
                    <span className="ch-step-label">{s[1]}</span>
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-wrap">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet. Browse our Kerala products!</p>
          <Link href="/shop" className="empty-btn">Browse Products →</Link>
        </div>
      ) : (
        <div className="cart-layout">

          {/* ── LEFT: CART ITEMS ── */}
          <div>
            {/* Free delivery progress bar */}
            <div className={`free-banner ${delivery === 0 ? 'reached' : ''}`}>
              <div className="free-banner-text">
                <div className="left">
                  {delivery === 0
                    ? <><span>🎉</span><span>You've unlocked FREE delivery!</span></>
                    : <><span>🚚</span><span>Add <span className="amt">₹{freeDeliveryLeft}</span> more for FREE delivery</span></>
                  }
                </div>
              </div>
              <div className="free-progress-bar">
                <div className="free-progress-fill" style={{ width: `${freeDeliveryProgress}%` }} />
              </div>
            </div>

            {/* Items */}
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={item.imageUrl} alt={item.name} className="cart-img" />
                  <div className="cart-info">
                    <div className="cart-cat">{item.category}</div>
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-meta">
                      {item.weight && `${item.weight}`}{item.weight && ' · '}₹{item.price} each
                    </div>
                    <div className="cart-item-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                          <span className="qty-num">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑 Remove</button>
                      </div>
                      <div className="cart-item-right">
                        <div className="cart-price">₹{item.price * item.qty}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className="order-summary">
            <div className="os-head">
              <h3>Order Summary</h3>
              <p>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            </div>
            <div className="os-body">
              <div className="os-row">
                <span className="label">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {couponApplied && (
                <div className="os-row">
                  <span className="label">🏷️ Coupon (USHAS10)</span>
                  <span className="discount-val">−₹{discount}</span>
                </div>
              )}
              <div className="os-row">
                <span className="label">🚚 Delivery</span>
                <span className={delivery === 0 ? 'free' : ''}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              <div className="os-row total">
                <span>Total</span>
                <span className="value">₹{total}</span>
              </div>

              {/* Coupon */}
              <div className="coupon-wrap">
                <div className="coupon-label">Have a coupon?</div>
                <div className="coupon-row">
                  <input
                    className={`coupon-input ${couponApplied ? 'applied' : ''}`}
                    placeholder="Enter code (try USHAS10)"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                    disabled={couponApplied}
                  />
                  <button className="coupon-btn" onClick={applyCoupon} disabled={couponApplied}>
                    {couponApplied ? '✓' : 'Apply'}
                  </button>
                </div>
                {couponApplied && <div className="coupon-success">✅ 10% discount applied!</div>}
                {couponError && <div className="coupon-error">❌ {couponError}</div>}
              </div>

              {/* Checkout */}
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout →
              </button>

              <div className="os-secure">🔒 Secure checkout · COD available</div>

              <Link href="/shop" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      )}
    </>
  )
}
