/**
 * PaywallModal — upgrade prompt for premium features
 * Shows when free users try to access pro features like Shelf Scan
 */
export default function PaywallModal({ isOpen, onClose, feature = 'this feature' }) {
  if (!isOpen) return null

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      current: true,
      features: [
        'Single item photo listings',
        'AI identification',
        'Copy for 4+ platforms',
        'Market price analysis',
      ],
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: '/month',
      current: false,
      highlight: true,
      features: [
        'Everything in Free',
        '📦 Bulk Scan — multi-item listing',
        'Priority AI processing',
        'Unlimited listings',
        'Early access to new features',
      ],
    },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-[#8B5CF6] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/30">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold text-text-h">Upgrade to Pro</h2>
          <p className="text-sm text-text mt-1">
            Unlock <span className="text-accent font-semibold">{feature}</span> and more
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-4 border transition-all ${
                plan.highlight
                  ? 'bg-accent/5 border-accent/40 shadow-lg shadow-accent/10'
                  : 'bg-surface border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`font-bold ${plan.highlight ? 'text-accent' : 'text-text-h'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-text-h">{plan.price}</span>
                    <span className="text-xs text-text">{plan.period}</span>
                  </div>
                </div>
                {plan.current && (
                  <span className="text-[10px] font-bold bg-text/10 text-text px-2.5 py-1 rounded-full uppercase">
                    Current
                  </span>
                )}
                {plan.highlight && (
                  <span className="text-[10px] font-bold bg-accent/15 text-accent px-2.5 py-1 rounded-full uppercase">
                    Best Value
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text">
                    <svg className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-accent' : 'text-success'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            // TODO: integrate with Stripe or in-app purchase
            alert('Payment integration coming soon! For now, contact the developer to upgrade.')
            onClose()
          }}
          className="w-full bg-gradient-to-r from-accent to-[#8B5CF6] hover:opacity-90 text-white font-bold rounded-xl px-4 py-4 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-accent/30"
        >
          <span>⚡</span>
          Upgrade to Pro — $4.99/mo
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-text hover:text-text-h transition-colors py-2"
        >
          Maybe later
        </button>

        <p className="text-[10px] text-text/30 text-center mt-3">
          Cancel anytime • No commitment
        </p>
      </div>
    </div>
  )
}
