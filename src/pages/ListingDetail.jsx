import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { formatForPlatform, copyForPlatform } from '../lib/clipboardFormatter'
import { PLATFORMS } from '../lib/platforms'

const CONDITIONS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState(null)

  useEffect(() => {
    fetchListing()
  }, [id])

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(id, storage_path, display_order)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      navigate('/listings')
      return
    }
    setListing(data)
    setForm({
      title: data.title || '',
      description: data.description || '',
      price: data.price?.toString() || '',
      condition: data.condition || 'good',
      category: data.category || '',
    })
    setLoading(false)
  }

  function getPhotoUrl(photo) {
    const { data } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(photo.storage_path)
    return data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('listings')
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price ? parseFloat(form.price) : null,
        condition: form.condition,
        category: form.category.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!error) {
      setListing((prev) => ({ ...prev, ...form, price: form.price ? parseFloat(form.price) : null }))
      setEditing(false)
    }
    setSaving(false)
  }

  async function updateStatus(status) {
    const { error } = await supabase
      .from('listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setListing((prev) => ({ ...prev, status }))
    }
  }

  async function deleteListing() {
    if (!confirm('Delete this listing permanently?')) return

    if (listing.listing_photos?.length) {
      const paths = listing.listing_photos.map((p) => p.storage_path)
      await supabase.storage.from('listing-photos').remove(paths)
    }

    await supabase.from('listings').delete().eq('id', id)
    navigate('/listings')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const photos = (listing.listing_photos || []).sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/listings')}
            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text hover:text-text-h transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-h truncate">{listing.title}</h1>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
              (listing.status === 'active' || listing.status === 'draft') ? 'bg-success/15 text-success'
              : listing.status === 'sold' ? 'bg-accent/15 text-accent'
              : 'bg-text/15 text-text'
            }`}>
              {listing.status === 'active' || listing.status === 'draft' ? 'Listed' : listing.status === 'sold' ? 'Sold' : listing.status}
            </span>
          </div>
        </div>

        {/* Photos */}
        {photos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={getPhotoUrl(photo)}
                alt=""
                className="w-full max-w-[300px] h-56 object-cover rounded-xl border border-border flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-48 bg-surface-2 rounded-xl flex items-center justify-center text-text/30 mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}

        {/* Details or Edit Form */}
        {editing ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-text font-medium uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-text font-medium uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text font-medium uppercase tracking-wide">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text font-medium uppercase tracking-wide">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-text font-medium uppercase tracking-wide">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-surface border border-border text-text-h font-medium rounded-xl px-4 py-3 hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Price */}
            {listing.price && (
              <p className="text-2xl font-bold text-accent">
                ${parseFloat(listing.price).toFixed(2)}
              </p>
            )}

            {/* Description */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-xs text-text font-medium uppercase tracking-wide mb-2">Description</h3>
              <p className="text-text-h text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description || 'No description'}
              </p>
            </div>

            {/* Details grid */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs text-text font-medium uppercase tracking-wide mb-2">Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-text">Condition</span>
                <span className="text-text-h">{CONDITIONS[listing.condition] || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text">Category</span>
                <span className="text-text-h">{listing.category || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text">Listed</span>
                <span className="text-text-h">
                  {new Date(listing.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Post to Platform — clipboard export */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-xs text-text font-medium uppercase tracking-wide mb-3">Post to Platform</h3>
              <p className="text-xs text-text/60 mb-3">Tap to copy your listing, then paste it in the app.</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PLATFORMS)
                  .filter(([, cfg]) => cfg.clipboardOnly)
                  .map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={async () => {
                        const ok = await copyForPlatform(key, {
                          title: listing.title,
                          description: listing.description,
                          price: listing.price,
                          condition: listing.condition,
                          category: listing.category,
                          brand: listing.ai_data?.brand,
                          size: listing.ai_data?.size,
                        })
                        if (ok) {
                          setCopiedPlatform(key)
                          setTimeout(() => setCopiedPlatform(null), 2500)
                        }
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                        copiedPlatform === key
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-bg border border-border hover:border-accent/40 text-text-h'
                      }`}
                    >
                      {copiedPlatform === key ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <span className="text-base">{cfg.icon || '📋'}</span>
                          {cfg.name}
                        </>
                      )}
                    </button>
                  ))}
              </div>
              {copiedPlatform && PLATFORMS[copiedPlatform]?.deepLink && (
                <a
                  href={PLATFORMS[copiedPlatform].deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-accent/20 transition-colors"
                >
                  Open {PLATFORMS[copiedPlatform].name} →
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 bg-surface border border-border text-text-h font-medium rounded-xl px-4 py-3 hover:bg-surface-2 transition-colors"
              >
                ✏️ Edit
              </button>
              {(listing.status === 'active' || listing.status === 'draft') ? (
                <button
                  onClick={() => updateStatus('sold')}
                  className="flex-1 bg-success/15 text-success font-medium rounded-xl px-4 py-3 hover:bg-success/25 transition-colors"
                >
                  ✅ Mark Sold
                </button>
              ) : listing.status === 'sold' ? (
                <button
                  onClick={() => updateStatus('active')}
                  className="flex-1 bg-accent/15 text-accent font-medium rounded-xl px-4 py-3 hover:bg-accent/25 transition-colors"
                >
                  🔄 Relist
                </button>
              ) : null}
            </div>
            <button
              onClick={deleteListing}
              className="w-full text-danger border border-danger/30 hover:bg-danger/10 font-medium rounded-xl px-4 py-3 transition-colors"
            >
              🗑 Delete Listing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
