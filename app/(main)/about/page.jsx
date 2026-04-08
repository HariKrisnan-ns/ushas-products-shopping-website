'use client'
import { CATEGORIES } from '@/lib/categories'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AboutPage() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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

        /* ── ANIMATIONS ── */
        .reveal { opacity:0; transform:translateY(32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-left { opacity:0; transform:translateX(-32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal-left.visible { opacity:1; transform:translateX(0); }
        .reveal-right { opacity:0; transform:translateX(32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal-right.visible { opacity:1; transform:translateX(0); }
        .d1{transition-delay:0.1s!important} .d2{transition-delay:0.2s!important}
        .d3{transition-delay:0.3s!important} .d4{transition-delay:0.4s!important}
        .d5{transition-delay:0.5s!important} .d6{transition-delay:0.6s!important}

        /* ── HERO ── */
        .ab-hero {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:100px 80px;
          display:grid; grid-template-columns:1fr 1fr;
          gap:64px; align-items:center;
          position:relative; overflow:hidden;
          min-height:80vh;
        }
        .ab-hero::before {
          content:'ഉഷ';
          position:absolute; right:-40px; bottom:-60px;
          font-family:'Tiro Malayalam',serif; font-size:300px;
          color:rgba(255,255,255,0.03); line-height:1;
          pointer-events:none; user-select:none;
        }
        .ab-hero-bg-dots {
          position:absolute; inset:0; opacity:0.03;
          background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
          background-size:28px 28px; pointer-events:none;
        }

        .ab-hero-content { position:relative; z-index:2; }
        .ab-hero-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(240,180,41,0.15); border:1px solid rgba(240,180,41,0.3);
          color:var(--gold-lt); font-size:11px; font-weight:800;
          letter-spacing:0.22em; text-transform:uppercase;
          padding:6px 16px; border-radius:40px; margin-bottom:24px;
        }
        .ab-hero-kicker span { width:6px; height:6px; border-radius:50%; background:var(--gold-lt); display:inline-block; }
        .ab-hero h1 {
          font-family:'Tiro Malayalam',serif; font-size:54px;
          color:#fff; line-height:1.12; margin-bottom:24px;
        }
        .ab-hero h1 em { color:var(--gold-lt); font-style:normal; }
        .ab-hero-sub {
          font-size:16px; color:rgba(255,255,255,0.72);
          line-height:1.85; margin-bottom:36px; max-width:480px;
        }
        .ab-hero-stats {
          display:flex; gap:32px;
          padding-top:28px; border-top:1px solid rgba(255,255,255,0.08);
        }
        .ab-stat-num {
          font-family:'Tiro Malayalam',serif; font-size:30px;
          color:var(--gold-lt); line-height:1;
        }
        .ab-stat-label { font-size:12px; color:rgba(255,255,255,0.45); margin-top:4px; font-weight:600; }

        .ab-hero-img-wrap { position:relative; z-index:2; }
        .ab-hero-img {
          width:100%; height:440px; object-fit:cover;
          border-radius:24px 24px 80px 24px;
          box-shadow:0 32px 80px rgba(0,0,0,0.4);
          display:block;
        }
        .ab-hero-badge {
          position:absolute; bottom:28px; left:-24px;
          background:rgba(255,255,255,0.96); backdrop-filter:blur(12px);
          border-radius:14px; padding:14px 18px;
          box-shadow:0 8px 32px rgba(0,0,0,0.18);
          display:flex; align-items:center; gap:12px;
          animation:floatBadge 3s ease-in-out infinite;
        }
        .ab-hero-badge-icon { font-size:28px; }
        .ab-hero-badge-title { font-size:13px; font-weight:800; color:var(--text); }
        .ab-hero-badge-sub { font-size:11px; color:var(--muted); }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        /* ── BREADCRUMB ── */
        .ab-bc {
          background:var(--cream2); padding:14px 80px;
          border-bottom:1px solid var(--border);
          font-size:12.5px; color:var(--muted); font-weight:600;
          display:flex; align-items:center; gap:6px;
        }
        .ab-bc a { color:var(--muted); text-decoration:none; transition:color 0.2s; }
        .ab-bc a:hover { color:var(--green-m); }

        /* ── SECTION SHARED ── */
        .ab-section { padding:88px 80px; }
        .ab-section-alt { background:var(--cream2); }
        .ab-section-dark { background:var(--brown); }

        .ab-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--green-pl); color:var(--green-m);
          font-size:11px; font-weight:800; letter-spacing:0.18em;
          text-transform:uppercase; padding:5px 16px; border-radius:40px;
          margin-bottom:14px;
        }
        .ab-kicker::before, .ab-kicker::after { content:'—'; opacity:0.4; font-size:10px; }
        .ab-title {
          font-family:'Tiro Malayalam',serif; font-size:42px;
          color:var(--text); line-height:1.15; margin-bottom:14px;
        }
        .ab-title .gold { color:var(--gold); }
        .ab-sub { font-size:15.5px; color:var(--muted); max-width:520px; margin:0 auto; line-height:1.8; }

        /* ── STORY SECTION ── */
        .ab-story-layout {
          display:grid; grid-template-columns:1fr 1fr;
          gap:64px; align-items:center;
        }
        .ab-story-img-wrap { position:relative; }
        .ab-story-img {
          width:100%; height:420px; object-fit:cover;
          border-radius:20px; border:1px solid var(--border);
          box-shadow:0 16px 56px var(--shadow);
          display:block;
        }
        .ab-story-img-badge {
          position:absolute; top:24px; right:-20px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          border-radius:16px; padding:16px 20px; text-align:center;
          box-shadow:0 8px 24px rgba(0,0,0,0.2); color:#fff;
          animation:floatBadge 3s ease-in-out infinite 1s;
        }
        .ab-story-img-badge .num { font-family:'Tiro Malayalam',serif; font-size:28px; font-weight:700; }
        .ab-story-img-badge .lbl { font-size:11px; opacity:0.75; letter-spacing:0.06em; margin-top:2px; }

        .ab-story-text {}
        .ab-story-text p {
          font-size:15px; color:var(--muted); line-height:1.85;
          margin-bottom:16px;
        }
        .ab-story-text p:last-of-type { margin-bottom:28px; }
        .ab-story-quote {
          border-left:3px solid var(--gold-lt);
          padding:16px 20px; margin:24px 0;
          background:var(--gold-pl); border-radius:0 12px 12px 0;
          font-size:15px; font-style:italic; color:var(--brown-lt);
          font-weight:600; line-height:1.7;
        }

        .ab-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 28px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          color:#fff; border:none; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; text-decoration:none;
          box-shadow:0 4px 16px rgba(45,90,39,0.3);
          transition:transform 0.15s, box-shadow 0.2s;
        }
        .ab-btn:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(45,90,39,0.4); }

        /* ── VALUES ── */
        .ab-values-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .ab-value-card {
          background:#fff; border-radius:20px; padding:32px 24px;
          border:1px solid var(--border); text-align:center;
          transition:box-shadow 0.25s, transform 0.25s; position:relative; overflow:hidden;
        }
        .ab-value-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--green-m), var(--gold-lt));
          transform:scaleX(0); transition:transform 0.3s; transform-origin:left;
        }
        .ab-value-card:hover { box-shadow:0 8px 32px var(--shadow); transform:translateY(-4px); }
        .ab-value-card:hover::after { transform:scaleX(1); }
        .ab-value-icon {
          width:68px; height:68px; border-radius:20px;
          background:linear-gradient(135deg, var(--green-pl), var(--gold-pl));
          margin:0 auto 18px;
          display:flex; align-items:center; justify-content:center; font-size:30px;
        }
        .ab-value-card h3 { font-size:16px; font-weight:800; margin-bottom:10px; }
        .ab-value-card p { font-size:13.5px; color:var(--muted); line-height:1.7; }

        /* ── TIMELINE ── */
        .ab-timeline { max-width:680px; margin:0 auto; position:relative; }
        .ab-timeline::before {
          content:''; position:absolute; left:28px; top:0; bottom:0;
          width:2px; background:linear-gradient(to bottom, var(--green-m), var(--gold-lt), var(--green-m));
          border-radius:2px;
        }
        .ab-tl-item {
          display:flex; gap:24px; margin-bottom:40px; position:relative;
        }
        .ab-tl-dot {
          width:58px; height:58px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg, var(--green-m), var(--green-lt));
          display:flex; align-items:center; justify-content:center;
          font-size:20px; position:relative; z-index:1;
          box-shadow:0 4px 16px rgba(45,90,39,0.25);
        }
        .ab-tl-content { padding-top:10px; }
        .ab-tl-year {
          font-size:12px; font-weight:800; color:var(--gold);
          letter-spacing:0.12em; text-transform:uppercase; margin-bottom:4px;
        }
        .ab-tl-title { font-size:17px; font-weight:800; color:var(--text); margin-bottom:6px; }
        .ab-tl-text { font-size:14px; color:var(--muted); line-height:1.7; }

        /* ── TEAM ── */
        .ab-team-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
        .ab-team-card {
          background:#fff; border-radius:20px; overflow:hidden;
          border:1px solid var(--border); text-align:center;
          transition:box-shadow 0.25s, transform 0.25s;
        }
        .ab-team-card:hover { box-shadow:0 12px 40px var(--shadow); transform:translateY(-4px); }
        .ab-team-img { width:100%; height:240px; object-fit:cover; object-position:top; display:block; transition:transform 0.4s; }
        .ab-team-card:hover .ab-team-img { transform:scale(1.04); }
        .ab-team-body { padding:22px 20px; }
        .ab-team-name { font-size:17px; font-weight:800; margin-bottom:4px; color:var(--text); }
        .ab-team-role { font-size:13px; color:var(--green-m); font-weight:700; margin-bottom:8px; }
        .ab-team-desc { font-size:12.5px; color:var(--muted); line-height:1.6; }

        /* ── CTA BANNER ── */
        .ab-cta {
          background:linear-gradient(135deg, var(--green) 0%, var(--green-m) 50%, #1a3a16 100%);
          padding:80px; text-align:center; position:relative; overflow:hidden;
        }
        .ab-cta::before {
          content:'ഉഷ'; position:absolute; right:-20px; top:-20px;
          font-family:'Tiro Malayalam',serif; font-size:200px;
          color:rgba(255,255,255,0.04); pointer-events:none; user-select:none;
        }
        .ab-cta h2 { font-family:'Tiro Malayalam',serif; font-size:40px; color:#fff; margin-bottom:14px; position:relative; }
        .ab-cta p { font-size:16px; color:rgba(255,255,255,0.72); margin-bottom:32px; position:relative; max-width:480px; margin-left:auto; margin-right:auto; }
        .ab-cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; }
        .ab-cta-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          padding:15px 32px;
          background:linear-gradient(135deg, var(--gold-lt), var(--gold));
          color:#1E120A; border:none; border-radius:10px;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:800;
          cursor:pointer; text-decoration:none;
          box-shadow:0 4px 20px rgba(200,121,10,0.4);
          transition:transform 0.15s, box-shadow 0.2s;
        }
        .ab-cta-btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(200,121,10,0.5); }
        .ab-cta-btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 28px; background:rgba(255,255,255,0.1);
          color:#fff; border:1.5px solid rgba(255,255,255,0.25);
          border-radius:10px; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:700; text-decoration:none;
          backdrop-filter:blur(4px); transition:background 0.2s, border-color 0.2s;
        }
        .ab-cta-btn-ghost:hover { background:rgba(255,255,255,0.18); border-color:rgba(255,255,255,0.4); }

        /* ── FOOTER ── */
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
        @media(max-width:1024px) {
          .ab-hero { padding:72px 48px; gap:40px; min-height:auto; }
          .ab-hero h1 { font-size:42px; }
          .ab-bc { padding:14px 48px; }
          .ab-section { padding:72px 48px; }
          .ab-cta { padding:64px 48px; }
          .footer { padding:60px 48px 28px; }
          .footer-top { grid-template-columns:1fr 1fr; gap:36px; }
        }
        @media(max-width:768px) {
          .ab-hero { grid-template-columns:1fr; padding:56px 24px; }
          .ab-hero h1 { font-size:34px; }
          .ab-hero-img-wrap { display:none; }
          .ab-bc { padding:12px 24px; }
          .ab-section { padding:56px 24px; }
          .ab-story-layout { grid-template-columns:1fr; gap:32px; }
          .ab-values-grid { grid-template-columns:repeat(2,1fr); }
          .ab-team-grid { grid-template-columns:repeat(2,1fr); }
          .ab-cta { padding:48px 24px; }
          .ab-cta h2 { font-size:30px; }
          .footer { padding:48px 24px 24px; }
          .footer-top { grid-template-columns:1fr; gap:28px; }
          .footer-bottom { flex-direction:column; gap:16px; text-align:center; }
        }
        @media(max-width:480px) {
          .ab-hero { padding:40px 16px; }
          .ab-hero h1 { font-size:28px; }
          .ab-bc { padding:10px 16px; }
          .ab-section { padding:44px 16px; }
          .ab-title { font-size:30px; }
          .ab-values-grid { grid-template-columns:1fr; }
          .ab-team-grid { grid-template-columns:1fr; }
          .ab-cta { padding:40px 16px; }
          .ab-cta-btns { flex-direction:column; align-items:center; }
          .footer { padding:40px 16px 20px; }
        }
      `}</style>

      {/* BREADCRUMB */}
      <div className="ab-bc">
        <Link href="/">Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>About Us</span>
      </div>

      {/* ── HERO ── */}
      <div className="ab-hero">
        <div className="ab-hero-bg-dots" />
        <div className="ab-hero-content">
          <div className="ab-hero-kicker"><span />Our Story</div>
          <h1>Rooted in Kerala's <em>Rich Culinary</em> Heritage</h1>
          <p className="ab-hero-sub">
            Ushas Products was born from a simple belief — the purest, most wholesome food comes from time-honoured traditions. Since 2021, we've been bringing authentic Kerala snacks and health foods to homes across India.
          </p>
          <div className="ab-hero-stats">
            <div>
              <div className="ab-stat-num">2021</div>
              <div className="ab-stat-label">Founded</div>
            </div>

            <div>
              <div className="ab-stat-num">100+</div>
              <div className="ab-stat-label">Happy Customers</div>
            </div>
          </div>
        </div>
        <div className="ab-hero-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop"
            alt="Kerala food"
            className="ab-hero-img"
          />

        </div>
      </div>

      {/* ── STORY ── */}
      <div className="ab-section">
        <div className="ab-story-layout">
          <div className="ab-story-img-wrap reveal-left">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop"
              alt="Making snacks"
              className="ab-story-img"
            />

          </div>
          <div className="reveal-right">
            <div className="ab-kicker">Our Journey</div>
            <h2 className="ab-title">From Ushas's Kitchen to <span className="gold">Your Doorstep</span></h2>
            <div className="ab-story-quote">
              "The best food is made with love, from the finest ingredients, for the people you care about."
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, fontStyle: 'normal', color: 'var(--brown-lt)' }}>—  Founder</div>
            </div>
            <p>It all started in a small kitchen in out home, where our founder Usha  would spend hours making banana chips and murukku using recipes passed down through generations.</p>
            <p>What began as sharing treats with neighbours quickly grew into a mission — to preserve authentic Kerala food traditions and make them accessible to everyone, everywhere.</p>
            <p>We are ensuring every product is made with the same love and quality as that very first batch from Usha's kitchen.</p>
            <Link href="/contact" className="ab-btn">Get in Touch →</Link>
          </div>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="ab-section ab-section-alt">
        <div style={{ textAlign: 'center', marginBottom: 56 }} className="reveal">
          <div className="ab-kicker">Our Growth</div>
          <h2 className="ab-title">How We've <span className="gold">Grown</span></h2>
        </div>
        <div className="ab-timeline">
          {[
            { year: '2020', icon: '🌱', title: 'The Beginning', text: 'Usha Krishnan starts making banana chips and murukku in her Thrissur kitchen, sharing them with neighbours.' },
            { year: '2021', icon: '🏪', title: 'The idea of Ushas products', text: 'Selling our products in local neighbourhood.' },
            { year: '2025', icon: '🌐', title: 'Going Online', text: 'We launch our first online store, bringing Kerala snacks to customers across India .' },

          ].map((item, i) => (
            <div key={item.year} className={`ab-tl-item reveal d${Math.min(i + 1, 5)}`}>
              <div className="ab-tl-dot">{item.icon}</div>
              <div className="ab-tl-content">
                <div className="ab-tl-year">{item.year}</div>
                <div className="ab-tl-title">{item.title}</div>
                <div className="ab-tl-text">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VALUES ── */}
      <div className="ab-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }} className="reveal">
          <div className="ab-kicker">Our Values</div>
          <h2 className="ab-title">What We <span className="gold">Stand For</span></h2>
          <p className="ab-sub">Every decision we make is guided by these core values that define who we are.</p>
        </div>
        <div className="ab-values-grid">
          {[
            ['🌿', 'Authenticity', 'Every recipe is traditional. No shortcuts, no compromises — just real Kerala food made the right way.'],
            ['🥥', 'Quality First', 'From sourcing to packaging, quality is at the core of everything we do. Always.'],
            ['🌍', 'Sustainability', 'Eco-friendly packaging and zero food waste practices across our entire supply chain.'],
            ['❤️', 'Passion', 'Made with genuine love by people who care deeply about food, culture and community.'],
            ['✅', 'Certified', 'FSSAI certified and quality tested. Safe and wholesome for the whole family.'],
          ].map(([ic, h, d], i) => (
            <div key={h} className={`ab-value-card reveal d${(i % 3) + 1}`}>
              <div className="ab-value-icon">{ic}</div>
              <h3>{h}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className="ab-section ab-section-alt">
        <div style={{ textAlign: 'center', marginBottom: 56 }} className="reveal">
          <div className="ab-kicker">Our Team</div>
          <h2 className="ab-title">Meet the People <span className="gold">Behind Ushas</span></h2>
          <p className="ab-sub">A small but passionate team united by a love for Kerala's culinary traditions.</p>
        </div>
        <div className="ab-team-grid">
          {[
            { name: 'Usha Krishnan', role: 'Founder & CEO', desc: 'The heart and soul of Ushas. Started the brand from her Thrissur kitchen in 2018.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop' },
            { name: 'Rajan Nair', role: 'Head of Operations', desc: 'Ensures every order reaches you fresh and on time. The backbone of our logistics.', img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop' },
            { name: 'Deepa Menon', role: 'Quality & Sourcing', desc: 'Works directly with farmers to ensure the highest quality ingredients every single time.', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop' },
          ].map((m, i) => (
            <div key={m.name} className={`ab-team-card reveal d${i + 1}`}>
              <img src={m.img} alt={m.name} className="ab-team-img" />
              <div className="ab-team-body">
                <div className="ab-team-name">{m.name}</div>
                <div className="ab-team-role">{m.role}</div>
                <div className="ab-team-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="ab-cta reveal">
        <h2>Taste the Difference 🌿</h2>
        <p>Experience authentic Kerala flavours made with generations of love.</p>
        <div className="ab-cta-btns">
          <Link href="/shop" className="ab-cta-btn-primary">Shop Now →</Link>
          <Link href="/contact" className="ab-cta-btn-ghost">Contact Us</Link>
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
