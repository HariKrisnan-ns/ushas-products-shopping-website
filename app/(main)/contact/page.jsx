'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', instagram: '', facebook: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.subject) errs.subject = 'Required'
    if (!form.message.trim()) errs.message = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '', instagram: '', facebook: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 1200)
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
        .ct-hero {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 45%, #4a2810 100%);
          padding:80px 80px 72px;
          text-align:center; position:relative; overflow:hidden;
        }
        .ct-hero::before {
          content:'📞'; position:absolute; right:80px; top:50%;
          transform:translateY(-50%); font-size:160px; opacity:0.05;
          pointer-events:none;
        }
        .ct-hero::after {
          content:''; position:absolute; inset:0; opacity:0.03;
          background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
          background-size:28px 28px; pointer-events:none;
        }
        .ct-hero-inner { position:relative; z-index:1; }
        .ct-bc {
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; color:rgba(255,255,255,0.4); font-weight:600;
          margin-bottom:20px;
        }
        .ct-bc a { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
        .ct-bc a:hover { color:var(--gold-lt); }
        .ct-hero-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(240,180,41,0.15); border:1px solid rgba(240,180,41,0.3);
          color:var(--gold-lt); font-size:11px; font-weight:800;
          letter-spacing:0.22em; text-transform:uppercase;
          padding:6px 16px; border-radius:40px; margin-bottom:20px;
        }
        .ct-hero h1 {
          font-family:'Tiro Malayalam',serif; font-size:52px; color:#fff;
          margin-bottom:14px; line-height:1.1;
        }
        .ct-hero h1 em { color:var(--gold-lt); font-style:normal; }
        .ct-hero p { font-size:16px; color:rgba(255,255,255,0.68); max-width:480px; margin:0 auto; line-height:1.75; }

        /* Response time badges */
        .ct-hero-badges {
          display:flex; justify-content:center; gap:16px; margin-top:32px;
          flex-wrap:wrap;
        }
        .ct-hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.75); font-size:12.5px; font-weight:700;
          padding:8px 16px; border-radius:40px;
          backdrop-filter:blur(4px);
        }

        /* ── MAIN LAYOUT ── */
        .ct-layout {
          display:grid; grid-template-columns:1fr 1.1fr;
          gap:40px; padding:64px 80px;
          align-items:start;
        }

        /* ── INFO SIDE ── */
        .ct-info {}
        .ct-info-title {
          font-family:'Tiro Malayalam',serif; font-size:34px;
          color:var(--text); margin-bottom:12px; line-height:1.2;
        }
        .ct-info-title .gold { color:var(--gold); }
        .ct-info-sub {
          font-size:15px; color:var(--muted); line-height:1.8;
          margin-bottom:32px; max-width:400px;
        }

        /* Contact cards */
        .ct-cards { display:flex; flex-direction:column; gap:14px; margin-bottom:32px; }
        .ct-card {
          display:flex; gap:16px; align-items:flex-start;
          background:#fff; border-radius:16px; padding:20px;
          border:1px solid var(--border);
          transition:box-shadow 0.25s, transform 0.25s;
        }
        .ct-card:hover { box-shadow:0 8px 28px var(--shadow); transform:translateY(-2px); }
        .ct-card-icon {
          width:48px; height:48px; border-radius:14px;
          background:linear-gradient(135deg, var(--green-pl), var(--gold-pl));
          display:flex; align-items:center; justify-content:center;
          font-size:22px; flex-shrink:0;
        }
        .ct-card-title { font-size:14px; font-weight:800; color:var(--text); margin-bottom:5px; }
        .ct-card-text { font-size:13.5px; color:var(--muted); line-height:1.6; white-space:pre-line; }
        .ct-card-link { color:var(--green-m); font-weight:700; text-decoration:none; font-size:13px; margin-top:4px; display:inline-block; }
        .ct-card-link:hover { text-decoration:underline; }

        /* Hours card */
        .ct-hours {
          background:linear-gradient(135deg, var(--green-m), var(--green));
          border-radius:16px; padding:24px;
          margin-bottom:28px; color:#fff;
        }
        .ct-hours-title {
          font-size:13px; font-weight:800; letter-spacing:0.1em;
          text-transform:uppercase; color:rgba(255,255,255,0.6);
          margin-bottom:14px;
        }
        .ct-hours-row {
          display:flex; justify-content:space-between;
          font-size:13.5px; padding:6px 0;
          border-bottom:1px solid rgba(255,255,255,0.08);
        }
        .ct-hours-row:last-child { border-bottom:none; }
        .ct-hours-row .day { color:rgba(255,255,255,0.7); font-weight:600; }
        .ct-hours-row .time { color:#fff; font-weight:800; }
        .ct-hours-row .closed { color:rgba(255,255,255,0.35); }

        /* Social links */
        .ct-socials-title {
          font-size:13px; font-weight:800; letter-spacing:0.1em;
          text-transform:uppercase; color:var(--muted); margin-bottom:12px;
        }
        .ct-socials { display:flex; gap:10px; flex-wrap:wrap; }
        .ct-social {
          display:flex; align-items:center; gap:8px;
          padding:10px 18px; background:#fff;
          border:1.5px solid var(--border); border-radius:10px;
          text-decoration:none; color:var(--text);
          font-size:13.5px; font-weight:700;
          transition:all 0.2s;
        }
        .ct-social:hover { border-color:var(--green-m); background:var(--green-pl); color:var(--green-m); transform:translateY(-2px); }
        .ct-social-icon { font-size:18px; }

        /* ── FORM SIDE ── */
        .ct-form-card {
          background:#fff; border-radius:20px;
          border:1px solid var(--border); overflow:hidden;
          box-shadow:0 8px 40px var(--shadow);
        }
        .ct-form-head {
          padding:24px 32px; background:var(--cream2);
          border-bottom:1px solid var(--border);
        }
        .ct-form-head h3 { font-family:'Tiro Malayalam',serif; font-size:26px; color:var(--text); }
        .ct-form-head p { font-size:13px; color:var(--muted); margin-top:4px; }
        .ct-form-body { padding:28px 32px; }

        /* Success banner */
        .ct-success {
          background:var(--green-pl); border:1.5px solid var(--green-m);
          border-radius:12px; padding:18px 20px;
          margin-bottom:24px; text-align:center;
          animation:popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .ct-success-icon { font-size:36px; margin-bottom:8px; }
        .ct-success-title { font-size:16px; font-weight:800; color:var(--green-m); margin-bottom:4px; }
        .ct-success-sub { font-size:13px; color:var(--muted); }
        @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

        /* Form fields */
        .form-row2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .fg { margin-bottom:16px; }
        .fg:last-child { margin-bottom:0; }
        .fg-label {
          display:flex; justify-content:space-between; align-items:center;
          font-size:12px; font-weight:800; letter-spacing:0.06em;
          text-transform:uppercase; color:var(--muted); margin-bottom:7px;
        }
        .fg-req { color:var(--red); }
        .fg-err { font-size:11px; color:var(--red); font-weight:700; text-transform:none; letter-spacing:0; }
        .fg-input {
          width:100%; padding:12px 16px; border-radius:10px;
          border:1.5px solid var(--border); background:var(--cream);
          font-family:'Nunito',sans-serif; font-size:14px;
          color:var(--text); outline:none; font-weight:500;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .fg-input:focus { border-color:var(--green-m); box-shadow:0 0 0 3px rgba(45,90,39,0.08); background:#fff; }
        .fg-input.err { border-color:var(--red); background:#fff8f8; }
        .fg-input.err:focus { box-shadow:0 0 0 3px rgba(192,57,43,0.08); }
        textarea.fg-input { resize:vertical; min-height:120px; }

        /* Char count */
        .fg-meta { display:flex; justify-content:flex-end; font-size:11px; color:var(--muted); margin-top:4px; }

        .ct-submit {
          width:100%; padding:16px;
          background:linear-gradient(135deg, var(--green-m), var(--green));
          color:#fff; border:none; border-radius:12px;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:900;
          cursor:pointer; letter-spacing:0.02em;
          box-shadow:0 4px 20px rgba(45,90,39,0.3);
          transition:transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          margin-top:20px;
        }
        .ct-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 28px rgba(45,90,39,0.4); }
        .ct-submit:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
        .ct-submit.sending { background:var(--cream2); color:var(--muted); box-shadow:none; }

        /* Spinner */
        .spinner {
          width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ── MAP / FIND US ── */
        .ct-find {
          background:var(--cream2); padding:72px 80px;
          text-align:center;
        }
        .ct-find-kicker {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--green-pl); color:var(--green-m);
          font-size:11px; font-weight:800; letter-spacing:0.18em;
          text-transform:uppercase; padding:5px 16px; border-radius:40px;
          margin-bottom:14px;
        }
        .ct-find h2 { font-family:'Tiro Malayalam',serif; font-size:36px; color:var(--text); margin-bottom:10px; }
        .ct-find p { font-size:15px; color:var(--muted); margin-bottom:32px; }
        .ct-map-placeholder {
          background:linear-gradient(135deg, #1a3d17 0%, #2d5a27 100%);
          border-radius:20px; height:280px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          box-shadow:0 8px 32px var(--shadow);
          position:relative; overflow:hidden;
        }
        .ct-map-placeholder::before {
          content:''; position:absolute; inset:0; opacity:0.04;
          background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 50%);
          background-size:24px 24px;
        }
        .ct-map-icon { font-size:48px; margin-bottom:12px; position:relative; }
        .ct-map-text { font-size:15px; color:rgba(255,255,255,0.8); font-weight:700; position:relative; }
        .ct-map-sub { font-size:13px; color:rgba(255,255,255,0.45); margin-top:4px; position:relative; }

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
        @media(max-width:1200px) { .ct-hero{padding:64px 48px;} .ct-layout{padding:52px 48px;} .ct-find{padding:56px 48px;} .footer{padding:60px 48px 28px;} }
        @media(max-width:1024px) { .ct-hero{padding:56px 40px;} .ct-layout{padding:44px 40px; gap:28px;} .ct-find{padding:48px 40px;} .footer{padding:52px 40px 24px;} .footer-top{grid-template-columns:1fr 1fr;gap:32px;} }
        @media(max-width:768px) {
          .ct-hero{padding:48px 24px;} .ct-hero h1{font-size:36px;} .ct-hero-badges{gap:10px;}
          .ct-layout{grid-template-columns:1fr; padding:36px 24px;}
          .ct-find{padding:48px 24px;} .ct-find h2{font-size:28px;}
          .footer{padding:48px 24px 24px;} .footer-top{grid-template-columns:1fr;gap:28px;}
          .footer-bottom{flex-direction:column;gap:16px;text-align:center;}
        }
        @media(max-width:480px) {
          .ct-hero{padding:36px 16px;} .ct-hero h1{font-size:28px;}
          .ct-layout{padding:24px 16px;}
          .ct-form-body{padding:20px 18px;} .ct-form-head{padding:18px 20px;}
          .form-row2{grid-template-columns:1fr;}
          .ct-find{padding:40px 16px;}
          .footer{padding:40px 16px 20px;}
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="ct-hero">
        <div className="ct-hero-inner">
          <div className="ct-bc">
            <Link href="/">Home</Link><span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Contact</span>
          </div>
          <div className="ct-hero-kicker">We're Here for You</div>
          <h1>Get in <em>Touch</em></h1>
          <p>Have a question, bulk order enquiry, or just want to say hello? We'd love to hear from you.</p>
          <div className="ct-hero-badges">
            {['⚡ Replies within 24 hours', '📦 Bulk orders welcome', '🌿 Always happy to help'].map(b => (
              <span key={b} className="ct-hero-badge">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="ct-layout">

        {/* ── INFO SIDE ── */}
        <div className="ct-info reveal-left">
          <h2 className="ct-info-title">Let's <span className="gold">Connect</span></h2>
          <p className="ct-info-sub">
            Our friendly team is always ready to help. Reach us through any channel below and we'll get back to you as soon as possible.
          </p>

          {/* Contact cards */}
          <div className="ct-cards">
            {[
              { ic: '📍', h: 'Our Address', d: 'Ushas Products, NH 544, Thrissur\nKerala, India — 680001', link: null },
              { ic: '📞', h: 'Phone', d: '+91 8606371530', link: 'tel:+918606371530' },
              { ic: '📧', h: 'Email', d: 'Productsushas@gmail.com', link: 'mailto:Productsushas@gmail.com' },
              { ic: '💬', h: 'WhatsApp', d: 'Chat with us directly on WhatsApp for quick replies.', link: 'https://wa.me/918606371530' },
            ].map((c, i) => (
              <div key={c.h} className={`ct-card reveal d${i + 1}`}>
                <div className="ct-card-icon">{c.ic}</div>
                <div>
                  <div className="ct-card-title">{c.h}</div>
                  <div className="ct-card-text">{c.d}</div>
                  {c.link && <a href={c.link} className="ct-card-link">Open →</a>}
                </div>
              </div>
            ))}
          </div>

          {/* Business hours */}
          <div className="ct-hours reveal">
            <div className="ct-hours-title">🕐 Business Hours</div>
            {[
              ['Monday – Saturday', '9:00 AM – 6:00 PM'],
            ].map(([day, time]) => (
              <div key={day} className="ct-hours-row">
                <span className="day">{day}</span>
                <span className={time === 'Closed' ? 'closed' : 'time'}>{time}</span>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="reveal">
            <div className="ct-socials-title">Follow Us</div>
            <div className="ct-socials">
              {[
                { ic: '📸', label: 'Instagram', href: 'https://www.instagram.com/products_ushas/' },
                { ic: '📘', label: 'Facebook', href: 'https://facebook.com/ushasproducts' },
                { ic: '▶️', label: 'YouTube', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="ct-social">
                  <span className="ct-social-icon">{s.ic}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── FORM SIDE ── */}
        <div className="ct-form-card reveal-right">
          <div className="ct-form-head">
            <h3>Send Us a Message</h3>
            <p>Fill in the form and we'll get back to you within 24 hours.</p>
          </div>
          <div className="ct-form-body">

            {submitted && (
              <div className="ct-success">
                <div className="ct-success-icon">🎉</div>
                <div className="ct-success-title">Message Sent Successfully!</div>
                <div className="ct-success-sub">We'll get back to you within 24 hours. Thank you!</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row2">
                <div className="fg">
                  <div className="fg-label">
                    Your Name <span className="fg-req">*</span>
                    {errors.name && <span className="fg-err">{errors.name}</span>}
                  </div>
                  <input className={`fg-input ${errors.name ? 'err' : ''}`} name="name" placeholder="Anitha Krishnan" value={form.name} onChange={handleChange} />
                </div>
                <div className="fg">
                  <div className="fg-label">Phone</div>
                  <input className="fg-input" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="fg">
                <div className="fg-label">
                  Email <span className="fg-req">*</span>
                  {errors.email && <span className="fg-err">{errors.email}</span>}
                </div>
                <input className={`fg-input ${errors.email ? 'err' : ''}`} type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
              </div>

              <div className="form-row2">
                <div className="fg">
                  <div className="fg-label">Instagram</div>
                  <input className="fg-input" name="instagram" placeholder="@yourhandle" value={form.instagram} onChange={handleChange} />
                </div>
                <div className="fg">
                  <div className="fg-label">Facebook</div>
                  <input className="fg-input" name="facebook" placeholder="facebook.com/you" value={form.facebook} onChange={handleChange} />
                </div>
              </div>

              <div className="fg">
                <div className="fg-label">
                  Subject <span className="fg-req">*</span>
                  {errors.subject && <span className="fg-err">{errors.subject}</span>}
                </div>
                <select className={`fg-input ${errors.subject ? 'err' : ''}`} name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Select a topic…</option>
                  {['Order Enquiry', 'Bulk / Wholesale', 'Product Question', 'Feedback', 'Partnership', 'Other'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <div className="fg-label">
                  Message <span className="fg-req">*</span>
                  {errors.message && <span className="fg-err">{errors.message}</span>}
                </div>
                <textarea
                  className={`fg-input ${errors.message ? 'err' : ''}`}
                  name="message"
                  placeholder="Tell us how we can help you…"
                  value={form.message}
                  onChange={handleChange}
                />
                <div className="fg-meta">{form.message.length} characters</div>
              </div>

              <button
                type="submit"
                className={`ct-submit ${loading ? 'sending' : ''}`}
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" /> Sending…</>
                  : '✉️ Send Message →'
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── FIND US ── */}
      <div className="ct-find reveal">
        <div className="ct-find-kicker">Find Us</div>
        <h2>Visit Our Store</h2>
        <p>Drop by our store in Thrissur — we'd love to meet you in person!</p>
        <div className="ct-map-placeholder">
          <div className="ct-map-icon">📍</div>
          <div className="ct-map-text">Ushas Products, NH 544, Thrissur</div>
          <div className="ct-map-sub">Kerala, India — 680001</div>
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
              {['Snacks', 'Health Foods', 'Oils & Ghee', 'Traditional', 'Organic'].map(c => (
                <li key={c}><Link href={`/shop?category=${c}`}>{c}</Link></li>
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
