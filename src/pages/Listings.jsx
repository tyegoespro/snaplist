import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { TappablePhoto } from '../components/PhotoViewer'

const CONDITIONS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const STATUS_STYLES = {
  active: 'bg-success/15 text-success',
  draft: 'bg-success/15 text-success',
  sold: 'bg-accent/15 text-accent',
  expired: 'bg-text/15 text-text',
  deleted: 'bg-danger/15 text-danger',
}

const STATUS_LABELS = {
  active: 'Listed',
  draft: 'Listed',
  sold: 'Sold',
  expired: 'Expired',
  deleted: 'Deleted',
}

export default function Listings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(storage_path, display_order)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      )
    }
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return

    // Delete photos from storage
    const listing = listings.find((l) => l.id === id)
    if (listing?.listing_photos?.length) {
      const paths = listing.listing_photos.map((p) => p.storage_path)
      await supabase.storage.from('listing-photos').remove(paths)
    }

    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== id))
    }
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

  const filtered =
    filter === 'all'
      ? listings
      : filter === 'active'
        ? listings.filter((l) => l.status === 'active' || l.status === 'draft')
        : listings.filter((l) => l.status === filter)

  const counts = {
    all: listings.length,
    active: listings.filter((l) => l.status === 'active' || l.status === 'draft').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  }

  const FILTER_LABELS = {
    all: 'All',
    active: 'Listed',
    sold: 'Sold',
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-text-h">My Listings</h1>
        <p className="mt-1 text-text text-sm">
          {listings.length} item{listings.length !== 1 ? 's' : ''} across all platforms
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text border border-border hover:text-text-h'
              }`}
            >
              {FILTER_LABELS[key] || key} ({count})
            </button>
          ))}
        </div>

        {/* Listings */}
        {filtered.length === 0 ? (
          <div className="mt-10 text-center text-text">
            <p className="text-sm">
              {listings.length === 0
                ? 'No listings yet. Snap a photo to get started!'
                : 'No listings match this filter.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((listing) => {
              const photoUrl = getPhotoUrl(listing)
              return (
                <div
                  key={listing.id}
                  onClick={() => navigate(`/listings/${listing.id}`)}
                  className="bg-surface border border-border rounded-xl p-3 flex gap-3 group cursor-pointer hover:border-accent/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                    {photoUrl ? (
                      <TappablePhoto
                        src={photoUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text/30">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-h truncate">
                        {listing.title}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${
                          STATUS_STYLES[listing.status] || ''
                        }`}
                      >
                        {STATUS_LABELS[listing.status] || listing.status}
                      </span>
                    </div>
                    {listing.price && (
                      <p className="text-accent font-bold text-sm mt-0.5">
                        ${parseFloat(listing.price).toFixed(2)}
                      </p>
                    )}
                    <p className="text-text text-xs mt-0.5 truncate">
                      {listing.condition ? CONDITIONS[listing.condition] : ''}{' '}
                      {listing.category ? `· ${listing.category}` : ''}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      {(listing.status === 'active' || listing.status === 'draft') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(listing.id, 'sold') }}
                          className="text-[11px] font-medium text-success bg-success/10 hover:bg-success/20 px-2 py-0.5 rounded-md transition-colors"
                        >
                          Mark Sold
                        </button>
                      )}
                      {listing.status === 'sold' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(listing.id, 'active') }}
                          className="text-[11px] font-medium text-accent bg-accent/10 hover:bg-accent/20 px-2 py-0.5 rounded-md transition-colors"
                        >
                          Relist
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteListing(listing.id) }}
                        className="text-[11px] font-medium text-danger bg-danger/10 hover:bg-danger/20 px-2 py-0.5 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
