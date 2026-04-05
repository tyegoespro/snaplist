import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import ClipboardImport from '../components/ClipboardImport'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ active: 0, sold: 0, total: 0 })
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, price, status, created_at, listing_photos(storage_path, display_order)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (listings) {
      setStats({
        active: listings.filter((l) => l.status === 'active').length,
        sold: listings.filter((l) => l.status === 'sold').length,
        total: listings.length,
      })
      setRecentListings(listings.slice(0, 5))
    }
    setLoading(false)
  }

  function getPhotoUrl(listing) {
    const photo = listing.listing_photos?.sort(
      (a, b) => a.display_order - b.display_order
    )[0]
    if (!photo) return null
    const { data } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(photo.storage_path)
    return data.publicUrl
  }

  const displayName = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ')[0]
    : user?.email?.split('@')[0]

  return (
    <div className="flex-1 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-text-h">
          Welcome back{displayName ? `, ${displayName}` : ''} 👋
        </h1>
        <p className="mt-1 text-text text-sm">Your listings at a glance</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Active', value: stats.active, color: 'text-success' },
            { label: 'Sold', value: stats.sold, color: 'text-accent' },
            { label: 'Total', value: stats.total, color: 'text-text-h' },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface rounded-xl p-4 border border-border">
              <p className={`text-2xl font-bold ${stat.color}`}>
                {loading ? '—' : stat.value}
              </p>
              <p className="text-xs text-text mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick snap CTA */}
        <button
          onClick={() => navigate('/snap')}
          className="w-full mt-6 bg-gradient-to-r from-accent to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl px-4 py-4 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
          </svg>
          Snap a New Item
        </button>

        {/* Paste a listing CTA */}
        <button
          onClick={() => setShowImport(true)}
          className="w-full mt-3 bg-surface border border-border hover:border-accent/40 text-text-h font-medium rounded-xl px-4 py-4 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          Paste a Listing
        </button>

        {/* Shelf Scan CTA */}
        <button
          onClick={() => navigate('/shelf-scan')}
          className="w-full mt-3 bg-surface border border-accent/20 hover:border-accent/40 text-text-h font-medium rounded-xl px-4 py-4 transition-colors flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-[#8B5CF6]/5 group-hover:from-accent/10 group-hover:to-[#8B5CF6]/10 transition-all" />
          <span className="relative flex items-center gap-2">
            <span className="text-lg">📦</span>
            Shelf Scan
            <span className="text-[9px] font-bold bg-accent/15 text-accent px-1.5 py-0.5 rounded-full uppercase">Pro</span>
          </span>
        </button>

        {/* Clipboard Import Modal */}
        <ClipboardImport
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onImport={(data) => {
            // Navigate to snap page with imported data as URL state
            navigate('/snap', { state: { importedListing: data } })
          }}
        />

        {/* Recent listings */}
        {!loading && recentListings.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-h uppercase tracking-wide">
                Recent Listings
              </h2>
              <button
                onClick={() => navigate('/listings')}
                className="text-xs text-accent hover:text-accent-hover font-medium"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {recentListings.map((listing) => {
                const photoUrl = getPhotoUrl(listing)
                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate('/listings')}
                    className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-accent/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text/20">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-h truncate">{listing.title}</p>
                      {listing.price && (
                        <p className="text-xs text-accent font-semibold">
                          ${parseFloat(listing.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        listing.status === 'active'
                          ? 'bg-success/15 text-success'
                          : listing.status === 'sold'
                          ? 'bg-accent/15 text-accent'
                          : 'bg-text/15 text-text'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && recentListings.length === 0 && (
          <div className="mt-10 text-center">
            <div className="w-16 h-16 mx-auto bg-surface-2 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            </div>
            <p className="text-text-h font-medium">No listings yet</p>
            <p className="text-text text-sm mt-1">Tap the button above to snap your first item</p>
          </div>
        )}
      </div>
    </div>
  )
}
