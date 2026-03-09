// ============================================================
// FILE: app/components/AdminBar.jsx  (new file)
// Add <AdminBar /> inside your layout.js so it shows on every page
// ============================================================
'use client'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminBar() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const pathname = usePathname()

  // Check if user is admin from our DB
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetch('/api/auth/redirect')
      .then(res => res.json())
      .then(data => setIsAdmin(data.redirect === '/admin'))
      .catch(() => {})
  }, [isLoaded, isSignedIn])

  // Don't show on admin panel itself
  if (!isAdmin || pathname.startsWith('/admin')) return null

  return (
    <>
      <style>{`
        .admin-bar {
          position:fixed; bottom:24px; left:50%;
          transform:translateX(-50%);
          z-index:9999;
          display:flex; align-items:center; gap:0;
          background:linear-gradient(135deg, #1a3d17, #2D5A27);
          border-radius:50px;
          box-shadow:0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
          border:1px solid rgba(255,255,255,0.12);
          overflow:hidden;
          transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
          white-space:nowrap;
          font-family:'Nunito',sans-serif;
        }
        .admin-bar.minimized { border-radius:50px; }

        /* Admin avatar + label */
        .admin-bar-identity {
          display:flex; align-items:center; gap:10px;
          padding:10px 6px 10px 16px;
        }
        .admin-bar-avatar {
          width:30px; height:30px; border-radius:50%;
          background:linear-gradient(135deg, #F0B429, #C8790A);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; color:#4A2810;
          flex-shrink:0;
        }
        .admin-bar-label {
          font-size:12.5px; font-weight:800; color:rgba(255,255,255,0.9);
          letter-spacing:0.02em;
        }
        .admin-bar-label span {
          color:#F0B429;
        }
        .admin-bar.minimized .admin-bar-label { display:none; }
        .admin-bar.minimized .admin-bar-identity { padding:10px 4px 10px 12px; }

        /* Divider */
        .admin-bar-divider {
          width:1px; height:22px;
          background:rgba(255,255,255,0.15); flex-shrink:0;
        }
        .admin-bar.minimized .admin-bar-divider { display:none; }

        /* Back to admin button */
        .admin-bar-link {
          display:flex; align-items:center; gap:8px;
          padding:10px 18px;
          color:#fff; text-decoration:none;
          font-size:13px; font-weight:800;
          transition:background 0.2s;
          border-radius:0;
        }
        .admin-bar-link:hover { background:rgba(255,255,255,0.1); }
        .admin-bar-link-icon { font-size:15px; }
        .admin-bar.minimized .admin-bar-link-text { display:none; }
        .admin-bar.minimized .admin-bar-link { padding:10px 14px; }

        /* Current page pill */
        .admin-bar-page {
          display:flex; align-items:center;
          padding:4px 12px 4px 4px;
        }
        .admin-bar-page-pill {
          background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.12);
          border-radius:20px; padding:4px 10px;
          font-size:11px; font-weight:700; color:rgba(255,255,255,0.7);
          max-width:140px; overflow:hidden; text-overflow:ellipsis;
        }
        .admin-bar.minimized .admin-bar-page { display:none; }

        /* Minimize toggle */
        .admin-bar-toggle {
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.08); border:none;
          color:rgba(255,255,255,0.6); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; margin-right:6px;
          transition:background 0.2s, color 0.2s;
          flex-shrink:0;
        }
        .admin-bar-toggle:hover { background:rgba(255,255,255,0.16); color:#fff; }
        .admin-bar.minimized .admin-bar-toggle { margin-right:4px; }

        /* Entrance animation */
        @keyframes adminBarIn {
          from { opacity:0; transform:translateX(-50%) translateY(16px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        .admin-bar { animation:adminBarIn 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }

        @media(max-width:480px) {
          .admin-bar { bottom:16px; }
          .admin-bar-label { display:none; }
          .admin-bar-page { display:none; }
        }
      `}</style>

      <div className={`admin-bar ${minimized ? 'minimized' : ''}`}>
        {/* Identity */}
        <div className="admin-bar-identity">
          <div className="admin-bar-avatar">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="admin-bar-label">
            Admin: <span>{user?.firstName}</span>
          </div>
        </div>

        {!minimized && <div className="admin-bar-divider" />}

        {/* Back to admin */}
        <Link href="/admin" className="admin-bar-link">
          <span className="admin-bar-link-icon">⚙️</span>
          <span className="admin-bar-link-text">Admin Panel</span>
        </Link>

        {/* Current page */}
        {!minimized && (
          <div className="admin-bar-page">
            <div className="admin-bar-page-pill">
              📍 {pathname === '/' ? 'Home' : pathname.replace('/', '').replace(/-/g, ' ')}
            </div>
          </div>
        )}

        {/* Minimize */}
        <button
          className="admin-bar-toggle"
          onClick={() => setMinimized(v => !v)}
          title={minimized ? 'Expand' : 'Minimise'}
        >
          {minimized ? '⇱' : '⇲'}
        </button>
      </div>
    </>
  )
}
