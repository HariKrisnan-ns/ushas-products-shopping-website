'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

// Status → step index mapping
const STATUS_STEPS = {
  processing: 0,
  confirmed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
}

const TIMELINE_STEPS = [
  {
    key: 'processing',
    icon: '📋',
    label: 'Order Placed',
    desc: 'Your order has been received and is being processed.',
  },
  {
    key: 'confirmed',
    icon: '✅',
    label: 'Order Confirmed',
    desc: 'We have confirmed your order and started preparing it.',
  },
  {
    key: 'shipped',
    icon: '📦',
    label: 'Shipped',
    desc: 'Your package has been handed over to our delivery partner.',
  },
  {
    key: 'out_for_delivery',
    icon: '🚚',
    label: 'Out for Delivery',
    desc: 'Your order is on its way — should arrive today!',
  },
  {
    key: 'delivered',
    icon: '🎉',
    label: 'Delivered',
    desc: 'Your order has been delivered successfully. Enjoy!',
  },
]

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { isSignedIn } = useUser()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return }
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // Find by order id OR orderNumber (slug can be either)
        const found = data.find(o =>
          String(o.id) === String(id) || o.orderNumber === id
        )
        if (!found) setError('Order not found')
        else setOrder(found)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load order'); setLoading(false) })
  }, [isSignedIn, id])

  const currentStep = order ? (STATUS_STEPS[order.status] ?? 0) : 0
  const isCancelled = order?.status === 'cancelled'

  const statusStyle = (status) => {
    if (status === 'delivered') return { bg: 'var(--green-pl)', color: 'var(--green-m)' }
    if (status === 'processing') return { bg: 'var(--gold-pl)', color: 'var(--gold)' }
    if (status === 'confirmed') return { bg: '#DBEAFE', color: '#1D4ED8' }
    if (status === 'shipped') return { bg: '#EDE9FE', color: '#6D28D9' }
    if (status === 'out_for_delivery') return { bg: '#FFF7ED', color: '#C2410C' }
    if (status === 'cancelled') return { bg: '#FADBD8', color: 'var(--red)' }
    return { bg: 'var(--cream3)', color: 'var(--brown-lt)' }
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
        .ot-header {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:56px 80px; position:relative; overflow:hidden;
        }
        .ot-header::before {
          content:'🚚'; position:absolute; right:60px; top:50%;
          transform:translateY(-50%); font-size:160px; opacity:0.05;
          pointer-events:none;
        }
        .ot-header::after {
          content:''; position:absolute; inset:0; opacity:0.03;
          background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
          background-size:28px 28px; pointer-events:none;
        }
        .ot-header-inner { position:relative; z-index:1; }
        .ot-breadcrumb {
          display:flex; align-items:center; gap:6px;
          font-size:12.5px; color:rgba(255,255,255,0.4); font-weight:600; margin-bottom:16px;
        }
        .ot-breadcrumb a { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
        .ot-breadcrumb a:hover { color:var(--gold-lt); }
        .ot-breadcrumb span { color:rgba(255,255,255,0.25); }
        .ot-header h1 {
          font-family:'Tiro Malayalam',serif; font-size:46px; color:#fff;
          margin-bottom:8px; line-height:1.1;
        }
        .ot-header h1 em { color:var(--gold-lt); font-style:normal; }
        .ot-header p { font-size:14.5px; color:rgba(255,255,255,0.6); }

        /* ── MAIN LAYOUT ── */
        .ot-layout {
          max-width:920px; margin:0 auto;
          padding:52px 80px;
          display:flex; flex-direction:column; gap:24px;
        }

        /* ── CARD ── */
        .ot-card {
          background:#fff; border-radius:20px; border:1px solid var(--border);
          overflow:hidden; box-shadow:0 4px 20px var(--shadow);
        }
        .ot-card-head {
          padding:20px 28px; background:var(--cream2);
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .ot-card-title {
          display:flex; align-items:center; gap:10px;
          font-family:'Tiro Malayalam',serif; font-size:20px; color:var(--text);
        }
        .ot-card-title span { font-size:20px; }
        .ot-card-body { padding:28px; }

        /* ── ORDER META ── */
        .ot-meta-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:20px;
        }
        .ot-meta-item {}
        .ot-meta-label {
          font-size:11px; font-weight:800; letter-spacing:0.1em;
          text-transform:uppercase; color:var(--muted); margin-bottom:5px;
        }
        .ot-meta-value {
          font-size:15px; font-weight:800; color:var(--text);
        }
        .ot-meta-value.gold { color:var(--gold); font-family:'Tiro Malayalam',serif; font-size:18px; }
        .ot-status-badge {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; font-weight:800; padding:5px 14px; border-radius:20px;
        }

        /* ── TIMELINE ── */
        .ot-timeline {
          display:flex; flex-direction:column; gap:0;
          position:relative;
        }
        .ot-timeline-step {
          display:flex; gap:20px; align-items:flex-start;
          position:relative;
        }

        /* Vertical connector line */
        .ot-timeline-step:not(:last-child) .ot-step-line-wrap {
          position:absolute; left:21px; top:44px;
          width:2px; height:calc(100% - 16px);
          display:flex; flex-direction:column;
        }
        .ot-step-line-fill {
          flex:1; border-radius:2px;
          transition:background 0.5s ease;
        }

        .ot-step-icon-col {
          display:flex; flex-direction:column; align-items:center;
          flex-shrink:0; z-index:1;
        }
        .ot-step-icon {
          width:44px; height:44px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:20px;
          border:2px solid var(--border);
          transition:all 0.4s ease;
          flex-shrink:0;
        }
        .ot-step-icon.done {
          background:linear-gradient(135deg, var(--green-m), var(--green));
          border-color:var(--green-m);
          box-shadow:0 4px 16px rgba(45,90,39,0.3);
        }
        .ot-step-icon.active {
          background:linear-gradient(135deg, var(--gold-lt), var(--gold));
          border-color:var(--gold);
          box-shadow:0 4px 16px rgba(200,121,10,0.35);
          animation:pulse 1.8s ease-in-out infinite;
        }
        .ot-step-icon.pending {
          background:var(--cream2); border-color:var(--border);
          filter:grayscale(0.5); opacity:0.5;
        }
        .ot-step-icon.cancelled {
          background:#FADBD8; border-color:var(--red);
        }
        @keyframes pulse {
          0%,100% { box-shadow:0 4px 16px rgba(200,121,10,0.35); }
          50% { box-shadow:0 4px 28px rgba(200,121,10,0.6), 0 0 0 6px rgba(200,121,10,0.1); }
        }

        .ot-step-body { flex:1; padding-bottom:32px; }
        .ot-timeline-step:last-child .ot-step-body { padding-bottom:0; }

        .ot-step-label {
          font-size:15px; font-weight:800; color:var(--text); margin-bottom:3px;
        }
        .ot-step-label.pending { color:var(--muted); font-weight:600; }
        .ot-step-desc {
          font-size:13px; color:var(--muted); line-height:1.6;
        }
        .ot-step-time {
          font-size:11.5px; color:var(--green-m); font-weight:700; margin-top:4px;
        }

        /* ── CANCELLED BANNER ── */
        .ot-cancelled-banner {
          background:#FADBD8; border:1.5px solid var(--red);
          border-radius:14px; padding:20px 24px;
          display:flex; align-items:center; gap:16px;
        }
        .ot-cancelled-icon { font-size:36px; }
        .ot-cancelled-title { font-size:16px; font-weight:800; color:var(--red); margin-bottom:4px; }
        .ot-cancelled-sub { font-size:13.5px; color:var(--muted); }

        /* ── ORDER ITEMS ── */
        .ot-items-list { display:flex; flex-direction:column; gap:14px; }
        .ot-item {
          display:flex; gap:16px; align-items:center;
          padding:16px; border-radius:14px;
          border:1px solid var(--border);
          transition:background 0.15s;
        }
        .ot-item:hover { background:var(--cream); }
        .ot-item-img {
          width:68px; height:68px; object-fit:cover;
          border-radius:10px; border:1px solid var(--border); flex-shrink:0;
        }
        .ot-item-info { flex:1; }
        .ot-item-name { font-size:14.5px; font-weight:800; color:var(--text); margin-bottom:4px; }
        .ot-item-meta { font-size:12.5px; color:var(--muted); }
        .ot-item-price {
          font-size:17px; font-weight:900; color:var(--gold);
          font-family:'Tiro Malayalam',serif; flex-shrink:0;
        }

        /* ── ADDRESS ── */
        .ot-address-box {
          background:var(--cream); border-radius:12px; padding:18px 20px;
          border:1px solid var(--border);
        }
        .ot-address-name { font-size:15px; font-weight:800; color:var(--text); margin-bottom:4px; }
        .ot-address-line { font-size:13.5px; color:var(--muted); line-height:1.7; }
        .ot-address-phone { font-size:13px; color:var(--green-m); font-weight:700; margin-top:6px; }

        /* ── TOTALS ── */
        .ot-totals { display:flex; flex-direction:column; gap:0; }
        .ot-total-row {
          display:flex; justify-content:space-between;
          padding:10px 0; font-size:14px; color:var(--muted);
          border-bottom:1px dashed var(--border);
        }
        .ot-total-row:last-child { border-bottom:none; }
        .ot-total-row.grand {
          font-size:17px; font-weight:900; color:var(--text);
          border-top:2px solid var(--border); padding-top:14px;
          margin-top:4px;
        }
        .ot-total-row.grand .val { color:var(--gold); font-family:'Tiro Malayalam',serif; font-size:20px; }
        .ot-total-row .free { color:var(--green-m); font-weight:800; }

        /* ── ACTIONS ── */
        .ot-actions {
          display:flex; gap:14px; flex-wrap:wrap;
        }
        .ot-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 24px; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; text-decoration:none;
          transition:transform 0.15s, box-shadow 0.2s;
        }
        .ot-btn:hover { transform:translateY(-2px); }
        .ot-btn.primary {
          background:linear-gradient(135deg, var(--green-m), var(--green));
          color:#fff; border:none;
          box-shadow:0 4px 16px rgba(45,90,39,0.25);
        }
        .ot-btn.primary:hover { box-shadow:0 6px 24px rgba(45,90,39,0.35); }
        .ot-btn.outline {
          background:transparent; color:var(--text);
          border:1.5px solid var(--border);
        }
        .ot-btn.outline:hover { border-color:var(--green-m); color:var(--green-m); background:var(--green-pl); }

        /* ── LOADING / ERROR / NOT SIGNED IN ── */
        .ot-state {
          min-height:60vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:80px 24px;
        }
        .ot-state-icon { font-size:64px; margin-bottom:20px; }
        .ot-state h2 { font-family:'Tiro Malayalam',serif; font-size:32px; margin-bottom:12px; color:var(--text); }
        .ot-state p { font-size:15px; color:var(--muted); margin-bottom:28px; max-width:360px; line-height:1.75; }
        .ot-spinner {
          width:44px; height:44px; border-radius:50%;
          border:3px solid var(--green-pl); border-top-color:var(--green-m);
          animation:spin 0.8s linear infinite; margin-bottom:20px;
        }
        @keyframes spin { to { transform:rotate(360deg) } }

        /* ── RESPONSIVE ── */
        @media(max-width:1200px) { .ot-header{padding:48px 48px;} .ot-layout{padding:44px 48px;} }
        @media(max-width:768px) {
          .ot-header{padding:36px 24px;} .ot-header h1{font-size:34px;}
          .ot-layout{padding:32px 24px;}
          .ot-meta-grid{grid-template-columns:1fr 1fr; gap:16px;}
        }
        @media(max-width:480px) {
          .ot-header{padding:28px 16px;} .ot-header h1{font-size:26px;}
          .ot-layout{padding:20px 12px;}
          .ot-meta-grid{grid-template-columns:1fr 1fr;}
          .ot-card-body{padding:18px 16px;}
          .ot-actions{flex-direction:column;}
          .ot-btn{width:100%;justify-content:center;}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="ot-header">
        <div className="ot-header-inner">
          <div className="ot-breadcrumb">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/profile">My Account</Link><span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Track Order</span>
          </div>
          <h1>Track Your <em>Order</em></h1>
          <p>Real-time status of your Ushas Products order.</p>
        </div>
      </div>

      {/* ── STATES ── */}
      {!isSignedIn && (
        <div className="ot-state">
          <div className="ot-state-icon">🔒</div>
          <h2>Sign In Required</h2>
          <p>Please sign in to track your orders.</p>
          <Link href="/sign-in" className="ot-btn primary">Sign In →</Link>
        </div>
      )}

      {isSignedIn && loading && (
        <div className="ot-state">
          <div className="ot-spinner" />
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading your order…</p>
        </div>
      )}

      {isSignedIn && !loading && error && (
        <div className="ot-state">
          <div className="ot-state-icon">📦</div>
          <h2>Order Not Found</h2>
          <p>We couldn't find this order. It may belong to a different account.</p>
          <Link href="/profile" className="ot-btn primary">← Back to Profile</Link>
        </div>
      )}

      {/* ── ORDER CONTENT ── */}
      {isSignedIn && !loading && order && (
        <div className="ot-layout">

          {/* Order Meta */}
          <div className="ot-card">
            <div className="ot-card-head">
              <div className="ot-card-title">
                <span>📋</span>
                {order.orderNumber}
              </div>
              <span
                className="ot-status-badge"
                style={{ background: statusStyle(order.status).bg, color: statusStyle(order.status).color }}
              >
                {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            <div className="ot-card-body">
              <div className="ot-meta-grid">
                <div className="ot-meta-item">
                  <div className="ot-meta-label">Order Date</div>
                  <div className="ot-meta-value">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="ot-meta-item">
                  <div className="ot-meta-label">Payment</div>
                  <div className="ot-meta-value">{order.paymentMethod || 'COD'}</div>
                </div>
                <div className="ot-meta-item">
                  <div className="ot-meta-label">Items</div>
                  <div className="ot-meta-value">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="ot-meta-item">
                  <div className="ot-meta-label">Order Total</div>
                  <div className="ot-meta-value gold">₹{order.total}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="ot-card">
            <div className="ot-card-head">
              <div className="ot-card-title"><span>🗺️</span> Order Timeline</div>
            </div>
            <div className="ot-card-body">
              {isCancelled ? (
                <div className="ot-cancelled-banner">
                  <div className="ot-cancelled-icon">❌</div>
                  <div>
                    <div className="ot-cancelled-title">Order Cancelled</div>
                    <div className="ot-cancelled-sub">
                      This order has been cancelled. If you paid online, a refund will be processed within 5–7 business days.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ot-timeline">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone = idx < currentStep
                    const isActive = idx === currentStep
                    const isPending = idx > currentStep
                    const stepClass = isDone ? 'done' : isActive ? 'active' : 'pending'

                    return (
                      <div className="ot-timeline-step" key={step.key}>
                        {/* Vertical line connector */}
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div className="ot-step-line-wrap">
                            <div
                              className="ot-step-line-fill"
                              style={{
                                background: isDone
                                  ? 'linear-gradient(180deg, var(--green-m), var(--green-lt))'
                                  : 'var(--cream3)'
                              }}
                            />
                          </div>
                        )}

                        {/* Icon */}
                        <div className="ot-step-icon-col">
                          <div className={`ot-step-icon ${stepClass}`}>
                            {isDone ? '✓' : step.icon}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="ot-step-body">
                          <div className={`ot-step-label ${isPending ? 'pending' : ''}`}>
                            {step.label}
                          </div>
                          <div className="ot-step-desc">{step.desc}</div>
                          {(isDone || isActive) && (
                            <div className="ot-step-time">
                              {isActive
                                ? '⏳ In progress…'
                                : `✓ Completed · ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Two-column row: Items + Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Order Items */}
            <div className="ot-card">
              <div className="ot-card-head">
                <div className="ot-card-title"><span>🛍️</span> Items Ordered</div>
              </div>
              <div className="ot-card-body">
                {order.items?.length > 0 ? (
                  <div className="ot-items-list">
                    {order.items.map((item, i) => (
                      <div className="ot-item" key={i}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="ot-item-img" />
                        )}
                        <div className="ot-item-info">
                          <div className="ot-item-name">{item.name || 'Product'}</div>
                          <div className="ot-item-meta">Qty: {item.quantity} · ₹{item.price} each</div>
                        </div>
                        <div className="ot-item-price">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>No items found.</p>
                )}

                {/* Totals */}
                <div className="ot-totals" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div className="ot-total-row">
                    <span>Subtotal</span><span>₹{order.subtotal}</span>
                  </div>
                  <div className="ot-total-row">
                    <span>Delivery</span>
                    <span className={order.deliveryFee === 0 ? 'free' : ''}>
                      {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                    </span>
                  </div>
                  <div className="ot-total-row grand">
                    <span>Total</span>
                    <span className="val">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address + Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="ot-card" style={{ flex: 1 }}>
                <div className="ot-card-head">
                  <div className="ot-card-title"><span>📍</span> Delivery Address</div>
                </div>
                <div className="ot-card-body">
                  {order.addressId ? (
                    <AddressBlock orderId={order.addressId} />
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>No address on record.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="ot-card">
                <div className="ot-card-head">
                  <div className="ot-card-title"><span>⚡</span> Quick Actions</div>
                </div>
                <div className="ot-card-body">
                  <div className="ot-actions">
                    <Link href="/shop" className="ot-btn primary">🛍️ Shop Again</Link>
                    <Link href="/profile" className="ot-btn outline">← All Orders</Link>
                  </div>
                  {order.status === 'processing' && (
                    <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                      Need to cancel? Contact us at <strong>hello@ushasproducts.com</strong> before the order is shipped.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  )
}

// Address loader sub-component
function AddressBlock({ orderId }) {
  const [address, setAddress] = useState(null)
  useEffect(() => {
    fetch('/api/addresses')
      .then(r => r.json())
      .then(data => {
        const found = data.find(a => a.id === orderId)
        setAddress(found || null)
      })
      .catch(() => {})
  }, [orderId])

  if (!address) return (
    <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Loading address…</p>
  )

  return (
    <div className="ot-address-box">
      <div className="ot-address-name">{address.name}</div>
      <div className="ot-address-line">
        {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
        {address.city}, {address.state} — {address.pincode}
      </div>
      <div className="ot-address-phone">📞 {address.phone}</div>
    </div>
  )
}
