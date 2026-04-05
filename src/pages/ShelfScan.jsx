import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useSubscription } from '../lib/useSubscription'
import PaywallModal from '../components/PaywallModal'

/**
 * ShelfScan — bulk item detection from a single photo
 * Takes one wide photo of a shelf/pile, AI identifies multiple items,
 * user reviews each, then batch-saves them as individual listings.
 */
export default function ShelfScan() {
  const { user } = useAuth()
  const { isPro, loading: subLoading } = useSubscription()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('upload') // upload | scanning | review
  const [items, setItems] = useState([]) // Array of detected items
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)

  // Check subscription on mount
  useEffect(() => {
    if (!subLoading && !isPro) {
      setShowPaywall(true)
    }
  }, [subLoading, isPro])

  const cameraRef = useRef()

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function scanShelf() {
    if (!photo) return
    setStep('scanning')
    setError(null)

    try {
      // Compress image before sending (phone cameras produce huge files)
      const base64 = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 1200 // max dimension
          let w = img.width, h = img.height
          if (w > h && w > MAX) { h = h * MAX / w; w = MAX }
          else if (h > MAX) { w = w * MAX / h; h = MAX }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = reject
        img.src = URL.createObjectURL(photo)
      })

      // Call the Edge Function with shelf-scan mode
      const { data, error: fnError } = await supabase.functions.invoke('ai-identify', {
        body: {
          images: [base64],
          mode: 'shelf-scan',
        },
      })

      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      // Expect an array of items
      const detectedItems = Array.isArray(data) ? data : data?.items || [data]
      setItems(detectedItems)
      setSelectedItems(new Set(detectedItems.map((_, i) => i)))
      setStep('review')
    } catch (err) {
      console.error('Shelf scan error:', err)
      setError(err.message || 'Failed to scan shelf. Try again.')
      setStep('upload')
    }
  }

  async function saveSelected() {
    if (selectedItems.size === 0) return
    setSaving(true)
    setError(null)

    try {
      const selectedList = items.filter((_, i) => selectedItems.has(i))

      for (const item of selectedList) {
        const { error: insertErr } = await supabase
          .from('listings')
          .insert({
            user_id: user.id,
            title: item.title || 'Untitled Item',
            description: item.description || '',
            price: item.price ? parseFloat(item.price) : null,
            condition: item.condition || 'good',
            category: item.category || null,
            status: 'draft',
            ai_data: item,
          })

        if (insertErr) {
          console.error('Failed to save item:', insertErr)
        }
      }

      navigate('/listings')
    } catch (err) {
      setError(err.message || 'Failed to save items')
    } finally {
      setSaving(false)
    }
  }

  function toggleItem(index) {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  function resetAll() {
    setPhoto(null)
    setPreview(null)
    setItems([])
    setSelectedItems(new Set())
    setStep('upload')
    setError(null)
  }

  // --- UPLOAD STEP ---
  if (step === 'upload') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent/20 to-[#8B5CF6]/20 border-2 border-dashed border-accent/50 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">📦</span>
          </div>
          <h2 className="text-xl font-bold text-text-h">Shelf Scan</h2>
          <p className="text-text text-sm mt-2 mb-6">
            Take one photo of a shelf, table, or pile. AI will identify every item and create individual listings.
          </p>

          {preview ? (
            <div className="mb-6">
              <img
                src={preview}
                alt="Shelf photo"
                className="w-full h-48 object-cover rounded-2xl border border-border shadow-lg"
              />
              <button
                onClick={() => { setPhoto(null); setPreview(null) }}
                className="mt-2 text-xs text-danger hover:text-danger/80 transition-colors"
              >
                Remove photo
              </button>
            </div>
          ) : null}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {error && (
            <div className="mb-4 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-xs text-danger">
              {error}
            </div>
          )}

          {preview ? (
            <div className="flex gap-3">
              <button
                onClick={resetAll}
                className="flex-1 bg-surface border border-border hover:bg-surface-2 text-text-h font-medium rounded-xl px-4 py-3 transition-colors"
              >
                ← Retake
              </button>
              <button
                onClick={scanShelf}
                className="flex-1 bg-gradient-to-r from-accent to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl px-4 py-3 transition-opacity"
              >
                🔍 Scan Items
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 bg-gradient-to-r from-accent to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl px-4 py-3 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
                Take Photo
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 bg-surface border border-border hover:bg-surface-2 text-text-h font-medium rounded-xl px-4 py-3 transition-colors"
              >
                📁 Gallery
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-xs text-text hover:text-text-h transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        <PaywallModal
          isOpen={showPaywall}
          onClose={() => {
            setShowPaywall(false)
            navigate('/')
          }}
          feature="Shelf Scan"
        />
      </div>
    )
  }

  // --- SCANNING STEP ---
  if (step === 'scanning') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="text-center max-w-sm">
          {preview && (
            <div className="mb-8 relative">
              <img
                src={preview}
                alt="Scanning"
                className="w-full h-40 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-[#8B5CF6]/10 rounded-2xl" />
              {/* Scanning animation overlay */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="w-full h-1 bg-accent shadow-lg shadow-accent/50 animate-bounce" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-extrabold text-text-h mb-2">Scanning Shelf...</h2>
            <p className="text-text text-sm opacity-70">
              AI is identifying every item in the photo
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- REVIEW STEP ---
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-text-h">Items Found</h1>
          <span className="text-xs bg-accent/15 text-accent px-2.5 py-1 rounded-full font-bold">
            {items.length} items
          </span>
        </div>
        <p className="text-sm text-text mb-6">
          Select the items you want to list. Deselect any the AI got wrong.
        </p>

        {/* Original photo */}
        {preview && (
          <img
            src={preview}
            alt="Scanned shelf"
            className="w-full h-32 object-cover rounded-2xl border border-border mb-6 opacity-60"
          />
        )}

        {/* Item grid */}
        <div className="space-y-3 mb-6">
          {items.map((item, i) => {
            const isSelected = selectedItems.has(i)
            return (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-accent/5 border-accent/40 shadow-md shadow-accent/10'
                    : 'bg-surface border-border opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'bg-accent border-accent' : 'border-border'
                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-h text-sm truncate">{item.title || 'Unknown Item'}</h3>
                    {item.description && (
                      <p className="text-xs text-text mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {item.price && (
                        <span className="text-sm font-bold text-accent">${parseFloat(item.price).toFixed(0)}</span>
                      )}
                      {item.condition && (
                        <span className="text-[10px] font-medium bg-surface-2 text-text px-2 py-0.5 rounded-full capitalize">
                          {item.condition.replace('_', ' ')}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[10px] font-medium text-text/50">{item.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mb-4 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={resetAll}
            className="flex-1 bg-surface border border-border text-text-h font-medium rounded-xl px-4 py-3 hover:bg-surface-2 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={saveSelected}
            disabled={saving || selectedItems.size === 0}
            className="flex-1 bg-gradient-to-r from-accent to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl px-4 py-3 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>🚀 List {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
