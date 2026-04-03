'use client'
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const pathname = usePathname()

  // Fetch navbar logo from siteImages (key: 'navbar_logo')
  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        const logo = data?.siteImages?.find(img => img.key === 'navbar_logo')
        if (logo?.imageUrl) setLogoUrl(logo.imageUrl)
      })
      .catch(() => {})
  }, [])

  // Read cart from localStorage
  useEffect(() => {
    const updateCart = () => {
      const saved = localStorage.getItem('ushas-cart')
      if (saved) {
        const cart = JSON.parse(saved)
        setCartCount(cart.reduce((s, i) => s + i.qty, 0))
      } else {
        setCartCount(0)
      }
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    // Poll every second to catch cart updates within same tab
    const interval = setInterval(updateCart, 1000)
    return () => { window.removeEventListener('storage', updateCart); clearInterval(interval) }
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Malayalam:ital@0;1&family=Nunito:wght@300;400;500;600;700;800&display=swap');

        /* ── BASE ── */
        .nb {
          position: sticky; top: 0; z-index: 500;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 56px;
          font-family: 'Nunito', sans-serif;
          transition: background 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease;
          background: rgba(42, 80, 38, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .nb.scrolled {
          background: rgba(30, 58, 27, 0.98);
          box-shadow: 0 4px 32px rgba(0,0,0,0.22);
        }

        /* ── LOGO ── */
        .nb-logo {
          text-decoration: none;
          display: flex; flex-direction: column; line-height: 1;
          z-index: 510; flex-shrink: 0;
          gap: 1px;
        }
        .nb-logo-main {
          font-family: 'Tiro Malayalam', serif;
          font-size: 26px; color: #F0B429;
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .nb-logo-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 9px; color: rgba(255,255,255,0.45);
          letter-spacing: 0.28em; text-transform: uppercase;
          font-weight: 600;
        }

        /* ── NAV LINKS ── */
        .nb-links {
          display: flex; align-items: center; gap: 4px;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nb-link {
          position: relative;
          color: rgba(255,255,255,0.72);
          font-size: 13.5px; font-weight: 600;
          text-decoration: none;
          padding: 6px 14px; border-radius: 8px;
          letter-spacing: 0.03em;
          transition: color 0.2s, background 0.2s;
        }
        .nb-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .nb-link.active {
          color: #F0B429;
          background: rgba(240,180,41,0.1);
        }
        .nb-link.active::after {
          content: '';
          position: absolute; bottom: -1px; left: 14px; right: 14px;
          height: 2px; border-radius: 2px;
          background: #F0B429;
        }

        /* ── ACTIONS ── */
        .nb-actions {
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }

        /* Icon buttons */
        .nb-icon {
          position: relative;
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; cursor: pointer;
          font-size: 17px;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          color: #fff;
        }
        .nb-icon:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        /* Cart badge */
        .nb-badge {
          position: absolute; top: -5px; right: -5px;
          min-width: 18px; height: 18px;
          background: #E53E3E;
          border: 2px solid rgba(30,58,27,0.98);
          border-radius: 20px;
          font-size: 9px; font-weight: 800;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Divider */
        .nb-divider {
          width: 1px; height: 24px;
          background: rgba(255,255,255,0.12);
          margin: 0 4px;
        }

        /* User avatar */
        .nb-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #F0B429, #C8790A);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #3A1A00;
          flex-shrink: 0;
          border: 2px solid rgba(240,180,41,0.4);
        }

        /* Sign in btn */
        .nb-signin {
          padding: 8px 20px;
          background: linear-gradient(135deg, #F0B429 0%, #C8790A 100%);
          color: #1E120A; border: none; border-radius: 8px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(240,180,41,0.3);
          letter-spacing: 0.02em;
        }
        .nb-signin:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(240,180,41,0.45);
        }

        /* Sign out btn */
        .nb-signout {
          padding: 7px 16px;
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          font-family: 'Nunito', sans-serif;
          font-size: 12.5px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nb-signout:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.25);
        }

        /* ── HAMBURGER ── */
        .nb-burger {
          display: none;
          flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer;
          padding: 8px; z-index: 510;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .nb-burger:hover { background: rgba(255,255,255,0.08); }
        .nb-burger-line {
          display: block; width: 22px; height: 2px;
          background: #fff; border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
          transform-origin: center;
        }
        .nb-burger.open .nb-burger-line:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .nb-burger.open .nb-burger-line:nth-child(2) { opacity: 0; width: 0; }
        .nb-burger.open .nb-burger-line:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* ── MOBILE MENU ── */
        .nb-mobile {
          position: fixed; inset: 0; z-index: 490;
          background: linear-gradient(160deg, #1E3D1B 0%, #2D5A27 50%, #1E3D1B 100%);
          display: flex; flex-direction: column;
          padding: 100px 32px 48px;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .nb-mobile.open { transform: translateX(0); }

        .nb-mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(255,255,255,0.75);
          font-size: 22px; font-weight: 700;
          text-decoration: none;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.02em;
          transition: color 0.2s, padding-left 0.2s;
        }
        .nb-mobile-link:hover, .nb-mobile-link.active {
          color: #F0B429;
          padding-left: 8px;
        }
        .nb-mobile-link .arrow {
          font-size: 14px; opacity: 0.4;
          transition: opacity 0.2s, transform 0.2s;
        }
        .nb-mobile-link:hover .arrow { opacity: 1; transform: translateX(4px); }

        .nb-mobile-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 24px 0;
        }

        .nb-mobile-actions {
          display: flex; flex-direction: column; gap: 12px;
        }

        .nb-mobile-icon-row {
          display: flex; gap: 12px; margin-bottom: 8px;
        }

        .nb-mobile-icon {
          flex: 1; padding: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
          font-family: 'Nunito', sans-serif;
          transition: background 0.2s;
          position: relative;
        }
        .nb-mobile-icon:hover { background: rgba(255,255,255,0.12); }

        .nb-mobile-signin {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #F0B429 0%, #C8790A 100%);
          color: #1E120A; border: none; border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.02em;
        }

        .nb-mobile-signout {
          width: 100%; padding: 14px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nb-mobile-signout:hover { background: rgba(255,255,255,0.06); color: #fff; }

        .nb-mobile-user {
          display: flex; align-items: center; gap: 14px;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .nb-mobile-user-info { flex: 1; }
        .nb-mobile-user-name { font-size: 15px; font-weight: 700; color: #fff; }
        .nb-mobile-user-email { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }

        /* Kerala decorative bottom of mobile menu */
        .nb-mobile-decor {
          margin-top: auto; padding-top: 32px;
          text-align: center;
          font-family: 'Tiro Malayalam', serif;
          font-size: 28px; color: rgba(240,180,41,0.15);
          letter-spacing: 0.08em;
          user-select: none;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .nb { padding: 0 28px; }
          .nb-links { gap: 2px; }
          .nb-link { font-size: 13px; padding: 6px 10px; }
        }

        @media (max-width: 768px) {
          .nb { padding: 0 20px; height: 60px; }
          .nb-links { display: none; }
          .nb-actions { display: none; }
          .nb-burger { display: flex; }
          .nb-logo-main { font-size: 22px; }
        }

        @media (max-width: 480px) {
          .nb { padding: 0 16px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`nb ${scrolled ? 'scrolled' : ''}`}>

        {/* Logo */}
        <Link href="/" className="nb-logo">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Ushas Products Logo"
              style={{ height: '44px', maxWidth: '160px', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <>
              <span className="nb-logo-main">Ushas Products</span>
              <span className="nb-logo-sub">Authentic Kerala Products</span>
            </>
          )}
        </Link>

        {/* Desktop Links */}
        <div className="nb-links">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={`nb-link ${isActive(href) ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nb-actions">
          {isSignedIn ? (
            <>
              {/* Avatar */}
              <div className="nb-avatar">
                {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
              </div>

              <div className="nb-divider" />

              {/* Wishlist */}
              <Link href="/wishlist" className="nb-icon" title="Wishlist">
                🤍
              </Link>

              {/* Cart */}
              <Link href="/cart" className="nb-icon" title="Cart">
                🛒
                {cartCount > 0 && <span className="nb-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
              </Link>

              {/* Profile */}
              <Link href="/profile" className="nb-icon" title="My Profile">
                👤
              </Link>

              <div className="nb-divider" />

              {/* Sign out */}
              <SignOutButton redirectUrl="/">
                <button className="nb-signout">Sign Out</button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="nb-signin">Sign In</button>
            </SignInButton>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`nb-burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="nb-burger-line" />
          <span className="nb-burger-line" />
          <span className="nb-burger-line" />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`nb-mobile ${menuOpen ? 'open' : ''}`}>

        {/* User info if signed in */}
        {isSignedIn && (
          <div className="nb-mobile-user">
            <div className="nb-avatar" style={{ width: '44px', height: '44px', fontSize: '16px' }}>
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="nb-mobile-user-info">
              <div className="nb-mobile-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="nb-mobile-user-email">{user?.emailAddresses?.[0]?.emailAddress}</div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nb-mobile-link ${isActive(href) ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
            <span className="arrow">→</span>
          </Link>
        ))}

        <div className="nb-mobile-divider" />

        {/* Actions */}
        <div className="nb-mobile-actions">
          {isSignedIn ? (
            <>
              <div className="nb-mobile-icon-row">
                <Link href="/wishlist" className="nb-mobile-icon" onClick={() => setMenuOpen(false)}>
                  🤍 Wishlist
                </Link>
                <Link href="/cart" className="nb-mobile-icon" onClick={() => setMenuOpen(false)}>
                  🛒 Cart
                  {cartCount > 0 && (
                    <span className="nb-badge" style={{ top: '-6px', right: '-6px' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="nb-mobile-icon" onClick={() => setMenuOpen(false)}>
                  👤 Profile
                </Link>
              </div>
              <SignOutButton redirectUrl="/">
                <button className="nb-mobile-signout" onClick={() => setMenuOpen(false)}>
                  🚪 Sign Out
                </button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="nb-mobile-signin" onClick={() => setMenuOpen(false)}>
                Sign In to Your Account
              </button>
            </SignInButton>
          )}
        </div>

        {/* Kerala decorative bottom of mobile menu */}
        <div className="nb-mobile-decor">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Ushas Products Logo"
              style={{ height: '40px', maxWidth: '140px', objectFit: 'contain', opacity: 0.5, display: 'inline-block' }}
            />
          ) : (
            'Ushas Products'
          )}
        </div>
      </div>
    </>
  )
}