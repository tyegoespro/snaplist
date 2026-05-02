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

/* ─── Floating Decorative Element ─── */
function FloatingElement({ children, style, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute',
      animation: `floatBounce 6s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 2,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── CSS Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div style={{
      display: 'inline-flex',
      alignSelf: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: 360,
      transform: 'rotate(1.5deg)',
      userSelect: 'none',
      pointerEvents: 'none',
    }}>
      {/* ── Floating decorative elements ── */}

      {/* Yellow speech bubble - top right (like Honk's yellow bubble) */}
      <FloatingElement style={{ top: '-8%', right: '-25%', width: 140 }} delay={0}>
        <svg viewBox="0 0 200 163" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M140.754 19.4227C140.754 19.4227 79.537 9.77916 79.3753 9.75456C47.6669 5.0963 17.8676 27.0281 13.0473 58.7145C8.52209 88.4609 26.3082 116.143 54.5904 123.754L116.777 133.545L114.982 145.346C114.834 146.316 114.849 147.311 115.186 148.355C115.523 149.398 116.072 150.143 116.781 150.913C117.491 151.683 118.412 152.153 119.357 152.463C120.303 152.772 121.459 152.782 122.316 152.582C122.988 152.519 137.142 149.71 152.467 140.297C173.07 127.718 185.868 108.824 189.361 85.8671C194.529 54.0682 172.599 24.2672 140.754 19.4227Z" fill="#fde68a"/>
          <g opacity="0.3">
            <path d="M96.6 36.8C88.6 35.3 80.8 40.6 79.3 48.6C79 50.5 79 52.5 79.4 54.4C71.2 54.4 64.6 61.2 64.8 69.4C64.8 75.7 69 81.2 74.9 83.3C70.9 90.4 73.3 99.5 80.5 103.5C86.1 106.7 93.2 105.9 97.9 101.5C102 108.7 111 111.1 118.1 107.1C123.7 103.9 126.6 97.5 125.3 91.2C133.5 91.2 140.1 84.4 140 76.2C139.9 70.6 136.7 65.4 131.5 63C135.3 55.7 132.4 46.8 125.1 43C119.3 40 112.3 41.1 107.8 45.7C105.7 41.1 101.6 37.7 96.6 36.8Z" fill="#5b21b6"/>
          </g>
        </svg>
      </FloatingElement>

      {/* Light blue/lilac speech bubble - bottom left (like Honk's blue bubble) */}
      <FloatingElement style={{ top: '58%', left: '-28%', width: 140 }} delay={1.5}>
        <svg viewBox="0 0 188 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M57.9 8.6C57.9 8.6 119.7 4 119.9 4C151.9 2 179.8 26.3 182 58.2C184 88.3 164 114.4 135.2 119.6L72.4 124.3L73.3 136.2C73.4 137.2 73.2 138.2 72.8 139.2C72.4 140.2 71.8 140.9 71 141.6C70.2 142.3 69.3 142.7 68.3 142.9C67.4 143.2 66.2 143.1 65.4 142.8C64.7 142.7 50.8 138.7 36.3 128.1C16.8 113.9 5.6 94 4 70.8C1.5 38.7 25.8 10.8 57.9 8.6Z" fill="#c4b5fd" fillOpacity="0.85"/>
          <g opacity="0.3">
            <path d="M128.6 49.3C126.7 41.2 120.3 35.3 112.3 34.1C104.4 32.9 96.5 37.1 92.8 44.5C92.4 45.3 92 46.1 91.5 47.1C90.9 46.1 90.4 45.4 89.9 44.7C85.1 37.9 76.7 34.8 69.1 37.1C61.4 39.3 55.8 46.1 55 54.4C54.5 60 56 65.2 58.5 70C62.8 78.2 69 84.4 75.9 89.9C80.3 93 86.9 97.6 94.9 97.2C102.9 96.5 108.8 91.1 112.8 87.3C118.9 81 124.2 73.9 127.3 65.3C129.1 60.1 129.9 54.8 128.6 49.3Z" fill="#4c1d95"/>
          </g>
        </svg>
      </FloatingElement>

      {/* Floating circles */}
      <FloatingElement style={{ top: '6%', left: '-12%' }} delay={0.5}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </FloatingElement>

      <FloatingElement style={{ top: '48%', right: '-8%' }} delay={2}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
      </FloatingElement>

      <FloatingElement style={{ top: '88%', left: '-8%' }} delay={3}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </FloatingElement>

      {/* ── THE PHONE ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '390 / 800',
        background: '#1a1a2e',
        borderRadius: 48,
        padding: 12,
        boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        {/* Phone screen area */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 38,
          overflow: 'hidden',
          background: '#0f1016',
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40%',
            height: 28,
            background: '#1a1a2e',
            borderRadius: '0 0 18px 18px',
            zIndex: 10,
          }} />

          {/* Status bar indicators */}
          <div style={{
            position: 'absolute',
            top: 6,
            left: 24,
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            zIndex: 11,
          }}>
            9:41
          </div>
          <div style={{
            position: 'absolute',
            top: 7,
            right: 20,
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            zIndex: 11,
          }}>
            {/* Signal bars */}
            <svg width="14" height="10" viewBox="0 0 17 11" fill="rgba(255,255,255,0.8)">
              <rect x="0" y="7" width="3" height="4" rx="0.5"/>
              <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.5"/>
              <rect x="9" y="2" width="3" height="9" rx="0.5"/>
              <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
            </svg>
            {/* Battery */}
            <svg width="22" height="10" viewBox="0 0 25 12" fill="rgba(255,255,255,0.8)">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="rgba(255,255,255,0.3)" fill="none"/>
              <rect x="2" y="2" width="17" height="8" rx="1" fill="rgba(255,255,255,0.8)"/>
              <rect x="22.5" y="3.5" width="2" height="5" rx="0.5"/>
            </svg>
          </div>

          {/* App screen UI (rendered in JSX) */}
          <div style={{
            width: '100%',
            height: '100%',
            background: '#0f1016',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 11,
            color: '#e2e8f0',
            overflow: 'hidden',
          }}>
            {/* Product photo area */}
            <div style={{ position: 'relative', flex: '0 0 40%', overflow: 'hidden' }}>
              <img
                src="/images/landing/hero.png"
                alt="Product scan"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Scanning overlay effect */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 60%, #0f1016 100%)',
              }} />
              {/* Back button */}
              <div style={{
                position: 'absolute', top: 32, left: 12,
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </div>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* AI Badge */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: '#fde68a',
                  background: 'rgba(139,92,246,0.3)', borderRadius: 10, padding: '3px 10px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  ✨ AI Identified
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', textAlign: 'center', lineHeight: 1.2 }}>
                Coach Signature Canvas Crossbody
              </div>

              {/* Price */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#8b5cf6' }}>$89</div>
                <div style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>Suggested: $85–$105</div>
              </div>

              {/* Condition */}
              <div>
                <div style={{ fontSize: 8, color: '#64748b', marginBottom: 3, fontWeight: 600 }}>Condition</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  {['New', 'Like New', 'Good', 'Fair'].map((c, i) => (
                    <span key={i} style={{
                      fontSize: 7, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
                      background: i === 1 ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                      color: i === 1 ? '#fff' : '#64748b',
                      border: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    }}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Market data row */}
              <div style={{
                display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4,
              }}>
                {[
                  { label: 'Market', value: '$95', color: '#f8fafc' },
                  { label: 'Confidence', value: '94%', color: '#4ade80' },
                  { label: 'Demand', value: 'High', color: '#fbbf24' },
                ].map((d, i) => (
                  <div key={i} style={{
                    textAlign: 'center', flex: 1,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '4px 0',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: 6, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: d.color }}>{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Description preview */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 8, color: '#64748b', marginBottom: 2, fontWeight: 600 }}>Description</div>
                <div style={{
                  fontSize: 7, color: '#94a3b8', lineHeight: 1.4,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 6, padding: '5px 8px',
                }}>
                  Authentic Coach Signature Canvas Crossbody bag in excellent condition. Features signature C pattern canvas with leather trim...
                </div>
              </div>

              {/* CTA Button */}
              <div style={{ marginTop: 'auto', paddingBottom: 8 }}>
                <div style={{
                  background: '#8b5cf6', borderRadius: 10, padding: '8px 0',
                  textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  List on eBay
                </div>
                <div style={{
                  textAlign: 'center', fontSize: 8, color: '#64748b', marginTop: 3, fontWeight: 500,
                }}>
                  + 5 more platforms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side button (right side) */}
        <div style={{
          position: 'absolute',
          right: -2.5,
          top: '28%',
          width: 3,
          height: 70,
          background: '#2a2a40',
          borderRadius: '0 3px 3px 0',
        }} />

        {/* Volume buttons (left side) */}
        <div style={{
          position: 'absolute',
          left: -2.5,
          top: '20%',
          width: 3,
          height: 28,
          background: '#2a2a40',
          borderRadius: '3px 0 0 3px',
        }} />
        <div style={{
          position: 'absolute',
          left: -2.5,
          top: '28%',
          width: 3,
          height: 50,
          background: '#2a2a40',
          borderRadius: '3px 0 0 3px',
        }} />
        <div style={{
          position: 'absolute',
          left: -2.5,
          top: '36%',
          width: 3,
          height: 50,
          background: '#2a2a40',
          borderRadius: '3px 0 0 3px',
        }} />
      </div>
    </div>
  )
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

      {/* ─── HERO SECTION — Full Viewport, Vibrant ─── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 25%, #7c3aed 50%, #8b5cf6 75%, #a78bfa 100%)',
        padding: '0 24px',
      }}>
        {/* Subtle radial overlay for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}/>

        <div style={{
          maxWidth: 980, width: '100%', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0,
          position: 'relative', zIndex: 10,
        }}
          className="hero-two-col"
        >
          {/* ── LEFT COLUMN: Text Content ── */}
          <div style={{ flex: '0 0 58%', maxWidth: '58%', paddingTop: 40, paddingBottom: 40 }} className="hero-left">
            {/* Logo */}
            <div style={{ marginBottom: 32 }}>
              <span style={{
                fontSize: 24, fontWeight: 900, color: '#fff',
                letterSpacing: '-0.02em',
              }}>
                Snap<span style={{ color: '#fde68a' }}>List</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(44px, 9vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
              color: '#fff',
            }}>
              <span style={{
                display: 'block',
                color: '#fde68a',
              }}>
                Snap it.
              </span>
              <span style={{ display: 'block' }}>
                List it.
              </span>
              <span style={{ display: 'block' }}>
                Sell it.
              </span>
            </h1>

            {/* Subhead */}
            <p style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              maxWidth: 420,
              margin: '0 0 32px',
            }}>
              Turn any item into a marketplace-ready listing in seconds.
              AI identifies brands, suggests prices, and formats for every platform.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#fff', color: '#5b21b6',
                fontSize: 16, fontWeight: 700,
                borderRadius: 14, padding: '14px 28px',
                border: 'none', cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)'
              }}
            >
              Start Listing Free
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Already have an account link */}
            <div style={{ marginTop: 14 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '4px 0',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              >
                Already have an account? Log in →
              </button>
            </div>

            {/* Marketplace logos strip */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', opacity: 0.6 }}>
              {[
                { name: 'eBay', src: '/images/logos/ebay.svg' },
                { name: 'Poshmark', src: '/images/logos/poshmark.svg' },
                { name: 'Mercari', src: '/images/logos/mercari.svg' },
                { name: 'Depop', src: '/images/logos/depop.svg' },
              ].map((p, i) => (
                <img key={i} src={p.src} alt={p.name} style={{ height: 20, width: 'auto', filter: 'brightness(10)', opacity: 0.7 }} />
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Phone Mockup ── */}
          <div style={{ flex: '0 0 42%', maxWidth: '42%', textAlign: 'right' }} className="hero-right">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ borderBottom: '1px solid rgba(139,92,246,0.08)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { value: <AnimatedCounter end={10} suffix="s" />, label: 'Avg Listing Time' },
            { value: <AnimatedCounter end={94} suffix="%" />, label: 'AI Accuracy' },
            { value: <AnimatedCounter end={50} suffix="K+" />, label: 'Items Listed' },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: i === 1 ? '#8b5cf6' : '#f8fafc', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT YOU CAN SNAP ─── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Works with everything</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#f8fafc', marginBottom: 32, letterSpacing: '-0.02em' }}>What can you snap?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {[
              { emoji: '👟', label: 'Sneakers' },
              { emoji: '⌚', label: 'Watches' },
              { emoji: '📱', label: 'Electronics' },
              { emoji: '👜', label: 'Designer Bags' },
              { emoji: '🎮', label: 'Gaming' },
              { emoji: '📀', label: 'Vinyl' },
              { emoji: '🏺', label: 'Antiques' },
              { emoji: '💍', label: 'Jewelry' },
              { emoji: '🧥', label: 'Streetwear' },
              { emoji: '📷', label: 'Cameras' },
              { emoji: '🎸', label: 'Instruments' },
              { emoji: '🪑', label: 'Furniture' },
              { emoji: '🎨', label: 'Art' },
              { emoji: '📚', label: 'Books' },
              { emoji: '🧸', label: 'Toys' },
              { emoji: '⚾', label: 'Sports Cards' },
            ].map((cat, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 40,
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.12)',
                cursor: 'default', transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{cat.label}</span>
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
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(91,33,182,0.2), rgba(139,92,246,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 24, padding: '64px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
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

      {/* ─── Keyframe injection + responsive styles ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; }
        img { -webkit-user-drag: none; }
        div::-webkit-scrollbar { display: none; }

        @keyframes floatBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Responsive: hero two-column layout */
        .hero-two-col {
          display: flex !important;
          flex-direction: row !important;
        }

        @media (max-width: 810px) {
          .hero-two-col {
            flex-direction: column !important;
            text-align: center;
          }
          .hero-left {
            flex: 1 1 auto !important;
            max-width: 100% !important;
            padding-top: 100px !important;
            padding-bottom: 0 !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-left p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-right {
            flex: 1 1 auto !important;
            max-width: 320px !important;
            margin: 0 auto -6rem;
            text-align: center !important;
          }
          section > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .hero-right {
            max-width: 260px !important;
          }
          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}
      </style>
    </div>
  )
}
