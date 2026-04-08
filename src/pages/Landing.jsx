import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: '📸',
    title: 'Snap & Identify',
    desc: 'Point your camera at any item. Our AI identifies brands, materials, condition, and suggests the perfect resale price — in seconds.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Refinement',
    desc: 'Tell the AI what it missed. Refine brand, model, or condition with a quick message. It learns from your corrections.',
  },
  {
    icon: '📊',
    title: 'Market Analysis',
    desc: 'Instant price comps from eBay sold listings. See average, low, and high prices so you never leave money on the table.',
  },
  {
    icon: '🔍',
    title: 'Brand Verification',
    desc: 'Our AI only confirms brands it can see — no false IDs on knockoffs. Get alerts when branding can\'t be verified.',
  },
  {
    icon: '📦',
    title: 'Bulk Shelf Scan',
    desc: 'Photograph an entire shelf. The AI identifies every item and creates individual listings — perfect for estate sales.',
  },
  {
    icon: '📋',
    title: 'Cross-Platform Export',
    desc: 'One-tap formatted listings for eBay, Poshmark, Mercari, and Facebook Marketplace. Copy, paste, sell.',
  },
]

const STEPS = [
  { num: '01', title: 'Snap', desc: 'Take photos of your item from multiple angles', icon: '📷' },
  { num: '02', title: 'Identify', desc: 'AI analyzes brand, condition, and market value', icon: '🧠' },
  { num: '03', title: 'Refine', desc: 'Correct anything the AI missed — up to 3 times', icon: '✨' },
  { num: '04', title: 'List', desc: 'Export to any marketplace with one tap', icon: '🚀' },
]

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

export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-bg/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/10' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-h tracking-tight">
            Snap<span className="text-accent">List</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-text hover:text-text-h transition-colors font-medium px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-sm bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-5 py-2.5 transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">AI-Powered Reselling</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-text-h leading-[1.05] mb-6 tracking-tight">
            Snap it.<br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-accent bg-clip-text text-transparent">List it.</span><br />
            Sell it.
          </h2>

          <p className="text-lg sm:text-xl text-text max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn any item into a marketplace-ready listing in seconds. 
            AI identifies brands, suggests prices from real market data, 
            and formats your listing for every platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/login')}
              className="group bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl px-8 py-4 text-lg transition-all hover:shadow-xl hover:shadow-accent/30 active:scale-95 w-full sm:w-auto"
            >
              Start Listing Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a
              href="#how-it-works"
              className="text-text hover:text-text-h font-medium flex items-center gap-2 transition-colors py-4"
            >
              <span className="w-10 h-10 bg-surface-2 border border-border rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </span>
              See how it works
            </a>
          </div>

          {/* Floating mockup cards */}
          <div className="relative max-w-lg mx-auto">
            <div className="relative bg-surface border border-border rounded-3xl p-5 shadow-2xl shadow-black/40">
              {/* Fake listing card */}
              <div className="flex gap-4 items-start mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-800/30 to-amber-600/10 border border-border flex items-center justify-center text-3xl">
                  👜
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-accent font-bold uppercase tracking-wider mb-1">✨ AI Identified</div>
                  <div className="text-sm font-bold text-text-h mb-0.5">Coach Signature Canvas Crossbody Bag Brown Leather Trim</div>
                  <div className="text-xs text-text opacity-70">Brand verified • Like new condition</div>
                </div>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-surface-2 rounded-xl p-3 text-center border border-border/50">
                  <div className="text-[10px] text-text uppercase tracking-tight opacity-60">AI Price</div>
                  <div className="text-lg font-black text-accent">$89</div>
                </div>
                <div className="flex-1 bg-surface-2 rounded-xl p-3 text-center border border-border/50">
                  <div className="text-[10px] text-text uppercase tracking-tight opacity-60">Market Avg</div>
                  <div className="text-lg font-bold text-text-h">$95</div>
                </div>
                <div className="flex-1 bg-surface-2 rounded-xl p-3 text-center border border-border/50">
                  <div className="text-[10px] text-text uppercase tracking-tight opacity-60">Confidence</div>
                  <div className="text-lg font-bold text-green-400">94%</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-accent/10 border border-accent/20 rounded-xl py-2 text-center text-xs font-bold text-accent">eBay</div>
                <div className="flex-1 bg-accent/10 border border-accent/20 rounded-xl py-2 text-center text-xs font-bold text-accent">Poshmark</div>
                <div className="flex-1 bg-accent/10 border border-accent/20 rounded-xl py-2 text-center text-xs font-bold text-accent">Mercari</div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-green-400 shadow-lg animate-float">
              ✅ Brand Verified
            </div>
            <div className="absolute -bottom-3 -left-4 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-h shadow-lg" style={{ animationDelay: '2s', animation: 'float 6s ease-in-out infinite' }}>
              📊 3 comps found
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-surface/50 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-text-h mb-1">
              <AnimatedCounter end={10} suffix="s" />
            </div>
            <div className="text-xs sm:text-sm text-text opacity-60 uppercase tracking-wider">Avg listing time</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-accent mb-1">
              <AnimatedCounter end={94} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-text opacity-60 uppercase tracking-wider">ID accuracy</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-text-h mb-1">
              <AnimatedCounter end={6} />
            </div>
            <div className="text-xs sm:text-sm text-text opacity-60 uppercase tracking-wider">Platforms supported</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-black text-text-h mb-4">How It Works</h3>
            <p className="text-text max-w-md mx-auto">From photo to sold in four simple steps</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="group relative bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">Step {step.num}</div>
                <h4 className="text-lg font-bold text-text-h mb-2">{step.title}</h4>
                <p className="text-xs text-text opacity-70 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 text-border text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-black text-text-h mb-4">Built for Resellers</h3>
            <p className="text-text max-w-lg mx-auto">Every feature designed to help you list faster, price smarter, and sell more</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h4 className="text-base font-bold text-text-h mb-2">{f.title}</h4>
                <p className="text-sm text-text opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Intelligence Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-6">
                <span className="text-xs font-semibold text-accent">🧠 AI Intelligence</span>
              </div>
              <h3 className="text-3xl font-black text-text-h mb-4">Smarter Than a Guess</h3>
              <p className="text-text leading-relaxed mb-6">
                Our AI doesn't just describe what it sees — it thinks like a professional reseller. 
                It verifies brands from visible logos, warns you about potential knockoffs, 
                and prices items based on what they <em>actually are</em>, not what they look like.
              </p>
              <ul className="space-y-3">
                {[
                  'Only confirms brands with visible proof',
                  'Flags knockoffs & inspired-by designs',
                  'Suggests photos for brand verification',
                  'Prices unbranded items honestly',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text">
                    <span className="w-5 h-5 bg-accent/15 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI comparison card */}
            <div className="space-y-4">
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-danger/20 text-danger font-bold px-2 py-0.5 rounded-full">❌ Other Apps</span>
                </div>
                <div className="text-sm font-bold text-text-h mb-1">"Coach Signature Crossbody Bag"</div>
                <div className="text-xs text-text opacity-60 mb-2">No branding visible — guessed from design similarity</div>
                <div className="text-xl font-black text-danger">$350</div>
                <div className="text-[10px] text-danger/60 mt-1">Wrong brand → overpriced → returns & complaints</div>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">✅ SnapList</span>
                </div>
                <div className="text-sm font-bold text-text-h mb-1">"Brown Faux Leather Crossbody Bag Gold-tone Hardware"</div>
                <div className="text-xs text-text opacity-60 mb-2">Design reminiscent of Coach — no branding visible</div>
                <div className="text-xl font-black text-green-400">$18</div>
                <div className="text-[10px] text-green-400/60 mt-1">Honest ID → accurate price → happy buyers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-accent/10 via-surface to-purple-500/10 border border-accent/20 rounded-3xl p-12 sm:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-black text-text-h mb-4">
                Ready to flip faster?
              </h3>
              <p className="text-text mb-8 max-w-md mx-auto">
                Join resellers who list items in seconds, not minutes. 
                Start free — no credit card required.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="group bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl px-10 py-4 text-lg transition-all hover:shadow-xl hover:shadow-accent/30 active:scale-95"
              >
                Start Listing Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-text-h">
            Snap<span className="text-accent">List</span>
          </div>
          <p className="text-xs text-text opacity-50">
            © {new Date().getFullYear()} SnapList. Built for resellers, by resellers.
          </p>
        </div>
      </footer>
    </div>
  )
}
