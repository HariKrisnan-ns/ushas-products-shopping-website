'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function CheckoutPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [toastType, setToastType] = useState('success')
  const [form, setForm] = useState({
    name: '', phone: '', line1: '', line2: '',
    city: '', state: 'Kerala', pincode: '', paymentMethod: 'COD'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('ushas-cart')
    if (saved) setCart(JSON.parse(saved))
    if (user) setForm(f => ({ ...f, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() }))
  }, [user])

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const delivery = subtotal >= 500 ? 0 : 49
  const total = subtotal + delivery
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.line1.trim()) errs.line1 = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.pincode.trim()) errs.pincode = 'Required'
    else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter valid 6-digit PIN'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validate()) { showToast('❌ Please fill all required fields', 'error'); return }
    setLoading(true)
    try {
      const addrRes = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone,
          line1: form.line1, line2: form.line2,
          city: form.city, state: form.state,
          pincode: form.pincode, isDefault: true
        })
      })
      const address = await addrRes.json()
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
          addressId: address.id,
          paymentMethod: form.paymentMethod,
          subtotal, deliveryFee: delivery
        })
      })
      localStorage.removeItem('ushas-cart')
      setCart([])
      showToast('🎉 Order placed successfully!')
      setTimeout(() => router.push('/profile'), 2000)
    } catch {
      showToast('❌ Something went wrong. Please try again.', 'error')
    }
    setLoading(false)
  }

  // ── NOT SIGNED IN ──
  if (!isSignedIn) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@700;800&display=swap');
        body { font-family:'Nunito',sans-serif; background:#FDFAF3; }
        .si-wrap { text-align:center; padding:100px 24px; }
        .si-icon { font-size:64px; margin-bottom:20px; }
        .si-wrap h2 { font-family:'Tiro Malayalam',serif; font-size:32px; margin-bottom:12px; color:#1E120A; }
        .si-wrap p { font-size:15px; color:#7A5C3A; margin-bottom:28px; }
        .si-btn { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; background:#3A6B35; color:#fff; border-radius:12px; text-decoration:none; font-weight:800; font-size:15px; }
      `}</style>
      <div className="si-wrap">
        <div className="si-icon">🔒</div>
        <h2>Sign in to Checkout</h2>
        <p>You need to be signed in to place an order.</p>
        <Link href="/sign-in" className="si-btn">Sign In →</Link>
      </div>
    </>
  )

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
        .co-header {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:52px 80px; position:relative; overflow:hidden;
        }
        .co-header::before {
          content:'🎉'; position:absolute; right:60px; top:50%;
          transform:translateY(-50%); font-size:110px; opacity:0.06; pointer-events:none;
        }
        .co-header-inner { position:relative; z-index:1; }
        .co-breadcrumb {
          display:flex; align-items:center; gap:6px;
          font-size:12.5px; color:rgba(255,255,255,0.4); font-weight:600; margin-bottom:14px;
        }
        .co-breadcrumb a { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
        .co-breadcrumb a:hover { color:var(--gold-lt); }
        .co-header h1 { font-family:'Tiro Malayalam',serif; font-size:46px; color:#fff; margin-bottom:8px; }
        .co-header p { font-size:14.5px; color:rgba(255,255,255,0.6); }

        /* Progress steps */
        .co-steps { display:flex; align-items:center; margin-top:28px; padding-top:24px; border-top:1px solid rgba(255,255,255,0.08); }
        .co-step { display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; }
        .co-step-num { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; }
        .co-step.done .co-step-num { background:var(--gold-lt); color:#1E120A; }
        .co-step.active .co-step-num { background:#fff; color:var(--green-m); }
        .co-step.pending .co-step-num { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.4); }
        .co-step.done .co-step-label { color:var(--gold-lt); }
        .co-step.active .co-step-label { color:#fff; }
        .co-step.pending .co-step-label { color:rgba(255,255,255,0.35); }
        .co-step-line { flex:1; height:1px; background:rgba(255,255,255,0.12); margin:0 12px; min-width:32px; }

        /* ── LAYOUT ── */
        .co-layout { display:grid; grid-template-columns:1fr 400px; gap:32px; padding:48px 80px; align-items:start; }

        /* ── SECTIONS ── */
        .co-section {
          background:#fff; border-radius:20px; border:1px solid var(--border);
          overflow:hidden; margin-bottom:20px;
          box-shadow:0 2px 12px var(--shadow);
        }
        .co-section-head {
          padding:20px 28px; background:var(--cream2);
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; gap:12px;
        }
        .co-section-icon { font-size:20px; }
        .co-section-title { font-family:'Tiro Malayalam',serif; font-size:20px; color:var(--text); }
        .co-section-body { padding:24px 28px; }

        /* ── FORM ── */
        .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { margin-bottom:16px; }
        .form-group:last-child { margin-bottom:0; }
        .form-label {
          display:flex; justify-content:space-between; align-items:center;
          font-size:12.5px; font-weight:800; letter-spacing:0.04em;
          text-transform:uppercase; color:var(--muted); margin-bottom:7px;
        }
        .form-required { color:var(--red); }
        .form-error-msg { font-size:11px; color:var(--red); font-weight:700; text-transform:none; letter-spacing:0; }

        .form-input {
          width:100%; padding:12px 16px; border-radius:10px;
          border:1.5px solid var(--border); background:var(--cream);
          font-family:'Nunito',sans-serif; font-size:14px; color:var(--text);
          outline:none; font-weight:500;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          border-color:var(--green-m);
          box-shadow:0 0 0 3px rgba(45,90,39,0.08);
          background:#fff;
        }
        .form-input.error { border-color:var(--red); background:#fff8f8; }
        .form-input.error:focus { box-shadow:0 0 0 3px rgba(192,57,43,0.08); }

        /* ── PAYMENT OPTIONS ── */
        .pay-options { display:flex; flex-direction:column; gap:10px; }
        .pay-option {
          display:flex; align-items:center; gap:16px;
          padding:16px 18px; border:2px solid var(--border); border-radius:14px;
          cursor:pointer; transition:all 0.2s; position:relative;
        }
        .pay-option:hover { border-color:var(--green-m); background:var(--cream2); }
        .pay-option.selected { border-color:var(--green-m); background:var(--green-pl); }
        .pay-option.disabled { opacity:0.5; cursor:not-allowed; }
        .pay-option.disabled:hover { border-color:var(--border); background:transparent; }

        /* Custom radio */
        .pay-radio {
          width:20px; height:20px; border-radius:50%; flex-shrink:0;
          border:2px solid var(--border); background:#fff;
          display:flex; align-items:center; justify-content:center;
          transition:border-color 0.2s;
        }
        .pay-option.selected .pay-radio { border-color:var(--green-m); }
        .pay-radio-dot { width:10px; height:10px; border-radius:50%; background:var(--green-m); opacity:0; transition:opacity 0.15s; }
        .pay-option.selected .pay-radio-dot { opacity:1; }

        .pay-icon { font-size:26px; flex-shrink:0; }
        .pay-label { font-size:14.5px; font-weight:800; color:var(--text); }
        .pay-sub { font-size:12px; color:var(--muted); margin-top:2px; }
        .pay-badge {
          position:absolute; right:16px; top:50%; transform:translateY(-50%);
          font-size:10px; font-weight:800; padding:3px 10px;
          border-radius:20px; letter-spacing:0.06em;
        }
        .pay-badge.available { background:var(--green-pl); color:var(--green-m); }
        .pay-badge.soon { background:var(--cream3); color:var(--muted); }

        /* ── ORDER SUMMARY ── */
        .os-card {
          background:#fff; border-radius:20px; border:1px solid var(--border);
          overflow:hidden; position:sticky; top:88px;
          box-shadow:0 8px 32px var(--shadow);
        }
        .os-head {
          padding:20px 24px; background:var(--cream2);
          border-bottom:1px solid var(--border);
        }
        .os-head h3 { font-family:'Tiro Malayalam',serif; font-size:22px; color:var(--text); }
        .os-head p { font-size:12.5px; color:var(--muted); margin-top:2px; }

        .os-items { padding:16px 24px; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:12px; }
        .os-item { display:flex; align-items:center; gap:12px; }
        .os-item-img { width:52px; height:52px; object-fit:cover; border-radius:10px; border:1px solid var(--border); flex-shrink:0; }
        .os-item-name { font-size:13.5px; font-weight:800; color:var(--text); line-height:1.3; }
        .os-item-qty { font-size:12px; color:var(--muted); margin-top:2px; }
        .os-item-price { font-size:14px; font-weight:900; color:var(--gold); margin-left:auto; flex-shrink:0; font-family:'Tiro Malayalam',serif; }

        .os-totals { padding:16px 24px; border-bottom:1px solid var(--border); }
        .os-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:8px 0; font-size:14px; color:var(--muted);
          border-bottom:1px dashed var(--border);
        }
        .os-row:last-of-type { border-bottom:none; }
        .os-row .free { color:var(--green-m); font-weight:800; }
        .os-row.total {
          font-size:17px; font-weight:900; color:var(--text);
          border-top:2px solid var(--border); padding-top:14px;
          margin-top:6px; border-bottom:none;
        }
        .os-row.total .val { color:var(--gold); font-family:'Tiro Malayalam',serif; font-size:22px; }

        .os-cta { padding:20px 24px; }
        .place-btn {
          width:100%; padding:16px;
          background:linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 100%);
          color:#1E120A; border:none; border-radius:12px;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:900;
          cursor:pointer; letter-spacing:0.02em;
          box-shadow:0 4px 20px rgba(200,121,10,0.35);
          transition:transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .place-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 28px rgba(200,121,10,0.45); }
        .place-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }
        .place-btn.loading { background:var(--cream2); color:var(--muted); }

        .os-secure { display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:var(--muted); margin-top:12px; font-weight:600; }

        /* Delivery notice */
        .delivery-notice {
          background:var(--green-pl); border-radius:10px; padding:12px 16px;
          margin-bottom:16px; font-size:13px; color:var(--green-m);
          font-weight:700; display:flex; align-items:center; gap:8px;
        }

        /* ── TOAST ── */
        .toast {
          position:fixed; bottom:32px; right:32px; z-index:1000;
          padding:14px 20px; border-radius:12px;
          font-size:14px; font-weight:700;
          box-shadow:0 8px 32px rgba(0,0,0,0.18);
          animation:slideUp 0.3s ease;
          display:flex; align-items:center; gap:10px;
          max-width:320px;
        }
        .toast.success { background:var(--green-m); color:#fff; border-left:4px solid var(--gold-lt); }
        .toast.error { background:var(--red); color:#fff; border-left:4px solid #ff8a80; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ── RESPONSIVE ── */
        @media(max-width:1200px) { .co-header{padding:44px 48px;} .co-layout{padding:40px 48px;} }
        @media(max-width:1024px) { .co-header{padding:36px 40px;} .co-layout{padding:32px 40px; grid-template-columns:1fr 360px; gap:24px;} }
        @media(max-width:768px) {
          .co-header{padding:32px 24px;} .co-header h1{font-size:34px;}
          .co-steps{display:none;}
          .co-layout{grid-template-columns:1fr; padding:24px 16px;}
          .os-card{position:static;}
        }
        @media(max-width:480px) {
          .co-header{padding:24px 16px;} .co-header h1{font-size:28px;}
          .co-layout{padding:16px 12px;}
          .co-section-body{padding:18px 16px;}
          .form-row-2{grid-template-columns:1fr;}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="co-header">
        <div className="co-header-inner">
          <div className="co-breadcrumb">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/cart">Cart</Link><span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Checkout</span>
          </div>
          <h1>Checkout</h1>
          <p>Almost there! Complete your details below.</p>
          <div className="co-steps">
            {[
              ['1', 'Cart', 'done'],
              ['line'],
              ['2', 'Checkout', 'active'],
              ['line'],
              ['3', 'Confirm', 'pending'],
            ].map((s, i) =>
              s[0] === 'line'
                ? <div key={i} className="co-step-line" />
                : (
                  <div key={i} className={`co-step ${s[2]}`}>
                    <div className="co-step-num">{s[2] === 'done' ? '✓' : s[0]}</div>
                    <span className="co-step-label">{s[1]}</span>
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      <div className="co-layout">
        {/* ── LEFT ── */}
        <div>
          {/* Delivery Address */}
          <div className="co-section">
            <div className="co-section-head">
              <span className="co-section-icon">📍</span>
              <span className="co-section-title">Delivery Address</span>
            </div>
            <div className="co-section-body">
              <div className="form-row-2">
                <div className="form-group">
                  <div className="form-label">
                    Full Name <span className="form-required">*</span>
                    {errors.name && <span className="form-error-msg">{errors.name}</span>}
                  </div>
                  <input
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    name="name" placeholder="Anitha Krishnan"
                    value={form.name} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">
                    Phone <span className="form-required">*</span>
                    {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                  </div>
                  <input
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    name="phone" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Address Line 1 <span className="form-required">*</span>
                  {errors.line1 && <span className="form-error-msg">{errors.line1}</span>}
                </div>
                <input
                  className={`form-input ${errors.line1 ? 'error' : ''}`}
                  name="line1" placeholder="House No., Street Name"
                  value={form.line1} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <div className="form-label">Address Line 2 <span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
                <input
                  className="form-input"
                  name="line2" placeholder="Landmark, Area"
                  value={form.line2} onChange={handleChange}
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <div className="form-label">
                    City <span className="form-required">*</span>
                    {errors.city && <span className="form-error-msg">{errors.city}</span>}
                  </div>
                  <input
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    name="city" placeholder="Thrissur"
                    value={form.city} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">
                    PIN Code <span className="form-required">*</span>
                    {errors.pincode && <span className="form-error-msg">{errors.pincode}</span>}
                  </div>
                  <input
                    className={`form-input ${errors.pincode ? 'error' : ''}`}
                    name="pincode" placeholder="680001" maxLength={6}
                    value={form.pincode} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">State</div>
                <select className="form-input" name="state" value={form.state} onChange={handleChange}>
                  {['Kerala','Tamil Nadu','Karnataka','Andhra Pradesh','Telangana','Maharashtra','Delhi','Gujarat','Rajasthan','West Bengal','Others'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="co-section">
            <div className="co-section-head">
              <span className="co-section-icon">💳</span>
              <span className="co-section-title">Payment Method</span>
            </div>
            <div className="co-section-body">
              <div className="pay-options">
                {[
                  { val: 'COD', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when your order arrives at your door', badge: 'available', badgeText: 'Available' },
                  { val: 'UPI', icon: '📱', label: 'UPI / Google Pay / PhonePe', sub: 'Pay instantly with any UPI app', badge: 'soon', badgeText: 'Coming Soon', disabled: true },
                  { val: 'CARD', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay accepted', badge: 'soon', badgeText: 'Coming Soon', disabled: true },
                ].map(p => (
                  <div
                    key={p.val}
                    className={`pay-option ${form.paymentMethod === p.val ? 'selected' : ''} ${p.disabled ? 'disabled' : ''}`}
                    onClick={() => !p.disabled && setForm(f => ({ ...f, paymentMethod: p.val }))}
                  >
                    <div className="pay-radio">
                      <div className="pay-radio-dot" />
                    </div>
                    <span className="pay-icon">{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="pay-label">{p.label}</div>
                      <div className="pay-sub">{p.sub}</div>
                    </div>
                    <span className={`pay-badge ${p.badge}`}>{p.badgeText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div className="os-card">
          <div className="os-head">
            <h3>Order Summary</h3>
            <p>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>

          <div className="os-items">
            {cart.map(item => (
              <div className="os-item" key={item.id}>
                <img src={item.imageUrl} alt={item.name} className="os-item-img" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="os-item-name">{item.name}</div>
                  <div className="os-item-qty">Qty: {item.qty}</div>
                </div>
                <div className="os-item-price">₹{item.price * item.qty}</div>
              </div>
            ))}
          </div>

          <div className="os-totals">
            {delivery === 0 && (
              <div className="delivery-notice">🎉 You've unlocked FREE delivery!</div>
            )}
            <div className="os-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="os-row">
              <span>Delivery</span>
              <span className={delivery === 0 ? 'free' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            <div className="os-row total">
              <span>Total</span>
              <span className="val">₹{total}</span>
            </div>
          </div>

          <div className="os-cta">
            <button
              className={`place-btn ${loading ? 'loading' : ''}`}
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
            >
              {loading ? '⏳ Placing Order...' : '🎉 Place Order →'}
            </button>
            <div className="os-secure">🔒 Safe & secure checkout · COD available</div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toastType}`}>{toast}</div>}
    </>
  )
}
