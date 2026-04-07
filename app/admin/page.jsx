'use client'
import { CATEGORIES } from '@/lib/categories'
import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import ImageUploader from '@/components/ImageUploader'

export default function AdminPage() {
  const { isSignedIn, user } = useUser()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orderFilter, setOrderFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [productForm, setProductForm] = useState({ name: '', slug: '', category: 'Snacks', price: '', mrp: '', description: '', imageUrl: '', weight: '', shelfLife: '', tag: '', badge: '', inStock: true })
  const [editingProduct, setEditingProduct] = useState(null)
  const [extraImages, setExtraImages] = useState([]) // extra images for current product
  const [loadingImages, setLoadingImages] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ message: '', color: '#3A6B35', isActive: true })
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [popupForm, setPopupForm] = useState({ title: '', message: '', isActive: false })
  const [editingPopup, setEditingPopup] = useState(null)
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '', isActive: true })
  const [editingBanner, setEditingBanner] = useState(null)
  const [siteImageForm, setSiteImageForm] = useState({ key: 'hero', imageUrl: '', label: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin')
    if (res.status === 401) { setUnauthorized(true); setLoading(false); return }
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { if (isSignedIn) fetchData() }, [isSignedIn])

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.price) { showToast('❌ Name and price are required', 'error'); return }
    const slug = productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-')
    const body = { ...productForm, slug, price: parseInt(productForm.price), mrp: parseInt(productForm.mrp) || parseInt(productForm.price) }
    if (editingProduct) {
      await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingProduct.id, ...body }) })
      showToast('✅ Product updated!')
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      showToast('✅ Product added!')
    }
    setProductForm({ name: '', slug: '', category: 'Snacks', price: '', mrp: '', description: '', imageUrl: '', weight: '', shelfLife: '', tag: '', badge: '', inStock: true })
    setEditingProduct(null)
    setExtraImages([])
    fetchData()
  }

  const handleEditProduct = (p) => {
    setEditingProduct(p)
    setProductForm({ name: p.name, slug: p.slug, category: p.category, price: p.price, mrp: p.mrp, description: p.description || '', imageUrl: p.imageUrl || '', weight: p.weight || '', shelfLife: p.shelfLife || '', tag: p.tag || '', badge: p.badge || '', inStock: p.inStock })
    setActiveTab('products')
    fetchExtraImages(p.id)
    window.scrollTo(0, 0)
  }

  const fetchExtraImages = async (productId) => {
    setLoadingImages(true)
    const res = await fetch(`/api/admin/product-images?productId=${productId}`)
    const imgs = await res.json()
    setExtraImages(imgs)
    setLoadingImages(false)
  }

  const addExtraImage = async (url) => {
    if (!editingProduct) return
    const res = await fetch('/api/admin/product-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: editingProduct.id, imageUrl: url, position: extraImages.length })
    })
    const img = await res.json()
    setExtraImages(prev => [...prev, img])
    showToast('🖼️ Image added!')
  }

  const removeExtraImage = async (id) => {
    await fetch('/api/admin/product-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setExtraImages(prev => prev.filter(i => i.id !== id))
    showToast('🗑️ Image removed!')
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    showToast('🗑️ Product deleted!')
    fetchData()
  }

  const handleToggleStock = async (p) => {
    await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, inStock: !p.inStock }) })
    showToast(`✅ ${p.name} marked as ${!p.inStock ? 'In Stock' : 'Out of Stock'}`)
    fetchData()
  }

  const handleContent = async (type, method, formData, id = null) => {
    const url = '/api/admin/content'
    const body = method === 'DELETE' ? { type, id } : method === 'PUT' ? { type, id, data: formData } : { type, data: formData }
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok || json?.error) {
        showToast(`❌ Error: ${json?.error || 'Something went wrong'}`, 'error')
        return
      }
      showToast(method === 'DELETE' ? '🗑️ Deleted!' : '✅ Saved!')
    } catch (e) {
      showToast('❌ Network error, please try again', 'error')
      return
    }
    fetchData()
  }

  const handleAnnouncementSubmit = async () => {
    if (!announcementForm.message) { showToast('❌ Message is required', 'error'); return }
    if (editingAnnouncement) {
      await handleContent('announcement', 'PUT', announcementForm, editingAnnouncement.id)
      setEditingAnnouncement(null); showToast('✅ Announcement updated!')
    } else {
      await handleContent('announcement', 'POST', announcementForm)
      showToast('✅ Announcement posted!')
    }
    setAnnouncementForm({ message: '', color: '#3A6B35', isActive: true })
  }

  const handleEditAnnouncement = (a) => {
    setEditingAnnouncement(a)
    setAnnouncementForm({ message: a.message, color: a.color || '#3A6B35', isActive: a.isActive })
    window.scrollTo(0, 0)
  }

  const handlePopupSubmit = async () => {
    if (!popupForm.title || !popupForm.message) { showToast('❌ Title and message are required', 'error'); return }
    if (editingPopup) {
      await handleContent('popup', 'PUT', popupForm, editingPopup.id)
      setEditingPopup(null); showToast('✅ Popup updated!')
    } else {
      await handleContent('popup', 'POST', popupForm)
      showToast('✅ Popup created!')
    }
    setPopupForm({ title: '', message: '', isActive: false })
  }

  const handleEditPopup = (p) => {
    setEditingPopup(p)
    setPopupForm({ title: p.title, message: p.message, isActive: p.isActive })
    window.scrollTo(0, 0)
  }

  const handleBannerSubmit = async () => {
    if (!bannerForm.title) { showToast('❌ Title is required', 'error'); return }
    if (editingBanner) {
      await handleContent('banner', 'PUT', bannerForm, editingBanner.id)
      setEditingBanner(null); showToast('✅ Banner updated!')
    } else {
      await handleContent('banner', 'POST', bannerForm)
      showToast('✅ Banner created!')
    }
    setBannerForm({ title: '', subtitle: '', imageUrl: '', isActive: true })
  }

  const handleEditBanner = (b) => {
    setEditingBanner(b)
    setBannerForm({ title: b.title, subtitle: b.subtitle || '', imageUrl: b.imageUrl || '', isActive: b.isActive })
    window.scrollTo(0, 0)
  }

  const handleOrderStatus = async (orderId, status) => {
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: orderId, status }) })
    showToast('✅ Order status updated!')
    fetchData()
  }

  const statusColor = (s) => {
    if (s === 'delivered') return { bg: '#D6EDD4', color: '#2D5A27' }
    if (s === 'processing') return { bg: '#FDE8A8', color: '#C8790A' }
    if (s === 'confirmed') return { bg: '#DBEAFE', color: '#1D4ED8' }
    if (s === 'shipped') return { bg: '#EDE9FE', color: '#6D28D9' }
    if (s === 'out_for_delivery') return { bg: '#FFF7ED', color: '#C2410C' }
    if (s === 'cancelled') return { bg: '#FADBD8', color: '#C0392B' }
    return { bg: '#EDE0C4', color: '#6B3F1A' }
  }

  /* ── GATE SCREENS ── */
  if (!isSignedIn) return (
    <>
      <style>{baseStyles}</style>
      <div className="gate-screen">
        <div className="gate-icon">🔒</div>
        <div className="gate-kicker">Admin Access</div>
        <h2 className="gate-title">Sign In Required</h2>
        <p className="gate-sub">Please sign in to access the admin panel.</p>
        <Link href="/sign-in" className="gate-btn">Sign In →</Link>
      </div>
    </>
  )

  if (unauthorized) return (
    <>
      <style>{baseStyles}</style>
      <div className="gate-screen">
        <div className="gate-icon">🚫</div>
        <div className="gate-kicker" style={{ background: '#FADBD8', color: '#C0392B' }}>Access Denied</div>
        <h2 className="gate-title">Unauthorized</h2>
        <p className="gate-sub">You don't have admin privileges for this store.</p>
        <Link href="/" className="gate-btn">← Back to Home</Link>
      </div>
    </>
  )

  if (loading) return (
    <>
      <style>{baseStyles}</style>
      <div className="gate-screen">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌿</div>
        <p style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 600 }}>Loading admin panel…</p>
        <div className="loading-bar"><div className="loading-fill" /></div>
      </div>
    </>
  )

  const navSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'products', icon: '🛍️', label: 'Products' },
        { id: 'orders', icon: '📦', label: 'Orders' },
        { id: 'users', icon: '👥', label: 'Users' },
      ]
    },
    {
      title: 'Content',
      items: [
        { id: 'announcements', icon: '📢', label: 'Announcements' },
        { id: 'popups', icon: '🔔', label: 'Popups' },
        { id: 'banners', icon: '🎨', label: 'Sale Banners' },
        { id: 'featured', icon: '⭐', label: 'Featured' },
        { id: 'images', icon: '🖼️', label: 'Site Images' },
      ]
    }
  ]

  return (
    <>
      <style>{`${baseStyles}${adminStyles}`}</style>

      <div className={`ad-shell ${sidebarCollapsed ? 'collapsed' : ''}`}>

        {/* ══════════════════════════════════
            SIDEBAR
        ══════════════════════════════════ */}
        <aside className="ad-sidebar">
          {/* Brand */}
          <div className="ad-brand">
            <div className="ad-brand-logo">ഉഷ</div>
            {!sidebarCollapsed && (
              <div className="ad-brand-text">
                <div className="ad-brand-name">Ushas Admin</div>
                <div className="ad-brand-sub">Management Panel</div>
              </div>
            )}
            <button className="ad-collapse-btn" onClick={() => setSidebarCollapsed(v => !v)}>
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* User pill */}
          {!sidebarCollapsed && (
            <div className="ad-user-pill">
              <div className="ad-user-avatar">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="ad-user-info">
                <div className="ad-user-name">{user?.firstName} {user?.lastName}</div>
                <div className="ad-user-role">Administrator</div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="ad-nav">
            {navSections.map(section => (
              <div key={section.title} className="ad-nav-section">
                {!sidebarCollapsed && <div className="ad-nav-section-title">{section.title}</div>}
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className={`ad-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <span className="ad-nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && <span className="ad-nav-label">{item.label}</span>}
                    {!sidebarCollapsed && activeTab === item.id && <span className="ad-nav-active-dot" />}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="ad-sidebar-foot">
            <Link href="/" className="ad-view-site">
              <span>🌿</span>
              {!sidebarCollapsed && <span>View Website</span>}
            </Link>
            <SignOutButton redirectUrl="/">
              <button className="ad-signout">
                <span>🚪</span>
                {!sidebarCollapsed && <span>Sign Out</span>}
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* ══════════════════════════════════
            MAIN
        ══════════════════════════════════ */}
        <main className="ad-main">

          {/* Top bar */}
          <div className="ad-topbar">
            <div className="ad-topbar-left">
              <div className="ad-page-path">
                <span style={{ color: 'var(--muted)' }}>Admin</span>
                <span className="ad-path-sep">›</span>
                <span>{navSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Dashboard'}</span>
              </div>
            </div>
            <div className="ad-topbar-right">
              <div className="ad-topbar-time">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="ad-topbar-avatar">{user?.firstName?.[0] || 'A'}</div>
            </div>
          </div>

          {/* ══ DASHBOARD ══ */}
          {activeTab === 'dashboard' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Dashboard</h1>
                <p className="ad-page-sub">Welcome back! Here's what's happening with Ushas Products today.</p>
              </div>

              {/* Stats */}
              <div className="ad-stats-grid">
                {[
                  { label: 'Total Products', value: data?.stats?.totalProducts ?? '—', icon: '🛍️', accent: 'green', trend: '+3 this week' },
                  { label: 'Total Orders', value: data?.stats?.totalOrders ?? '—', icon: '📦', accent: 'gold', trend: '+12 today' },
                  { label: 'Total Users', value: data?.stats?.totalUsers ?? '—', icon: '👥', accent: 'blue', trend: '+5 this week' },
                  { label: 'Revenue', value: `₹${(data?.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: '💰', accent: 'brown', trend: 'All time' },
                ].map(s => (
                  <div key={s.label} className={`ad-stat-card accent-${s.accent}`}>
                    <div className="ad-stat-icon">{s.icon}</div>
                    <div className="ad-stat-body">
                      <div className="ad-stat-label">{s.label}</div>
                      <div className="ad-stat-value">{s.value}</div>
                      <div className="ad-stat-trend">{s.trend}</div>
                    </div>
                    <div className="ad-stat-bar" />
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">Recent Orders</div>
                  <button className="ad-card-action" onClick={() => setActiveTab('orders')}>View All →</button>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Order #</th><th>User</th><th>Total</th><th>Status</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.orders?.slice(0, 5).map(o => {
                        const sc = statusColor(o.status)
                        return (
                          <tr key={o.id}>
                            <td><span className="ad-mono">{o.orderNumber}</span></td>
                            <td><span className="ad-muted">{o.userId?.slice(0, 14)}…</span></td>
                            <td><span className="ad-price">₹{o.total}</span></td>
                            <td><span className="ad-badge" style={{ background: sc.bg, color: sc.color }}>{o.status}</span></td>
                            <td><span className="ad-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Out of stock */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">⚠️ Out of Stock</div>
                </div>
                {data?.products?.filter(p => !p.inStock).length === 0 ? (
                  <div className="ad-empty-inline">✅ All products are currently in stock</div>
                ) : (
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Action</th></tr></thead>
                      <tbody>
                        {data?.products?.filter(p => !p.inStock).map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700 }}>{p.name}</td>
                            <td><span className="ad-muted">{p.category}</span></td>
                            <td><span className="ad-price">₹{p.price}</span></td>
                            <td><button className="ad-btn-sm green" onClick={() => handleToggleStock(p)}>Mark In Stock</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {activeTab === 'products' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">{editingProduct ? '✏️ Edit Product' : '➕ Add Product'}</h1>
                <p className="ad-page-sub">{editingProduct ? `Editing: ${editingProduct.name}` : 'Add a new product to the Ushas store'}</p>
              </div>

              {/* Form card */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">{editingProduct ? 'Update Product Details' : 'New Product'}</div>
                  {editingProduct && (
                    <button className="ad-editing-pill">Editing mode</button>
                  )}
                </div>

                {editingProduct && (
                  <div className="ad-edit-banner">
                    ✏️ You are editing <strong>{editingProduct.name}</strong> — make your changes below and click Update.
                    <button className="ad-btn-sm outline" style={{ marginLeft: 'auto' }} onClick={() => { setEditingProduct(null); setProductForm({ name: '', slug: '', category: 'Snacks', price: '', mrp: '', description: '', imageUrl: '', weight: '', shelfLife: '', tag: '', badge: '', inStock: true }) }}>Cancel Edit</button>
                  </div>
                )}

                <div className="ad-form-body">
                  <div className="ad-form-grid">
                    <div className="ad-fg"><label>Product Name <span className="req">*</span></label><input placeholder="Banana Chips" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="ad-fg"><label>Slug (URL)</label><input placeholder="banana-chips" value={productForm.slug} onChange={e => setProductForm(f => ({ ...f, slug: e.target.value }))} /></div>
                    <div className="ad-fg">
                      <label>Category</label>
                      <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}                      </select>
                    </div>
                    <div className="ad-fg">
                      <label>Tag</label>
                      <select value={productForm.tag} onChange={e => setProductForm(f => ({ ...f, tag: e.target.value }))}>
                        <option value="">None</option>
                        {['Traditional', 'Organic', 'Health'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="ad-fg"><label>Price (₹) <span className="req">*</span></label><input type="number" placeholder="120" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} /></div>
                    <div className="ad-fg"><label>MRP (₹)</label><input type="number" placeholder="150" value={productForm.mrp} onChange={e => setProductForm(f => ({ ...f, mrp: e.target.value }))} /></div>
                    <div className="ad-fg"><label>Weight</label><input placeholder="200g" value={productForm.weight} onChange={e => setProductForm(f => ({ ...f, weight: e.target.value }))} /></div>
                    <div className="ad-fg"><label>Shelf Life</label><input placeholder="6 months" value={productForm.shelfLife} onChange={e => setProductForm(f => ({ ...f, shelfLife: e.target.value }))} /></div>
                    <div className="ad-fg">
                      <label>Badge</label>
                      <select value={productForm.badge} onChange={e => setProductForm(f => ({ ...f, badge: e.target.value }))}>
                        <option value="">None</option>
                        {['Bestseller', 'New', 'Organic', 'Sale'].map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="ad-fg">
                      <label>Stock Status</label>
                      <div className="ad-toggle-row">
                        <label className="ad-toggle">
                          <input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm(f => ({ ...f, inStock: e.target.checked }))} />
                          <span className="ad-toggle-track"><span className="ad-toggle-thumb" /></span>
                        </label>
                        <span className={`ad-toggle-label ${productForm.inStock ? 'green' : 'red'}`}>
                          {productForm.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ad-fg wide">
                    <label>Description</label>
                    <textarea placeholder="Product description…" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  <div className="ad-fg wide">
                    <ImageUploader
                      label="Main Product Image (used as thumbnail in shop)"
                      aspectHint="1:1 square"
                      value={productForm.imageUrl}
                      onChange={url => setProductForm(f => ({ ...f, imageUrl: url }))}
                    />
                  </div>

                  {/* ✅ Extra images — only show when editing an existing product */}
                  {editingProduct && (
                    <div className="ad-fg wide">
                      <label style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 10, display: 'block' }}>
                        🖼️ Extra Product Images
                        <span style={{ fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>
                          (shown in gallery on product page — images won't be cropped)
                        </span>
                      </label>

                      {/* Existing extra images */}
                      {loadingImages ? (
                        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading images…</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                          {extraImages.map(img => (
                            <div key={img.id} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--border)', background: '#fff' }}>
                              <img src={img.imageUrl} alt="product" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                              <button
                                onClick={() => removeExtraImage(img.id)}
                                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#C0392B', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, lineHeight: 1 }}
                                title="Remove image"
                              >×</button>
                            </div>
                          ))}
                          {extraImages.length === 0 && (
                            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0' }}>No extra images yet. Upload one below.</div>
                          )}
                        </div>
                      )}

                      {/* Upload new extra image */}
                      <ImageUploader
                        label="Upload Extra Image"
                        aspectHint="any ratio"
                        value=""
                        onChange={url => addExtraImage(url)}
                      />
                    </div>
                  )}
                  {!editingProduct && (
                    <div className="ad-fg wide">
                      <div style={{ background: 'var(--cream2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                        💡 <strong>Tip:</strong> Save the product first, then edit it to add extra gallery images.
                      </div>
                    </div>
                  )}

                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={handleProductSubmit}>
                      {editingProduct ? '💾 Update Product' : '➕ Add Product'}
                    </button>
                    {editingProduct && (
                      <button className="ad-btn outline" onClick={() => { setEditingProduct(null); setProductForm({ name: '', slug: '', category: 'Snacks', price: '', mrp: '', description: '', imageUrl: '', weight: '', shelfLife: '', tag: '', badge: '', inStock: true }) }}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Products list */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">All Products</div>
                  <span className="ad-card-count">{data?.products?.length} items</span>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {data?.products?.map(p => (
                        <tr key={p.id}>
                          <td><img src={p.imageUrl} alt={p.name} className="ad-thumb" /></td>
                          <td><span style={{ fontWeight: 700 }}>{p.name}</span></td>
                          <td><span className="ad-muted">{p.category}</span></td>
                          <td><span className="ad-price">₹{p.price}</span></td>
                          <td><span className={`ad-stock-badge ${p.inStock ? 'in' : 'out'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
                          <td>
                            <div className="ad-actions-row">
                              <button className="ad-btn-sm outline" onClick={() => handleEditProduct(p)}>✏️ Edit</button>
                              <button className="ad-btn-sm outline" onClick={() => handleToggleStock(p)}>{p.inStock ? '⛔ Stock Off' : '✅ Stock On'}</button>
                              <button className="ad-btn-sm red" onClick={() => handleDeleteProduct(p.id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {activeTab === 'orders' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">All Orders</h1>
                <p className="ad-page-sub">Manage orders, view delivery details and update shipping status.</p>
              </div>

              {/* ── STATUS FILTER TABS ── */}
              <div className="ord-filter-bar">
                {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => {
                  const count = s === 'all'
                    ? data?.orders?.length
                    : data?.orders?.filter(o => o.status === s).length
                  return (
                    <button
                      key={s}
                      className={`ord-filter-btn ${orderFilter === s ? 'active' : ''}`}
                      onClick={() => setOrderFilter(s)}
                    >
                      <span className="ord-filter-label">
                        {s === 'all' ? '📋 All' : s === 'processing' ? '⏳ Processing' : s === 'shipped' ? '🚚 Shipped' : s === 'delivered' ? '✅ Delivered' : '❌ Cancelled'}
                      </span>
                      <span className="ord-filter-count">{count ?? 0}</span>
                    </button>
                  )
                })}
              </div>

              {/* ── ORDER CARDS ── */}
              <div className="ord-list">
                {(data?.orders ?? [])
                  .filter(o => orderFilter === 'all' || o.status === orderFilter)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(order => {
                    const sc = statusColor(order.status)
                    const isExpanded = expandedOrder === order.id
                    return (
                      <div key={order.id} className={`ord-card ${isExpanded ? 'expanded' : ''}`}>

                        {/* ── CARD HEADER ── */}
                        <div className="ord-card-head" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                          <div className="ord-card-head-left">
                            <div className="ord-number">{order.orderNumber}</div>
                            <div className="ord-meta">
                              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="ord-dot">·</span>
                              <span>{order.paymentMethod}</span>
                              <span className="ord-dot">·</span>
                              <span className="ord-price">₹{order.total}</span>
                            </div>
                          </div>
                          <div className="ord-card-head-right">
                            <span className="ad-badge" style={{ background: sc.bg, color: sc.color }}>{order.status}</span>
                            <span className="ord-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {/* ── EXPANDED DETAILS ── */}
                        {isExpanded && (
                          <div className="ord-card-body">

                            {/* Two column layout: customer + address */}
                            <div className="ord-detail-grid">

                              {/* Customer Info */}
                              <div className="ord-detail-section">
                                <div className="ord-detail-title">👤 Customer</div>
                                {order.user ? (
                                  <>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Name</span>
                                      <span className="ord-detail-val">{order.user.firstName} {order.user.lastName}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Email</span>
                                      <span className="ord-detail-val">{order.user.email}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Phone</span>
                                      <span className="ord-detail-val">{order.user.phone || '—'}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="ord-detail-empty">No user info available</div>
                                )}
                              </div>

                              {/* Delivery Address */}
                              <div className="ord-detail-section">
                                <div className="ord-detail-title">📍 Delivery Address</div>
                                {order.address ? (
                                  <>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Name</span>
                                      <span className="ord-detail-val">{order.address.name}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Phone</span>
                                      <span className="ord-detail-val">{order.address.phone}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Address</span>
                                      <span className="ord-detail-val">
                                        {order.address.line1}
                                        {order.address.line2 ? `, ${order.address.line2}` : ''}
                                      </span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">City</span>
                                      <span className="ord-detail-val">{order.address.city}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">State</span>
                                      <span className="ord-detail-val">{order.address.state}</span>
                                    </div>
                                    <div className="ord-detail-row">
                                      <span className="ord-detail-label">Pincode</span>
                                      <span className="ord-detail-val">{order.address.pincode}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="ord-detail-empty">No delivery address saved</div>
                                )}
                              </div>
                            </div>

                            {/* Order Items */}
                            {order.items?.length > 0 && (
                              <div className="ord-items-section">
                                <div className="ord-detail-title">🛍️ Items Ordered</div>
                                <div className="ord-items-list">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="ord-item-row">
                                      {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.name} className="ord-item-img" />
                                      )}
                                      <div className="ord-item-info">
                                        <div className="ord-item-name">{item.name}</div>
                                        <div className="ord-item-qty">Qty: {item.quantity}</div>
                                      </div>
                                      <div className="ord-item-price">₹{item.price * item.quantity}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Order total breakdown */}
                                <div className="ord-total-breakdown">
                                  <div className="ord-total-row">
                                    <span>Subtotal</span><span>₹{order.subtotal}</span>
                                  </div>
                                  <div className="ord-total-row">
                                    <span>Delivery</span><span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'Free'}</span>
                                  </div>
                                  <div className="ord-total-row total">
                                    <span>Total</span><span>₹{order.total}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {order.notes && (
                              <div className="ord-notes">
                                <span className="ord-notes-label">📝 Note:</span> {order.notes}
                              </div>
                            )}

                            {/* Status updater */}
                            <div className="ord-status-bar">
                              <span className="ord-status-label">Update Status:</span>
                              <div className="ord-status-btns">
                                {[
                                  ['processing', '⏳', 'Processing'],
                                  ['confirmed', '✅', 'Confirmed'],
                                  ['shipped', '📦', 'Shipped'],
                                  ['out_for_delivery', '🚚', 'Out for Delivery'],
                                  ['delivered', '🎉', 'Delivered'],
                                  ['cancelled', '❌', 'Cancelled'],
                                ].map(([s, icon, label]) => (
                                  <button
                                    key={s}
                                    className={`ord-status-btn ${order.status === s ? 'active' : ''}`}
                                    style={order.status === s ? { background: statusColor(s).bg, color: statusColor(s).color, borderColor: statusColor(s).color } : {}}
                                    onClick={() => handleOrderStatus(order.id, s)}
                                  >
                                    {icon} {label}
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    )
                  })}

                {/* Empty state */}
                {(data?.orders ?? []).filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && (
                  <div className="ad-empty-inline">
                    No {orderFilter === 'all' ? '' : orderFilter} orders found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {activeTab === 'users' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">All Users</h1>
                <p className="ad-page-sub">Manage user accounts and admin privileges</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">Users</div>
                  <span className="ad-card-count">{data?.users?.length} registered</span>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                    <tbody>
                      {data?.users?.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</td>
                          <td><span className="ad-muted">{u.email}</span></td>
                          <td><span className="ad-muted">{u.phone || '—'}</span></td>
                          <td><span className={`ad-role-badge ${u.isAdmin ? 'admin' : 'user'}`}>{u.isAdmin ? '👑 Admin' : 'User'}</span></td>
                          <td><span className="ad-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ ANNOUNCEMENTS ══ */}
          {activeTab === 'announcements' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Announcement Bar</h1>
                <p className="ad-page-sub">Show a message at the top of the home page</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">{editingAnnouncement ? '✏️ Edit Announcement' : '📢 New Announcement'}</div>
                  {editingAnnouncement && <button className="ad-editing-pill">Editing mode</button>}
                </div>
                {editingAnnouncement && (
                  <div className="ad-edit-banner">
                    ✏️ Editing announcement — make changes and click Update.
                    <button className="ad-btn-sm outline" style={{ marginLeft: 'auto' }} onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ message: '', color: '#3A6B35', isActive: true }) }}>Cancel Edit</button>
                  </div>
                )}
                <div className="ad-form-body">
                  <div className="ad-form-grid">
                    <div className="ad-fg wide"><label>Message</label><input placeholder="🎉 New product launched! Free delivery this week." value={announcementForm.message} onChange={e => setAnnouncementForm(f => ({ ...f, message: e.target.value }))} /></div>
                    <div className="ad-fg"><label>Bar Color</label><input type="color" value={announcementForm.color} onChange={e => setAnnouncementForm(f => ({ ...f, color: e.target.value }))} style={{ height: '44px', cursor: 'pointer', padding: '4px' }} /></div>
                    <div className="ad-fg">
                      <label>Visibility</label>
                      <div className="ad-toggle-row">
                        <label className="ad-toggle">
                          <input type="checkbox" checked={announcementForm.isActive} onChange={e => setAnnouncementForm(f => ({ ...f, isActive: e.target.checked }))} />
                          <span className="ad-toggle-track"><span className="ad-toggle-thumb" /></span>
                        </label>
                        <span className={`ad-toggle-label ${announcementForm.isActive ? 'green' : 'red'}`}>{announcementForm.isActive ? 'Visible on site' : 'Hidden'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={handleAnnouncementSubmit}>{editingAnnouncement ? '💾 Update' : '📢 Post'}</button>
                    {editingAnnouncement && <button className="ad-btn outline" onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ message: '', color: '#3A6B35', isActive: true }) }}>Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">All Announcements</div></div>
                {!data?.announcements?.length ? <div className="ad-empty-inline">No announcements yet.</div> : (
                  <div className="ad-content-list">
                    {data.announcements.map(a => (
                      <div key={a.id} className={`ad-content-item ${editingAnnouncement?.id === a.id ? 'editing' : ''}`}>
                        <div className="ad-content-item-left">
                          <div className="ad-content-color-dot" style={{ background: a.color }} />
                          <div>
                            <div className="ad-content-item-title">{a.message}</div>
                            <span className={`ad-pill ${a.isActive ? 'green' : 'red'}`}>{a.isActive ? 'Active' : 'Hidden'}</span>
                          </div>
                        </div>
                        <div className="ad-content-item-actions">
                          <button className="ad-btn-sm outline" onClick={() => handleEditAnnouncement(a)}>✏️ Edit</button>
                          <button className="ad-btn-sm outline" onClick={() => handleContent('announcement', 'PUT', { isActive: !a.isActive }, a.id)}>{a.isActive ? 'Hide' : 'Show'}</button>
                          <button className="ad-btn-sm red" onClick={() => handleContent('announcement', 'DELETE', null, a.id)}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ POPUPS ══ */}
          {activeTab === 'popups' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Popup Notifications</h1>
                <p className="ad-page-sub">Show a popup to visitors when they open the home page</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">{editingPopup ? '✏️ Edit Popup' : '🔔 Create Popup'}</div>
                  {editingPopup && <button className="ad-editing-pill">Editing mode</button>}
                </div>
                {editingPopup && (
                  <div className="ad-edit-banner">✏️ Editing popup — make your changes and click Update.
                    <button className="ad-btn-sm outline" style={{ marginLeft: 'auto' }} onClick={() => { setEditingPopup(null); setPopupForm({ title: '', message: '', isActive: false }) }}>Cancel Edit</button>
                  </div>
                )}
                <div className="ad-form-body">
                  <div className="ad-fg wide"><label>Popup Title</label><input placeholder="🎉 New Arrival!" value={popupForm.title} onChange={e => setPopupForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div className="ad-fg wide" style={{ marginTop: '14px' }}><label>Message</label><textarea placeholder="Check out our new Turmeric Latte Mix — now available!" value={popupForm.message} onChange={e => setPopupForm(f => ({ ...f, message: e.target.value }))} /></div>
                  <div className="ad-toggle-row" style={{ marginTop: '14px' }}>
                    <label className="ad-toggle"><input type="checkbox" checked={popupForm.isActive} onChange={e => setPopupForm(f => ({ ...f, isActive: e.target.checked }))} /><span className="ad-toggle-track"><span className="ad-toggle-thumb" /></span></label>
                    <span className={`ad-toggle-label ${popupForm.isActive ? 'green' : 'red'}`}>Show on website immediately</span>
                  </div>
                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={handlePopupSubmit}>{editingPopup ? '💾 Update Popup' : '🔔 Create Popup'}</button>
                    {editingPopup && <button className="ad-btn outline" onClick={() => { setEditingPopup(null); setPopupForm({ title: '', message: '', isActive: false }) }}>Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">All Popups</div></div>
                {!data?.popups?.length ? <div className="ad-empty-inline">No popups created yet.</div> : (
                  <div className="ad-content-list">
                    {data.popups.map(p => (
                      <div key={p.id} className={`ad-content-item ${editingPopup?.id === p.id ? 'editing' : ''}`}>
                        <div className="ad-content-item-left">
                          <div>
                            <div className="ad-content-item-title">{p.title}</div>
                            <div className="ad-content-item-sub">{p.message}</div>
                            <span className={`ad-pill ${p.isActive ? 'green' : 'red'}`}>{p.isActive ? 'Active' : 'Hidden'}</span>
                          </div>
                        </div>
                        <div className="ad-content-item-actions">
                          <button className="ad-btn-sm outline" onClick={() => handleEditPopup(p)}>✏️ Edit</button>
                          <button className="ad-btn-sm outline" onClick={() => handleContent('popup', 'PUT', { isActive: !p.isActive }, p.id)}>{p.isActive ? 'Hide' : 'Show'}</button>
                          <button className="ad-btn-sm red" onClick={() => handleContent('popup', 'DELETE', null, p.id)}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ BANNERS ══ */}
          {activeTab === 'banners' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Sale Banners</h1>
                <p className="ad-page-sub">Create promotional banners for the home page</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">{editingBanner ? '✏️ Edit Banner' : '🎨 Create Banner'}</div>
                  {editingBanner && <button className="ad-editing-pill">Editing mode</button>}
                </div>
                {editingBanner && (
                  <div className="ad-edit-banner">✏️ Editing banner — make your changes and click Update.
                    <button className="ad-btn-sm outline" style={{ marginLeft: 'auto' }} onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', imageUrl: '', isActive: true }) }}>Cancel Edit</button>
                  </div>
                )}
                <div className="ad-form-body">
                  <div className="ad-form-grid">
                    <div className="ad-fg"><label>Banner Title</label><input placeholder="🔥 Onam Sale — 20% Off!" value={bannerForm.title} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} /></div>
                    <div className="ad-fg"><label>Subtitle</label><input placeholder="Use code ONAM20 at checkout" value={bannerForm.subtitle} onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} /></div>
                  </div>
                  <div className="ad-fg wide" style={{ marginTop: '14px' }}>
                    <ImageUploader
                      label="Banner Image"
                      aspectHint="16:9 landscape"
                      value={bannerForm.imageUrl}
                      onChange={url => setBannerForm(f => ({ ...f, imageUrl: url }))}
                    />
                  </div>
                  <div className="ad-toggle-row" style={{ marginTop: '14px' }}>
                    <label className="ad-toggle"><input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm(f => ({ ...f, isActive: e.target.checked }))} /><span className="ad-toggle-track"><span className="ad-toggle-thumb" /></span></label>
                    <span className={`ad-toggle-label ${bannerForm.isActive ? 'green' : 'red'}`}>Show on website</span>
                  </div>
                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={handleBannerSubmit}>{editingBanner ? '💾 Update Banner' : '🎨 Create Banner'}</button>
                    {editingBanner && <button className="ad-btn outline" onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', imageUrl: '', isActive: true }) }}>Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">All Banners</div></div>
                {!data?.banners?.length ? <div className="ad-empty-inline">No banners created yet.</div> : (
                  <div className="ad-content-list">
                    {data.banners.map(b => (
                      <div key={b.id} className={`ad-content-item ${editingBanner?.id === b.id ? 'editing' : ''}`}>
                        <div className="ad-content-item-left">
                          {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="ad-content-thumb" />}
                          <div>
                            <div className="ad-content-item-title">{b.title}</div>
                            <div className="ad-content-item-sub">{b.subtitle}</div>
                            <span className={`ad-pill ${b.isActive ? 'green' : 'red'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
                          </div>
                        </div>
                        <div className="ad-content-item-actions">
                          <button className="ad-btn-sm outline" onClick={() => handleEditBanner(b)}>✏️ Edit</button>
                          <button className="ad-btn-sm outline" onClick={() => handleContent('banner', 'PUT', { isActive: !b.isActive }, b.id)}>{b.isActive ? 'Hide' : 'Show'}</button>
                          <button className="ad-btn-sm red" onClick={() => handleContent('banner', 'DELETE', null, b.id)}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ FEATURED ══ */}
          {activeTab === 'featured' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Featured Products</h1>
                <p className="ad-page-sub">Choose products for the "Customer Favourites" section on the home page</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">⭐ Add to Featured</div></div>
                <div className="ad-form-body">
                  <div className="ad-fg wide">
                    <label>Select Product</label>
                    <select id="featured-select">
                      {data?.products?.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
                    </select>
                  </div>
                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={() => {
                      const sel = document.getElementById('featured-select')
                      handleContent('featured', 'POST', { productId: parseInt(sel.value), position: data?.featured?.length || 0 })
                    }}>⭐ Add to Featured</button>
                  </div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">Current Featured</div>
                  <span className="ad-card-count">{data?.featured?.length} products</span>
                </div>
                {!data?.featured?.length ? <div className="ad-empty-inline">No featured products selected.</div> : (
                  <div className="ad-featured-list">
                    {data.featured.map(f => {
                      const product = data.products?.find(p => p.id === f.productId)
                      return (
                        <div key={f.id} className="ad-featured-item">
                          {product?.imageUrl && <img src={product.imageUrl} alt={product.name} className="ad-featured-thumb" />}
                          <div className="ad-featured-info">
                            <div className="ad-featured-name">{product?.name || `Product #${f.productId}`}</div>
                            <div className="ad-featured-price">₹{product?.price}</div>
                          </div>
                          <button className="ad-btn-sm red" onClick={() => handleContent('featured', 'DELETE', null, f.id)}>Remove</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SITE IMAGES ══ */}
          {activeTab === 'images' && (
            <div className="ad-content">
              <div className="ad-page-header">
                <h1 className="ad-page-title">Site Images</h1>
                <p className="ad-page-sub">Update the navbar logo, hero banners, about page images, and team photos</p>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">🖼️ Update Image</div></div>
                <div className="ad-form-body">
                  <div className="ad-fg wide">
                    <label>Select Image to Update</label>
                    <div className="ad-chip-group">
                      {[
                        { key: 'navbar_logo', label: '🏷️ Navbar Logo' },
                        { key: 'hero', label: '🏠 Hero' },
                        { key: 'about_hero', label: '📖 About Hero' },
                        { key: 'about_story', label: '📸 Our Story' },
                        { key: 'team_1', label: '👤 Team 1' },
                        { key: 'team_2', label: '👤 Team 2' },
                        { key: 'team_3', label: '👤 Team 3' },
                      ].map(item => (
                        <div key={item.key} className={`ad-chip ${siteImageForm.key === item.key ? 'active' : ''}`} onClick={() => setSiteImageForm(f => ({ ...f, key: item.key, label: item.label }))}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ad-fg wide" style={{ marginTop: '16px' }}>
                    <ImageUploader
                      label="Upload New Image"
                      aspectHint="varies by section"
                      value={siteImageForm.imageUrl}
                      onChange={url => setSiteImageForm(f => ({ ...f, imageUrl: url }))}
                    />
                  </div>
                  <div className="ad-form-actions">
                    <button className="ad-btn green" onClick={async () => {
                      if (!siteImageForm.imageUrl) {
                        showToast('❌ Please upload an image first', 'error'); return
                      }
                      await handleContent('siteImage', 'POST', { key: siteImageForm.key, imageUrl: siteImageForm.imageUrl, label: siteImageForm.label })
                      setSiteImageForm(f => ({ ...f, imageUrl: '' }))
                    }}>🖼️ Update Image</button>
                  </div>
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-head"><div className="ad-card-title">Current Site Images</div></div>
                {!data?.siteImages?.length ? <div className="ad-empty-inline">No custom images set. Default images are being used.</div> : (
                  <div className="ad-img-grid">
                    {data.siteImages.map(img => (
                      <div key={img.id} className="ad-img-card">
                        <img src={img.imageUrl} alt={img.key} />
                        <div className="ad-img-card-info">
                          <div className="ad-img-card-label">{img.label || img.key}</div>
                          <div className="ad-img-card-date">Updated {new Date(img.updatedAt).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`ad-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </>
  )
}

/* ─────────────────────────────────────────
   BASE STYLES (gate screens, loading)
───────────────────────────────────────── */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --cream:#FDFAF3; --cream2:#F4EDD8; --cream3:#EDE0C4;
    --gold:#C8790A; --gold-lt:#F0B429; --gold-pl:#FDE8A8;
    --green:#2D5A27; --green-m:#3A6B35; --green-lt:#5A9E52; --green-pl:#D6EDD4;
    --red:#C0392B; --brown:#4A2810; --brown-lt:#6B3F1A;
    --text:#1E120A; --muted:#7A5C3A; --border:rgba(92,51,23,0.12);
    --shadow:rgba(30,18,10,0.08);
    --sidebar-w:256px; --sidebar-w-sm:68px;
  }
  body { font-family:'Nunito',sans-serif; background:var(--cream); color:var(--text); }
  .gate-screen {
    min-height:100vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    text-align:center; padding:40px 24px;
    background:var(--cream);
  }
  .gate-icon { font-size:56px; margin-bottom:16px; }
  .gate-kicker {
    display:inline-flex; align-items:center;
    background:var(--green-pl); color:var(--green-m);
    font-size:11px; font-weight:800; letter-spacing:0.18em;
    text-transform:uppercase; padding:5px 16px; border-radius:40px; margin-bottom:14px;
  }
  .gate-title { font-family:'Tiro Malayalam',serif; font-size:36px; color:var(--text); margin-bottom:12px; }
  .gate-sub { font-size:15px; color:var(--muted); margin-bottom:28px; max-width:360px; line-height:1.75; }
  .gate-btn {
    display:inline-block; padding:14px 32px;
    background:linear-gradient(135deg, var(--green-m), var(--green));
    color:#fff; border-radius:12px; text-decoration:none;
    font-size:15px; font-weight:900;
    box-shadow:0 4px 20px rgba(45,90,39,0.3);
  }
  .loading-bar {
    width:200px; height:4px; background:var(--cream3);
    border-radius:4px; overflow:hidden; margin-top:24px;
  }
  .loading-fill {
    height:100%; width:40%; background:linear-gradient(90deg, var(--green-m), var(--gold-lt));
    border-radius:4px; animation:loadSlide 1.2s ease-in-out infinite;
  }
  @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
`

/* ─────────────────────────────────────────
   ADMIN PANEL STYLES
───────────────────────────────────────── */
const adminStyles = `
  /* ── SHELL ── */
  .ad-shell {
    display:grid;
    grid-template-columns:var(--sidebar-w) 1fr;
    min-height:100vh;
    background:#F0EAE0;
    transition:grid-template-columns 0.3s ease;
  }
  .ad-shell.collapsed { grid-template-columns:var(--sidebar-w-sm) 1fr; }

  /* ── SIDEBAR ── */
  .ad-sidebar {
    background:linear-gradient(180deg, #1a3d17 0%, #2D5A27 40%, #4A2810 100%);
    position:sticky; top:0; height:100vh;
    display:flex; flex-direction:column;
    overflow:hidden; transition:width 0.3s ease;
    border-right:1px solid rgba(255,255,255,0.04);
  }

  /* Brand */
  .ad-brand {
    display:flex; align-items:center; gap:12px;
    padding:20px 16px 16px;
    border-bottom:1px solid rgba(255,255,255,0.07);
    min-height:72px;
  }
  .ad-brand-logo {
    width:40px; height:40px; border-radius:12px;
    background:linear-gradient(135deg, var(--gold-lt), var(--gold));
    display:flex; align-items:center; justify-content:center;
    font-family:'Tiro Malayalam',serif; font-size:18px;
    color:var(--brown); font-weight:700; flex-shrink:0;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
  }
  .ad-brand-name { font-family:'Tiro Malayalam',serif; font-size:17px; color:#fff; line-height:1.2; }
  .ad-brand-sub { font-size:10px; color:rgba(255,255,255,0.4); letter-spacing:0.12em; text-transform:uppercase; }
  .ad-collapse-btn {
    margin-left:auto; width:28px; height:28px; border-radius:8px;
    background:rgba(255,255,255,0.07); border:none; color:rgba(255,255,255,0.5);
    cursor:pointer; font-size:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    transition:background 0.2s;
  }
  .ad-collapse-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }

  /* User pill */
  .ad-user-pill {
    display:flex; align-items:center; gap:10px;
    margin:12px 12px 4px; padding:10px 12px;
    background:rgba(255,255,255,0.06); border-radius:12px;
    border:1px solid rgba(255,255,255,0.07);
  }
  .ad-user-avatar {
    width:32px; height:32px; border-radius:50%;
    background:linear-gradient(135deg, var(--gold-lt), var(--gold));
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:900; color:var(--brown); flex-shrink:0;
  }
  .ad-user-name { font-size:13px; font-weight:700; color:#fff; }
  .ad-user-role { font-size:10px; color:rgba(255,255,255,0.4); letter-spacing:0.08em; }

  /* Nav */
  .ad-nav { flex:1; overflow-y:auto; padding:8px 12px; scrollbar-width:none; }
  .ad-nav::-webkit-scrollbar { display:none; }
  .ad-nav-section { margin-bottom:4px; }
  .ad-nav-section-title {
    font-size:9.5px; letter-spacing:0.2em; text-transform:uppercase;
    color:rgba(255,255,255,0.3); font-weight:800;
    padding:10px 8px 6px;
  }
  .ad-nav-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 10px; border-radius:10px;
    font-size:13.5px; color:rgba(255,255,255,0.6);
    cursor:pointer; transition:all 0.18s;
    margin-bottom:2px; border:none; background:transparent;
    width:100%; text-align:left; font-family:'Nunito',sans-serif;
    position:relative;
  }
  .ad-nav-item:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .ad-nav-item.active {
    background:linear-gradient(135deg, rgba(240,180,41,0.2), rgba(200,121,10,0.15));
    color:var(--gold-lt); font-weight:800;
    border:1px solid rgba(240,180,41,0.2);
  }
  .ad-nav-icon { font-size:16px; flex-shrink:0; width:20px; text-align:center; }
  .ad-nav-label { flex:1; }
  .ad-nav-active-dot {
    width:6px; height:6px; border-radius:50%; background:var(--gold-lt);
    flex-shrink:0;
  }

  /* Sidebar foot */
  .ad-sidebar-foot {
    padding:12px; border-top:1px solid rgba(255,255,255,0.07);
    display:flex; flex-direction:column; gap:6px;
  }
  .ad-view-site, .ad-signout {
    display:flex; align-items:center; gap:10px;
    padding:10px 10px; border-radius:10px;
    font-size:13px; font-weight:700; cursor:pointer;
    transition:background 0.18s; text-decoration:none;
    border:none; width:100%; font-family:'Nunito',sans-serif;
  }
  .ad-view-site { color:rgba(255,255,255,0.6); background:transparent; }
  .ad-view-site:hover { background:rgba(255,255,255,0.08); color:#fff; }
  .ad-signout { color:rgba(255,100,80,0.8); background:transparent; }
  .ad-signout:hover { background:rgba(192,57,43,0.15); color:#ff8070; }

  /* ── MAIN ── */
  .ad-main { display:flex; flex-direction:column; min-height:100vh; overflow:hidden; }

  /* Top bar */
  .ad-topbar {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 36px; background:var(--cream);
    border-bottom:1px solid var(--border);
    position:sticky; top:0; z-index:50;
    backdrop-filter:blur(8px);
  }
  .ad-page-path { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:var(--text); }
  .ad-path-sep { color:var(--muted); font-size:12px; }
  .ad-topbar-right { display:flex; align-items:center; gap:12px; }
  .ad-topbar-time { font-size:12.5px; color:var(--muted); font-weight:600; }
  .ad-topbar-avatar {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg, var(--gold-lt), var(--gold));
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:900; color:var(--brown);
  }

  /* Content area */
  .ad-content { padding:32px 36px; flex:1; }
  .ad-page-header { margin-bottom:28px; }
  .ad-page-title { font-family:'Tiro Malayalam',serif; font-size:32px; color:var(--text); margin-bottom:6px; }
  .ad-page-sub { font-size:14px; color:var(--muted); line-height:1.7; }

  /* ── STAT CARDS ── */
  .ad-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:28px; }
  .ad-stat-card {
    background:#fff; border-radius:16px; padding:24px 22px;
    border:1px solid var(--border); position:relative; overflow:hidden;
    display:flex; align-items:flex-start; gap:16px;
    transition:box-shadow 0.2s, transform 0.2s;
  }
  .ad-stat-card:hover { box-shadow:0 8px 28px var(--shadow); transform:translateY(-2px); }
  .ad-stat-icon { font-size:28px; flex-shrink:0; }
  .ad-stat-body { flex:1; }
  .ad-stat-label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:6px; }
  .ad-stat-value { font-family:'Tiro Malayalam',serif; font-size:30px; line-height:1; color:var(--text); margin-bottom:6px; }
  .ad-stat-trend { font-size:11px; font-weight:700; color:var(--green-m); }
  .ad-stat-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }
  .accent-green .ad-stat-bar { background:linear-gradient(90deg, var(--green-m), var(--green-lt)); }
  .accent-gold .ad-stat-bar { background:linear-gradient(90deg, var(--gold), var(--gold-lt)); }
  .accent-blue .ad-stat-bar { background:linear-gradient(90deg, #2563EB, #60A5FA); }
  .accent-brown .ad-stat-bar { background:linear-gradient(90deg, var(--brown), var(--brown-lt)); }

  /* ── CARDS ── */
  .ad-card {
    background:#fff; border-radius:16px; border:1px solid var(--border);
    margin-bottom:24px; overflow:hidden;
  }
  .ad-card-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; background:var(--cream2);
    border-bottom:1px solid var(--border);
  }
  .ad-card-title { font-family:'Tiro Malayalam',serif; font-size:20px; color:var(--text); }
  .ad-card-action { font-size:13px; color:var(--green-m); font-weight:800; background:none; border:none; cursor:pointer; font-family:'Nunito',sans-serif; }
  .ad-card-action:hover { text-decoration:underline; }
  .ad-card-count { font-size:12px; font-weight:700; background:var(--green-pl); color:var(--green-m); padding:3px 10px; border-radius:20px; }

  /* ── EDIT BANNER ── */
  .ad-edit-banner {
    display:flex; align-items:center; gap:12px; flex-wrap:wrap;
    padding:14px 24px; background:var(--gold-pl);
    border-bottom:1px solid rgba(200,121,10,0.2);
    font-size:13.5px; font-weight:600; color:var(--brown-lt);
  }
  .ad-editing-pill {
    padding:4px 12px; background:var(--gold-pl); color:var(--gold);
    border:1px solid rgba(200,121,10,0.3); border-radius:20px;
    font-size:11px; font-weight:800; letter-spacing:0.06em;
    font-family:'Nunito',sans-serif; cursor:default;
  }

  /* ── FORM ── */
  .ad-form-body { padding:24px; }
  .ad-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:0; }
  .ad-fg { display:flex; flex-direction:column; gap:6px; }
  .ad-fg.wide { grid-column:1/-1; }
  .ad-fg label { font-size:11.5px; font-weight:800; letter-spacing:0.07em; text-transform:uppercase; color:var(--muted); }
  .ad-fg label .req { color:var(--red); }
  .ad-fg input, .ad-fg select, .ad-fg textarea {
    padding:11px 14px; border-radius:10px;
    border:1.5px solid var(--border); background:var(--cream);
    font-family:'Nunito',sans-serif; font-size:14px; color:var(--text);
    outline:none; font-weight:500;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .ad-fg input:focus, .ad-fg select:focus, .ad-fg textarea:focus {
    border-color:var(--green-m);
    box-shadow:0 0 0 3px rgba(45,90,39,0.08);
    background:#fff;
  }
  .ad-fg textarea { resize:vertical; min-height:88px; }
  .ad-form-actions { display:flex; gap:12px; margin-top:20px; }

  /* ── TOGGLE ── */
  .ad-toggle-row { display:flex; align-items:center; gap:12px; margin-top:4px; }
  .ad-toggle { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
  .ad-toggle input { opacity:0; width:0; height:0; position:absolute; }
  .ad-toggle-track {
    position:absolute; inset:0; background:var(--cream3);
    border-radius:24px; cursor:pointer; transition:background 0.25s;
    border:1.5px solid var(--border);
  }
  .ad-toggle input:checked ~ .ad-toggle-track { background:var(--green-m); border-color:var(--green-m); }
  .ad-toggle-thumb {
    position:absolute; width:17px; height:17px; border-radius:50%;
    background:#fff; top:2px; left:2px;
    transition:transform 0.25s; box-shadow:0 1px 4px rgba(0,0,0,0.15);
  }
  .ad-toggle input:checked ~ .ad-toggle-track .ad-toggle-thumb { transform:translateX(20px); }
  .ad-toggle-label { font-size:13.5px; font-weight:700; }
  .ad-toggle-label.green { color:var(--green-m); }
  .ad-toggle-label.red { color:var(--red); }

  /* ── BUTTONS ── */
  .ad-btn {
    padding:11px 24px; border-radius:10px;
    font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
    cursor:pointer; transition:all 0.18s; border:none; display:inline-flex; align-items:center; gap:8px;
  }
  .ad-btn.green {
    background:linear-gradient(135deg, var(--green-m), var(--green));
    color:#fff; box-shadow:0 4px 16px rgba(45,90,39,0.25);
  }
  .ad-btn.green:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(45,90,39,0.35); }
  .ad-btn.outline {
    background:transparent; color:var(--text);
    border:1.5px solid var(--border);
  }
  .ad-btn.outline:hover { border-color:var(--green-m); color:var(--green-m); background:var(--green-pl); }

  .ad-btn-sm {
    padding:6px 14px; border-radius:8px;
    font-family:'Nunito',sans-serif; font-size:12.5px; font-weight:700;
    cursor:pointer; transition:all 0.15s; border:none;
    display:inline-flex; align-items:center; gap:6px;
    white-space:nowrap;
  }
  .ad-btn-sm.green { background:var(--green-m); color:#fff; }
  .ad-btn-sm.green:hover { background:var(--green); }
  .ad-btn-sm.outline { background:transparent; color:var(--text); border:1.5px solid var(--border); }
  .ad-btn-sm.outline:hover { border-color:var(--green-m); color:var(--green-m); background:var(--green-pl); }
  .ad-btn-sm.red { background:transparent; color:var(--red); border:1.5px solid rgba(192,57,43,0.35); }
  .ad-btn-sm.red:hover { background:var(--red); color:#fff; border-color:var(--red); }

  /* ── TABLE ── */
  .ad-table-wrap { overflow-x:auto; padding:0 0 4px; }
  .ad-table { width:100%; border-collapse:collapse; }
  .ad-table th {
    text-align:left; padding:12px 20px;
    font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase;
    color:var(--muted); background:var(--cream);
    border-bottom:2px solid var(--border);
  }
  .ad-table td { padding:14px 20px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .ad-table tr:last-child td { border-bottom:none; }
  .ad-table tbody tr { transition:background 0.12s; }
  .ad-table tbody tr:hover td { background:var(--cream); }
  .ad-mono { font-family:'Tiro Malayalam',serif; font-size:14px; font-weight:600; }
  .ad-muted { color:var(--muted); font-size:13px; }
  .ad-price { font-size:16px; font-weight:900; color:var(--gold); font-family:'Tiro Malayalam',serif; }
  .ad-badge { font-size:11.5px; font-weight:800; padding:4px 12px; border-radius:20px; display:inline-block; }
  .ad-stock-badge { font-size:11.5px; font-weight:800; padding:4px 12px; border-radius:20px; display:inline-block; }
  .ad-stock-badge.in { background:var(--green-pl); color:var(--green-m); }
  .ad-stock-badge.out { background:#FADBD8; color:var(--red); }
  .ad-role-badge { font-size:11.5px; font-weight:800; padding:4px 12px; border-radius:20px; display:inline-block; }
  .ad-role-badge.admin { background:var(--gold-pl); color:var(--gold); }
  .ad-role-badge.user { background:var(--cream2); color:var(--muted); }
  .ad-thumb { width:48px; height:48px; border-radius:10px; object-fit:cover; border:1px solid var(--border); }
  .ad-actions-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .ad-status-select {
    padding:7px 12px; border-radius:8px; border:1.5px solid var(--border);
    font-family:'Nunito',sans-serif; font-size:12.5px; font-weight:600;
    color:var(--text); background:#fff; outline:none; cursor:pointer;
    transition:border-color 0.2s;
  }
  .ad-status-select:focus { border-color:var(--green-m); }

  /* ── CONTENT ITEMS ── */
  .ad-content-list { padding:16px 20px; display:flex; flex-direction:column; gap:10px; }
  .ad-content-item {
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
    padding:16px 18px; background:var(--cream); border-radius:12px;
    border:1.5px solid var(--border);
    transition:border-color 0.2s;
  }
  .ad-content-item.editing { border-color:var(--gold); background:var(--gold-pl); }
  .ad-content-item-left { display:flex; gap:12px; align-items:flex-start; flex:1; }
  .ad-content-color-dot { width:16px; height:16px; border-radius:50%; flex-shrink:0; margin-top:3px; border:2px solid rgba(255,255,255,0.5); box-shadow:0 1px 4px rgba(0,0,0,0.12); }
  .ad-content-item-title { font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; }
  .ad-content-item-sub { font-size:12.5px; color:var(--muted); margin-bottom:6px; line-height:1.5; }
  .ad-content-item-actions { display:flex; gap:8px; align-items:center; flex-shrink:0; flex-wrap:wrap; }
  .ad-content-thumb { width:52px; height:52px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1px solid var(--border); }

  /* Pills */
  .ad-pill { font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; display:inline-block; margin-top:4px; }
  .ad-pill.green { background:var(--green-pl); color:var(--green-m); }
  .ad-pill.red { background:#FADBD8; color:var(--red); }

  /* ── FEATURED ── */
  .ad-featured-list { padding:16px 20px; display:flex; flex-direction:column; gap:10px; }
  .ad-featured-item {
    display:flex; align-items:center; gap:14px;
    padding:12px 16px; background:var(--cream); border-radius:12px;
    border:1px solid var(--border);
  }
  .ad-featured-thumb { width:48px; height:48px; border-radius:10px; object-fit:cover; border:1px solid var(--border); flex-shrink:0; }
  .ad-featured-info { flex:1; }
  .ad-featured-name { font-size:14px; font-weight:800; color:var(--text); }
  .ad-featured-price { font-size:13px; font-weight:700; color:var(--gold); }

  /* ── SITE IMAGES ── */
  .ad-img-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:20px; }
  .ad-img-card { background:var(--cream2); border-radius:12px; overflow:hidden; border:1px solid var(--border); }
  .ad-img-card img { width:100%; height:120px; object-fit:cover; }
  .ad-img-card-info { padding:12px; }
  .ad-img-card-label { font-size:12.5px; font-weight:800; color:var(--green-m); margin-bottom:3px; }
  .ad-img-card-date { font-size:11px; color:var(--muted); }

  /* Image preview */
  .ad-img-preview-wrap { margin-top:10px; border-radius:10px; overflow:hidden; border:1px solid var(--border); max-width:360px; }
  .ad-img-preview { width:100%; height:160px; object-fit:cover; display:block; }

  /* Chip group */
  .ad-chip-group { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
  .ad-chip {
    padding:7px 16px; border-radius:20px; border:1.5px solid var(--border);
    font-size:12.5px; font-weight:700; cursor:pointer; transition:all 0.15s;
    background:#fff; color:var(--text);
  }
  .ad-chip:hover { border-color:var(--green-m); color:var(--green-m); }
  .ad-chip.active { border-color:var(--green-m); background:var(--green-pl); color:var(--green-m); }

  /* Empty inline */
  .ad-empty-inline { padding:32px 24px; text-align:center; font-size:14px; color:var(--muted); font-weight:600; }

  /* ── ORDERS TAB ── */

  /* Filter bar */
  .ord-filter-bar {
    display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;
  }
  .ord-filter-btn {
    display:flex; align-items:center; gap:8px;
    padding:10px 18px; border-radius:10px;
    background:#fff; border:1.5px solid var(--border);
    font-family:'Nunito',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; color:var(--text);
    transition:all 0.18s;
  }
  .ord-filter-btn:hover { border-color:var(--green-m); color:var(--green-m); background:var(--green-pl); }
  .ord-filter-btn.active { background:var(--green-m); color:#fff; border-color:var(--green-m); }
  .ord-filter-btn.active .ord-filter-count { background:rgba(255,255,255,0.25); color:#fff; }
  .ord-filter-label { font-size:13px; }
  .ord-filter-count {
    font-size:11px; font-weight:800;
    background:var(--cream2); color:var(--muted);
    padding:2px 8px; border-radius:20px;
    transition:all 0.18s;
  }

  /* Order list */
  .ord-list { display:flex; flex-direction:column; gap:12px; }

  /* Order card */
  .ord-card {
    background:#fff; border-radius:14px;
    border:1.5px solid var(--border);
    overflow:hidden;
    transition:box-shadow 0.2s, border-color 0.2s;
  }
  .ord-card:hover { box-shadow:0 4px 20px var(--shadow); }
  .ord-card.expanded { border-color:var(--green-m); box-shadow:0 4px 24px var(--shadow); }

  /* Card header — clickable */
  .ord-card-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 22px; cursor:pointer;
    transition:background 0.15s;
    gap:16px;
  }
  .ord-card-head:hover { background:var(--cream); }
  .ord-card-head-left { display:flex; flex-direction:column; gap:5px; }
  .ord-card-head-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .ord-number { font-family:'Tiro Malayalam',serif; font-size:16px; font-weight:600; color:var(--text); }
  .ord-meta { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--muted); font-weight:600; flex-wrap:wrap; }
  .ord-dot { color:var(--cream3); }
  .ord-price { color:var(--gold); font-weight:800; font-size:14px; }
  .ord-expand-icon { font-size:11px; color:var(--muted); }

  /* Card body */
  .ord-card-body {
    padding:0 22px 22px;
    border-top:1px solid var(--border);
  }

  /* Two-column detail grid */
  .ord-detail-grid {
    display:grid; grid-template-columns:1fr 1fr;
    gap:16px; margin-top:18px; margin-bottom:18px;
  }
  .ord-detail-section {
    background:var(--cream); border-radius:12px;
    padding:16px 18px; border:1px solid var(--border);
  }
  .ord-detail-title {
    font-size:12px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.1em; color:var(--muted);
    margin-bottom:12px; padding-bottom:8px;
    border-bottom:1px solid var(--border);
  }
  .ord-detail-row {
    display:flex; gap:12px; padding:5px 0;
    font-size:13.5px;
  }
  .ord-detail-label { color:var(--muted); font-weight:600; min-width:72px; flex-shrink:0; }
  .ord-detail-val { color:var(--text); font-weight:700; }
  .ord-detail-empty { font-size:13px; color:var(--muted); font-style:italic; }

  /* Items section */
  .ord-items-section {
    background:var(--cream); border-radius:12px;
    padding:16px 18px; border:1px solid var(--border);
    margin-bottom:14px;
  }
  .ord-items-list { display:flex; flex-direction:column; gap:10px; margin-top:10px; }
  .ord-item-row {
    display:flex; align-items:center; gap:12px;
    padding:10px 12px; background:#fff; border-radius:10px;
    border:1px solid var(--border);
  }
  .ord-item-img { width:44px; height:44px; border-radius:8px; object-fit:cover; border:1px solid var(--border); flex-shrink:0; }
  .ord-item-info { flex:1; }
  .ord-item-name { font-size:13.5px; font-weight:700; color:var(--text); }
  .ord-item-qty { font-size:12px; color:var(--muted); margin-top:2px; }
  .ord-item-price { font-size:15px; font-weight:900; color:var(--gold); font-family:'Tiro Malayalam',serif; flex-shrink:0; }

  /* Total breakdown */
  .ord-total-breakdown {
    margin-top:12px; padding-top:12px;
    border-top:1px solid var(--border);
    display:flex; flex-direction:column; gap:4px;
  }
  .ord-total-row {
    display:flex; justify-content:space-between;
    font-size:13px; color:var(--muted); font-weight:600; padding:3px 0;
  }
  .ord-total-row.total {
    font-size:15px; font-weight:900; color:var(--text);
    padding-top:8px; margin-top:4px;
    border-top:1px solid var(--border);
  }
  .ord-total-row.total span:last-child { color:var(--gold); font-family:'Tiro Malayalam',serif; }

  /* Notes */
  .ord-notes {
    background:var(--gold-pl); border:1px solid rgba(200,121,10,0.2);
    border-radius:10px; padding:12px 16px;
    font-size:13.5px; color:var(--brown-lt);
    margin-bottom:14px; line-height:1.6;
  }
  .ord-notes-label { font-weight:800; }

  /* Status bar */
  .ord-status-bar {
    display:flex; align-items:center; gap:14px;
    padding:14px 0 0; flex-wrap:wrap;
  }
  .ord-status-label { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); flex-shrink:0; }
  .ord-status-btns { display:flex; gap:8px; flex-wrap:wrap; }
  .ord-status-btn {
    padding:8px 16px; border-radius:8px;
    background:#fff; border:1.5px solid var(--border);
    font-family:'Nunito',sans-serif; font-size:12.5px; font-weight:700;
    cursor:pointer; color:var(--text);
    transition:all 0.18s;
  }
  .ord-status-btn:hover { border-color:var(--green-m); color:var(--green-m); background:var(--green-pl); }
  .ord-status-btn.active { font-weight:900; }

  /* ── RESPONSIVE ── */
  @media(max-width:1280px) {
    .ad-content { padding:28px; }
    .ad-stats-grid { grid-template-columns:repeat(2,1fr); }
  }

  @media(max-width:1024px) {
    .ad-shell { grid-template-columns:1fr; }
    .ad-shell.collapsed { grid-template-columns:1fr; }
    .ad-sidebar {
      position:sticky; top:0; z-index:100;
      height:auto; flex-direction:column;
      overflow:visible;
    }
    .ad-brand {
      border-bottom:1px solid rgba(255,255,255,0.07);
      border-right:none; padding:12px 20px; min-height:auto;
    }
    .ad-brand-logo { width:36px; height:36px; font-size:16px; border-radius:10px; }
    .ad-brand-name { font-size:15px; }
    .ad-user-pill { display:none; }
    .ad-collapse-btn { display:none; }
    .ad-nav {
      flex:none; overflow-x:auto; overflow-y:hidden;
      padding:6px 12px; display:flex; gap:4px;
      white-space:nowrap;
      border-bottom:1px solid rgba(255,255,255,0.07);
      scrollbar-width:none;
    }
    .ad-nav::-webkit-scrollbar { display:none; }
    .ad-nav-section { display:flex; gap:4px; margin-bottom:0; flex-shrink:0; }
    .ad-nav-section-title { display:none; }
    .ad-nav-item { padding:8px 14px; font-size:12.5px; border-radius:8px; flex-shrink:0; width:auto; }
    .ad-nav-active-dot { display:none; }
    .ad-sidebar-foot {
      flex-direction:row; padding:6px 12px;
      border-top:none; gap:4px; justify-content:flex-end;
    }
    .ad-view-site, .ad-signout { padding:7px 14px; font-size:12px; width:auto; flex-shrink:0; }
    .ad-topbar { padding:14px 24px; }
    .ad-content { padding:20px 24px; }
    .ad-form-grid { grid-template-columns:1fr 1fr; }
    .ad-img-grid { grid-template-columns:repeat(2,1fr); }
  }

  @media(max-width:768px) {
    .ad-brand { padding:10px 16px; }
    .ad-brand-logo { width:32px; height:32px; font-size:14px; }
    .ad-brand-name { font-size:14px; }
    .ad-brand-sub { font-size:8px; letter-spacing:0.1em; }
    .ad-nav { padding:5px 10px; gap:3px; }
    .ad-nav-item { padding:7px 10px; font-size:11.5px; gap:6px; }
    .ad-nav-icon { font-size:14px; width:16px; }
    .ad-sidebar-foot { padding:5px 10px; }
    .ad-view-site, .ad-signout { padding:6px 10px; font-size:11px; gap:6px; }
    .ad-stats-grid { grid-template-columns:1fr 1fr; gap:12px; }
    .ad-stat-card { padding:18px 16px; }
    .ad-stat-value { font-size:26px; }
    .ad-topbar { padding:12px 16px; }
    .ad-content { padding:16px; }
    .ad-page-title { font-size:26px; }
    .ad-card-head { padding:14px 18px; }
    .ad-card-title { font-size:17px; }
    .ad-form-body { padding:16px; }
    .ad-form-grid { grid-template-columns:1fr; }
    .ad-form-actions { flex-direction:column; }
    .ad-btn { width:100%; justify-content:center; }
    .ad-table th { padding:10px 12px; }
    .ad-table td { padding:12px; }
    .ad-actions-row { flex-direction:column; gap:6px; }
    .ad-actions-row .ad-btn-sm { width:100%; justify-content:center; }
    .ad-content-item { flex-direction:column; }
    .ad-content-item-actions { width:100%; flex-wrap:wrap; }
    .ad-img-grid { grid-template-columns:1fr; }
    .ad-featured-list { padding:12px; }
    .ad-edit-banner { flex-direction:column; gap:8px; }
    .ord-detail-grid { grid-template-columns:1fr; }
    .ord-filter-bar { gap:6px; }
    .ord-filter-btn { padding:8px 12px; font-size:12px; }
    .ord-card-head { padding:14px 16px; }
    .ord-card-body { padding:0 16px 16px; }
    .ord-status-bar { flex-direction:column; align-items:flex-start; }
    .ord-status-btns { width:100%; }
    .ord-status-btn { flex:1; text-align:center; justify-content:center; }
    .ord-meta { gap:5px; font-size:12px; }
  }

  @media(max-width:480px) {
    .ad-brand { padding:8px 12px; gap:8px; }
    .ad-brand-logo { width:28px; height:28px; font-size:12px; border-radius:8px; }
    .ad-brand-name { font-size:13px; }
    .ad-brand-sub { display:none; }
    .ad-nav { padding:4px 8px; gap:2px; }
    .ad-nav-item { padding:6px 8px; font-size:10.5px; gap:4px; }
    .ad-nav-icon { font-size:12px; width:14px; }
    .ad-nav-label { display:none; }
    .ad-sidebar-foot { padding:4px 8px; gap:2px; }
    .ad-view-site span:last-child, .ad-signout span:last-child { display:none; }
    .ad-view-site, .ad-signout { padding:6px 10px; font-size:14px; justify-content:center; }
    .ad-topbar { padding:10px 12px; }
    .ad-topbar-time { display:none; }
    .ad-topbar-avatar { width:30px; height:30px; font-size:12px; }
    .ad-page-path { font-size:12px; }
    .ad-stats-grid { grid-template-columns:1fr; }
    .ad-stat-card { padding:16px 14px; gap:12px; }
    .ad-stat-value { font-size:22px; }
    .ad-content { padding:12px; }
    .ad-page-title { font-size:22px; }
    .ad-table th { font-size:10px; padding:8px 10px; }
    .ad-table td { font-size:12.5px; padding:10px; }
    .ad-thumb { width:38px; height:38px; }
    .ad-chip { padding:5px 12px; font-size:11px; }
    .ad-img-preview { height:120px; }
    .ord-filter-btn { padding:7px 10px; font-size:11.5px; }
    .ord-number { font-size:14px; }
    .ord-item-img { width:36px; height:36px; }
    .ord-item-name { font-size:12.5px; }
  }
`
