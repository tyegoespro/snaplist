import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

/* ─── SVG Icon Components ─── */
const Icon = ({ children, className = '' }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    {children}
  </svg>
)

const CameraIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
  </Icon>
)

const CpuIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 5.25 8.25v9a2.25 2.25 0 0 0 2.25 2.25Z" />
  </Icon>
)

const SparklesIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </Icon>
)

const RocketIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  </Icon>
)

const ChartIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </Icon>
)

const ShieldIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </Icon>
)

const StackIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
  </Icon>
)

const ClipboardIcon = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
  </Icon>
)

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

/* ─── Data ─── */
const FEATURES = [
  {
    icon: CameraIcon,
    title: 'Snap & Identify',
    desc: 'Point your camera at any item. Our AI identifies brands, materials, condition, and suggests the perfect resale price — in seconds.',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Refinement',
    desc: 'Tell the AI what it missed. Refine brand, model, or condition with a quick message. It learns from your corrections.',
  },
  {
    icon: ChartIcon,
    title: 'Market Analysis',
    desc: 'Instant price comps from eBay sold listings. See average, low, and high prices so you never leave money on the table.',
  },
  {
    icon: ShieldIcon,
    title: 'Brand Verification',
    desc: 'Our AI only confirms brands it can see — no false IDs on knockoffs. Get alerts when branding can\'t be verified.',
  },
  {
    icon: StackIcon,
    title: 'Bulk Shelf Scan',
    desc: 'Photograph an entire shelf. The AI identifies every item and creates individual listings — perfect for estate sales.',
  },
  {
    icon: ClipboardIcon,
    title: 'Cross-Platform Export',
    desc: 'One-tap formatted listings for eBay, Poshmark, Mercari, and Facebook Marketplace. Copy, paste, sell.',
  },
]

const STEPS = [
  { num: '01', title: 'Snap', desc: 'Take photos of your item from multiple angles', icon: CameraIcon },
  { num: '02', title: 'Identify', desc: 'AI analyzes brand, condition, and market value', icon: CpuIcon },
  { num: '03', title: 'Refine', desc: 'Correct anything the AI missed — up to 3 times', icon: SparklesIcon },
  { num: '04', title: 'List', desc: 'Export to any marketplace with one tap', icon: RocketIcon },
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
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
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

          {/* Floating mockup card */}
          <div className="relative max-w-lg mx-auto">
            <div className="relative bg-surface border border-border rounded-3xl p-5 shadow-2xl shadow-black/40">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-800/30 to-amber-600/10 border border-border flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-500/60" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs text-accent font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3" /> AI Identified
                  </div>
                  <div className="text-sm font-bold text-text-h mb-0.5">Coach Signature Canvas Crossbody Bag Brown Leather Trim</div>
                  <div className="text-xs text-text opacity-70">Brand verified &middot; Like new condition</div>
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

            <div className="absolute -top-4 -right-4 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg animate-float">
              <ShieldIcon className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">Brand Verified</span>
            </div>
            <div className="absolute -bottom-3 -left-4 bg-surface border border-border rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg" style={{ animationDelay: '2s', animation: 'float 6s ease-in-out infinite' }}>
              <ChartIcon className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-text-h">3 comps found</span>
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
            {STEPS.map((step, i) => {
              const StepIcon = step.icon
              return (
                <div key={i} className="group relative bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                  <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <StepIcon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">Step {step.num}</div>
                  <h4 className="text-lg font-bold text-text-h mb-2">{step.title}</h4>
                  <p className="text-xs text-text opacity-70 leading-relaxed">{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-1/2 -right-3 text-border text-xl">&rarr;</div>
                  )}
                </div>
              )
            })}
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
            {FEATURES.map((f, i) => {
              const FeatureIcon = f.icon
              return (
                <div
                  key={i}
                  className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
                >
                  <div className="w-11 h-11 mb-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                    <FeatureIcon className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="text-base font-bold text-text-h mb-2">{f.title}</h4>
                  <p className="text-sm text-text opacity-70 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Intelligence Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-6">
                <CpuIcon className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-accent">AI Intelligence</span>
              </div>
              <h3 className="text-3xl font-black text-text-h mb-4">Smarter Than a Guess</h3>
              <p className="text-text leading-relaxed mb-6">
                Our AI doesn&apos;t just describe what it sees — it thinks like a professional reseller.
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
                      <CheckIcon />
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
                  <span className="text-xs bg-danger/20 text-danger font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    Other Apps
                  </span>
                </div>
                <div className="text-sm font-bold text-text-h mb-1">&ldquo;Coach Signature Crossbody Bag&rdquo;</div>
                <div className="text-xs text-text opacity-60 mb-2">No branding visible — guessed from design similarity</div>
                <div className="text-xl font-black text-danger">$350</div>
                <div className="text-[10px] text-danger/60 mt-1">Wrong brand &rarr; overpriced &rarr; returns &amp; complaints</div>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckIcon /> SnapList
                  </span>
                </div>
                <div className="text-sm font-bold text-text-h mb-1">&ldquo;Brown Faux Leather Crossbody Bag Gold-tone Hardware&rdquo;</div>
                <div className="text-xs text-text opacity-60 mb-2">Design reminiscent of Coach — no branding visible</div>
                <div className="text-xl font-black text-green-400">$18</div>
                <div className="text-[10px] text-green-400/60 mt-1">Honest ID &rarr; accurate price &rarr; happy buyers</div>
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
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
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
            &copy; {new Date().getFullYear()} SnapList. Built for resellers, by resellers.
          </p>
        </div>
      </footer>
    </div>
  )
}
