import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress >= 1) clearInterval(timer)
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Landing Page ─── */
export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ background: '#0a0a12', color: '#e2e8f0', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrollY > 50 ? 'rgba(10,10,18,0.85)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(139,92,246,0.1)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Snap<span style={{ color: '#8b5cf6' }}>List</span>
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 16px' }}>
              Log in
            </button>
            <button onClick={() => navigate('/login')} style={{
              background: '#8b5cf6', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
              borderRadius: 12, padding: '10px 20px', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.target.style.background = '#7c3aed'; e.target.style.boxShadow = '0 0 24px rgba(139,92,246,0.3)' }}
              onMouseLeave={e => { e.target.style.background = '#8b5cf6'; e.target.style.boxShadow = 'none' }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 0 }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI-Powered Reselling</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em', color: '#f8fafc' }}>
            Snap it.<br />
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #c084fc, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>List it.</span><br />
            Sell it.
          </h1>

          {/* Subhead */}
          <p style={{ fontSize: 18, lineHeight: 1.7, color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px' }}>
            Turn any item into a marketplace-ready listing in seconds.
            AI identifies brands, suggests prices from real market data,
            and formats your listing for every platform.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 64 }}>
            <button onClick={() => navigate('/login')} style={{
              background: '#8b5cf6', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700,
              borderRadius: 16, padding: '16px 32px', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.target.style.background = '#7c3aed'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(139,92,246,0.35)' }}
              onMouseLeave={e => { e.target.style.background = '#8b5cf6'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
            >
              Start Listing Free →
            </button>
            <a href="#how-it-works" style={{
              display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 16, fontWeight: 500,
              textDecoration: 'none', padding: '16px 8px', transition: 'color 0.2s ease',
            }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="#8b5cf6" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </span>
              See how it works
            </a>
          </div>
        </div>

        {/* Hero Image — full-bleed with gradient fade */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            position: 'relative', borderRadius: 24, overflow: 'hidden',
            border: '1px solid rgba(139,92,246,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.05)',
          }}>
            <img src="/images/landing/hero.png" alt="AI-powered product identification" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a12 0%, transparent 40%)' }} />

            {/* Overlay info card */}
            <div style={{
              position: 'absolute', bottom: 24, left: 24, right: 24,
              background: 'rgba(15,15,25,0.9)', backdropFilter: 'blur(20px)',
              borderRadius: 16, padding: 20,
              border: '1px solid rgba(139,92,246,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <img src="/images/landing/verify.png" alt="Brand detail" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>AI Identified</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>Coach Signature Canvas Crossbody Bag</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Brand verified · Like new condition</div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>AI Price</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#8b5cf6' }}>$89</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Market</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>$95</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Confidence</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}>94%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ borderTop: '1px solid rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.08)', padding: '48px 24px', marginTop: 64 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { value: <AnimatedCounter end={10} suffix="s" />, label: 'Avg Listing Time' },
            { value: <AnimatedCounter end={94} suffix="%" />, label: 'AI Accuracy' },
            { value: <AnimatedCounter end={50} suffix="K+" />, label: 'Items Listed' },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: i === 1 ? '#8b5cf6' : '#f8fafc', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MARKETPLACE LOGO MARQUEE ─── */}
      <section style={{ padding: '48px 0 56px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>List everywhere, instantly</p>
        </div>
        
        {/* Infinite scroll marquee */}
        <div style={{ position: 'relative' }}>
          {/* Edge gradient masks */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #0a0a12, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #0a0a12, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', animation: 'marquee 30s linear infinite', width: 'max-content' }}
            onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
            onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
          >
            {/* Double the items for seamless loop */}
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} style={{ display: 'flex', gap: 40, alignItems: 'center', paddingRight: 40 }}>
                {[
                  { name: 'eBay', src: '/images/logos/ebay.svg', width: 100 },
                  { name: 'Poshmark', src: '/images/logos/poshmark.svg', width: 100 },
                  { name: 'Mercari', src: '/images/logos/mercari.svg', width: 100 },
                  { name: 'Facebook Marketplace', src: '/images/logos/facebook-marketplace.svg', width: 100 },
                  { name: 'Depop', src: '/images/logos/depop.svg', width: 100 },
                  { name: 'OfferUp', src: '/images/logos/offerup.svg', width: 100 },
                  { name: 'Grailed', src: '/images/logos/grailed.svg', width: 100 },
                ].map((platform, i) => (
                  <div key={`${setIdx}-${i}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'default', transition: 'all 0.3s ease',
                    opacity: 0.85,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.85' }}
                  >
                    <img
                      src={platform.src}
                      alt={platform.name}
                      style={{ width: platform.width, height: 'auto', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMAGE SHOWCASE ─── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { src: '/images/landing/step-snap.png', label: 'Sneakers & Shoes' },
              { src: '/images/landing/showcase-electronics.png', label: 'Electronics' },
              { src: '/images/landing/step-identify.png', label: 'Watches & Jewelry' },
              { src: '/images/landing/showcase-vintage.png', label: 'Vintage & Collectibles' },
              { src: '/images/landing/showcase-sneakers.png', label: 'Limited Editions' },
            ].map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease', border: '1px solid rgba(139,92,246,0.1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)' }}
              >
                <img src={img.src} alt={img.label} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,18,0.9) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: '#f8fafc', marginBottom: 12, letterSpacing: '-0.02em' }}>How It Works</h2>
            <p style={{ color: '#94a3b8', maxWidth: 400, margin: '0 auto' }}>From photo to sold in four simple steps</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {[
              { num: '01', title: 'Snap a Photo', desc: 'Point your camera at any item you want to sell — sneakers, watches, electronics, vintage finds, designer bags. SnapList works with everything.', img: '/images/landing/step-snap.png', accent: '#8b5cf6' },
              { num: '02', title: 'AI Identifies Everything', desc: 'Our AI instantly recognizes the brand, model, condition, and current market value. It sees details most sellers miss — from serial numbers to material quality.', img: '/images/landing/step-identify.png', accent: '#a78bfa' },
              { num: '03', title: 'Refine & Perfect', desc: 'Review the AI-generated listing. Edit title, description, pricing — or tell the AI what it missed and it\'ll update instantly. You\'re always in control.', img: '/images/landing/step-refine.png', accent: '#c084fc' },
              { num: '04', title: 'List & Sell', desc: 'One tap to export your polished listing to eBay, Poshmark, Mercari, Facebook Marketplace, Depop, or OfferUp. Formatted perfectly for each platform.', img: '/images/landing/step-list.png', accent: '#e879f9' },
            ].map((step, i) => {
              const imageFirst = i % 2 === 0
              return (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 40,
                  alignItems: 'center',
                }}>
                  {/* Image */}
                  <div style={{ order: imageFirst ? 1 : 2 }}>
                    <div style={{
                      position: 'relative', borderRadius: 16, overflow: 'hidden',
                      border: '1px solid rgba(139,92,246,0.12)',
                    }}>
                      <img src={step.img} alt={step.title} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,18,0.6) 0%, transparent 40%)' }} />
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ order: imageFirst ? 2 : 1, textAlign: imageFirst ? 'left' : 'right' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16,
                      background: `${step.accent}12`, border: `1px solid ${step.accent}25`,
                      borderRadius: 20, padding: '6px 14px',
                    }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: step.accent }}>{step.num}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: step.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step</span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#f8fafc', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, maxWidth: 380, margin: imageFirst ? 0 : '0 0 0 auto' }}>{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section style={{ padding: '80px 24px', background: 'rgba(15,15,25,0.4)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: '#f8fafc', marginBottom: 12, letterSpacing: '-0.02em' }}>Built for Resellers</h2>
            <p style={{ color: '#94a3b8', maxWidth: 480, margin: '0 auto' }}>Every feature designed to help you list faster, price smarter, and sell more</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { title: 'Snap & Identify', desc: 'Point your camera at any item. AI identifies brands, materials, condition, and suggests the perfect resale price.', icon: 'M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z' },
              { title: 'AI Refinement', desc: 'Tell the AI what it missed. Refine brand, model, or condition with a quick message. It learns from your corrections.', icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z' },
              { title: 'Market Analysis', desc: 'Instant price comps from eBay sold listings. See average, low, and high prices so you never leave money on the table.', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
              { title: 'Brand Verification', desc: "Our AI only confirms brands it can see — no false IDs on knockoffs. Get alerts when branding can't be verified.", icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
              { title: 'Bulk Shelf Scan', desc: 'Photograph an entire shelf. The AI identifies every item and creates individual listings — perfect for estate sales.', icon: 'M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3' },
              { title: 'Cross-Platform', desc: 'One-tap formatted listings for eBay, Poshmark, Mercari, and Facebook Marketplace. Copy, paste, sell.', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(15,15,25,0.6)', border: '1px solid rgba(139,92,246,0.08)',
                borderRadius: 20, padding: 28, transition: 'all 0.2s ease', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8b5cf6"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI INTELLIGENCE SECTION ─── */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 48, alignItems: 'center' }}>
          {/* Copy side */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 999, padding: '6px 14px', marginBottom: 24,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8b5cf6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 5.25 8.25v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>AI Intelligence</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#f8fafc', marginBottom: 16, letterSpacing: '-0.02em' }}>Smarter Than a Guess</h2>
            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 }}>
              Our AI doesn't just describe what it sees — it thinks like a professional reseller.
              It verifies brands from visible logos, warns you about potential knockoffs,
              and prices items based on what they <em>actually are</em>, not what they look like.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Only confirms brands with visible proof',
                'Flags knockoffs & inspired-by designs',
                'Suggests photos for brand verification',
                'Prices unbranded items honestly',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#94a3b8' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="#8b5cf6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* AI image */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)' }}>
              <img src="/images/landing/ai-brain.png" alt="AI neural network analyzing product categories" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,18,0.7) 0%, transparent 40%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16, fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>Identifies Any Product Category</div>
            </div>

            {/* Comparison cards */}
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.15)', borderRadius: 999, padding: '4px 10px' }}>✕ Other Apps</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>"Coach Signature Crossbody Bag"</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>No branding visible — guessed from design similarity</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444', marginTop: 8 }}>$350</div>
              <div style={{ fontSize: 10, color: 'rgba(239,68,68,0.6)', marginTop: 4 }}>Wrong brand → overpriced → returns & complaints</div>
            </div>

            <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.15)', borderRadius: 999, padding: '4px 10px' }}>✓ SnapList</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>"Brown Faux Leather Crossbody Bag Gold-tone Hardware"</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Design reminiscent of Coach — no branding visible</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', marginTop: 8 }}>$18</div>
              <div style={{ fontSize: 10, color: 'rgba(74,222,128,0.6)', marginTop: 4 }}>Honest ID → accurate price → happy buyers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(15,15,25,0.8), rgba(139,92,246,0.05))',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 24, padding: '64px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: '#f8fafc', marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to flip faster?</h2>
              <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
                Join resellers who list items in seconds, not minutes. Start free — no credit card required.
              </p>
              <button onClick={() => navigate('/login')} style={{
                background: '#8b5cf6', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700,
                borderRadius: 16, padding: '16px 40px', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.target.style.background = '#7c3aed'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(139,92,246,0.35)' }}
                onMouseLeave={e => { e.target.style.background = '#8b5cf6'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
              >
                Start Listing Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid rgba(139,92,246,0.08)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>
            Snap<span style={{ color: '#8b5cf6' }}>List</span>
          </span>
          <span style={{ fontSize: 12, color: '#475569' }}>
            © {new Date().getFullYear()} SnapList. Built for resellers, by resellers.
          </span>
        </div>
      </footer>

      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes timelineGlow {
          0% { left: 0%; }
          100% { left: calc(100% - 80px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        * { box-sizing: border-box; margin: 0; }
        img { -webkit-user-drag: none; }
        /* Hide scrollbar for horizontal scroller */
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 480px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
