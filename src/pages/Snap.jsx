import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { identifyItem } from '../lib/ai'
import { PLATFORMS, getConnections, crossPost } from '../lib/platforms'
import { copyForPlatform } from '../lib/clipboardFormatter'

export default function Snap() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fileRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [step, setStep] = useState('capture') // capture | camera | analyzing | editor
  const [aiData, setAiData] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [loadingComps, setLoadingComps] = useState(false)
  const [marketError, setMarketError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    category: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [aiHint, setAiHint] = useState('')
  const [connections, setConnections] = useState({})
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [clipboardToast, setClipboardToast] = useState(null)
  const [copiedPlatform, setCopiedPlatform] = useState(null)

  // Load connected platforms
  useEffect(() => {
    if (user) {
      getConnections(user.id).then((conns) => {
        setConnections(conns)
        // Auto-select all connected platforms
        setSelectedPlatforms(Object.keys(conns).filter((k) => conns[k].status === 'active'))
      })
    }
  }, [user])

  // Check for imported listing from ClipboardImport
  useEffect(() => {
    const imported = location.state?.importedListing
    if (imported) {
      setAiData(imported)
      setForm({
        title: imported.title || '',
        description: imported.description || '',
        price: imported.price?.toString() || '',
        condition: imported.condition || 'good',
        category: imported.category || '',
      })
      setStep('editor')
      // Clear the navigation state so refresh doesn't re-import
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Stop camera stream when leaving camera mode
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // Open webcam viewfinder
  const openCamera = async () => {
    setCameraError(null)
    setStep('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions and try again.'
          : 'Could not access camera. Try using the Gallery option instead.'
      )
    }
  }

  // Capture photo from webcam
  const captureFromCamera = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `snap-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(file)
        
        setPhotos(prev => [...prev, file].slice(0, 8))
        setPreviews(prev => [...prev, previewUrl].slice(0, 8))
        
        // Brief flash effect
        const flash = document.createElement('div')
        flash.className = 'fixed inset-0 bg-white z-[100] animate-out fade-out duration-200'
        document.body.appendChild(flash)
        setTimeout(() => flash.remove(), 200)
      },
      'image/jpeg',
      0.9
    )
  }

  // Handle gallery file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 8)
    if (files.length === 0) return
    processPhotos(files)
  }

  // Process selected/captured photos through AI
  const processPhotos = async (files) => {
    setPhotos(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
    setStep('analyzing')
    setError(null)

    try {
      const result = await identifyItem(files, aiHint)
      setAiData(result)
      setForm({
        title: result.title || '',
        description: result.description || '',
        price: result.price?.toString() || '',
        condition: result.condition || 'good',
        category: result.category || '',
      })
      setStep('editor')

      // Fetch market comps asynchronously
      if (result.search_keywords) {
        setLoadingComps(true)
        setMarketError(null)
        
        supabase.functions.invoke('ebay-search', {
          body: { query: result.search_keywords }
        }).then(({ data, error }) => {
          if (error) throw error
          if (data?.error) throw new Error(data.error)
          if (data) setMarketData(data)
          setLoadingComps(false)
        }).catch(err => {
          console.warn('Edge Function unreachable, falling back to client-side mock:', err)
          
          // --- CLIENT-SIDE SAFETY NET ---
          // This allows the user to see the UI even if they haven't deployed the function yet
          const basePrice = result.price ? parseFloat(result.price) : Math.floor(Math.random() * 50) + 20
          
          // Generate a realistic spread of prices based on the AI's estimation
          const mockPrices = [
            basePrice * 0.85,
            basePrice * 1.15,
            basePrice * 0.95,
            basePrice * 1.05,
            basePrice * 0.90,
            basePrice * 1.10,
            basePrice
          ]
          
          const avg = (mockPrices.reduce((a, b) => a + b, 0) / mockPrices.length).toFixed(2)
          
          setMarketData({
            count: mockPrices.length,
            avg,
            min: Math.min(...mockPrices).toFixed(2),
            max: Math.max(...mockPrices).toFixed(2),
            items: [
              { title: `${result.search_keywords} (Sample)`, price: (basePrice * 1.05).toFixed(2), link: "#", image: null },
              { title: `Condition: Like New - ${result.search_keywords}`, price: (basePrice * 1.15).toFixed(2), link: "#", image: null },
              { title: `Used ${result.search_keywords}`, price: (basePrice * 0.85).toFixed(2), link: "#", image: null }
            ],
            is_mock: true,
            is_client_fallback: true
          })
          setLoadingComps(false)
        })
      }
    } catch (err) {
      console.error('AI identification failed:', err)
      setError('AI identification failed. You can fill in the details manually.')
      setStep('editor')
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return setError('Title is required')
    setSaving(true)
    setError(null)

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          price: form.price ? parseFloat(form.price) : null,
          condition: form.condition,
          category: form.category.trim() || null,
          status: 'active',
          ai_data: aiData,
        })
        .select()
        .single()

      if (listingError) throw listingError

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${listing.id}/${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(path, file)

        if (uploadError) {
          console.error('Photo upload error:', uploadError)
          continue
        }

        await supabase.from('listing_photos').insert({
          listing_id: listing.id,
          storage_path: path,
          display_order: i,
        })
      }

      // Cross-post to selected platforms
      if (selectedPlatforms.length > 0) {
        try {
          await crossPost(selectedPlatforms, user.id, listing.id)
        } catch (err) {
          console.error('Cross-post error:', err)
          // Don't fail the whole save — listing is already saved locally
        }
      }

      navigate('/listings')
    } catch (err) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  const movePhoto = (index, direction) => {
    const newPhotos = [...photos]
    const newPreviews = [...previews]
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= photos.length) return

    // Swap elements
    ;[newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]]
    ;[newPreviews[index], newPreviews[newPreviews.length - previews.length + targetIndex]] = [
      newPreviews[newPreviews.length - previews.length + targetIndex],
      newPreviews[index],
    ]

    setPhotos(newPhotos)
    setPreviews(newPreviews)
  }

  const resetAll = () => {
    stopCamera()
    setStep('capture')
    setPhotos([])
    setPreviews([])
    setAiData(null)
    setForm({ title: '', description: '', price: '', condition: 'good', category: '' })
    setError(null)
    setCameraError(null)
  }

  // --- CAPTURE STEP ---
  if (step === 'capture') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 mx-auto bg-accent/10 border-2 border-dashed border-accent rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-h">Snap an Item</h2>
          <p className="text-text text-sm mt-2">
            Take a photo or choose from your gallery. AI will identify it and create your listing automatically.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="w-full mb-8">
            <label className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block text-left ml-1 opacity-70">AI Context (Optional)</label>
            <input
              type="text"
              value={aiHint}
              onChange={(e) => setAiHint(e.target.value)}
              placeholder="e.g. vintage, rare, 1 of 1, like new..."
              className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-text-h placeholder:text-text/30 focus:outline-none focus:border-accent shadow-sm transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fileRef.current.click()}
              className="flex-1 bg-surface border border-border hover:bg-surface-2 text-text-h font-medium rounded-xl px-4 py-3 transition-colors"
            >
              📁 Gallery
            </button>
            <button
              onClick={openCamera}
              className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-4 py-3 transition-colors"
            >
              📸 Camera
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- CAMERA VIEWFINDER STEP ---
  if (step === 'camera') {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-black">
        {cameraError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto bg-danger/15 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-text-h font-medium">{cameraError}</p>
              <button
                onClick={resetAll}
                className="mt-4 bg-surface border border-border text-text-h font-medium rounded-xl px-6 py-3 hover:bg-surface-2 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live viewfinder */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="flex-1 object-cover w-full"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera controls overlay */}
            <div className="absolute top-6 left-0 right-0 p-4 flex justify-center pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 pointer-events-auto">
                {photos.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    {photos.length} Photos Captured
                  </span>
                ) : (
                  'Take first photo'
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pt-8 pb-12 safe-bottom">
              <div className="flex items-center justify-center gap-10 max-w-xs mx-auto">
                {/* Cancel/Back */}
                <button
                  onClick={() => {
                    if (photos.length > 0 && !window.confirm('Discard photos and exit?')) return
                    resetAll()
                  }}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Shutter button */}
                <button
                  onClick={captureFromCamera}
                  disabled={photos.length >= 8}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    photos.length >= 8 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-white border-[6px] border-white/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200" />
                  </div>
                </button>

                {/* Finish / Done */}
                <button
                  onClick={() => {
                    stopCamera()
                    processPhotos(photos)
                  }}
                  disabled={photos.length === 0}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    photos.length === 0 
                      ? 'bg-white/5 text-white/20 border border-white/10' 
                      : 'bg-accent text-white shadow-lg shadow-accent/40 animate-in zoom-in-50'
                  }`}
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // --- ANALYZING STEP ---
  if (step === 'analyzing') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="text-center max-w-sm">
          <div className="flex justify-center -space-x-8 mb-12">
            {previews.slice(0, 3).map((src, i) => (
              <div 
                key={i} 
                className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-surface shadow-2xl relative"
                style={{ 
                  transform: `rotate(${(i - 1) * 10}deg) translateY(${Math.abs(i - 1) * 8}px)`, 
                  zIndex: previews.length - i 
                }}
              >
                <img src={src} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-extrabold text-text-h mb-2">Analyzing Photos...</h2>
            <p className="text-text text-sm mb-8 opacity-70">
              Processing {photos.length} angle{photos.length > 1 ? 's' : ''} to find the best market price.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- EDITOR STEP ---
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-h">Edit Listing</h1>
          {aiData && (
            <span className="text-xs bg-accent/15 text-accent px-2.5 py-1 rounded-full font-medium">
              ✨ AI Generated
            </span>
          )}
        </div>

        {/* Photo previews */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {previews.map((src, i) => (
            <div key={i} className="relative flex-shrink-0 group">
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className={`w-24 h-24 object-cover rounded-xl border-2 transition-all ${
                  i === 0 ? 'border-accent shadow-lg scale-100' : 'border-border'
                }`}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                <button
                  onClick={() => movePhoto(i, -1)}
                  disabled={i === 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                    i === 0 ? 'text-white/20' : 'text-white hover:bg-white/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => movePhoto(i, 1)}
                  disabled={i === previews.length - 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                    i === previews.length - 1 ? 'text-white/20' : 'text-white hover:bg-white/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {i === 0 && (
                <div className="absolute -top-1 -left-1 bg-accent text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-xl border border-accent/20">
                  Thumbnail
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-text hover:border-accent hover:text-accent transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files)
              setPhotos((prev) => [...prev, ...newFiles].slice(0, 8))
              setPreviews((prev) => [
                ...prev,
                ...newFiles.map((f) => URL.createObjectURL(f)),
              ].slice(0, 8))
            }}
          />
        </div>

        {/* Market Comps Card */}
        {aiData?.search_keywords && (
          <div className="bg-surface-2/50 border border-border rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-sm font-bold text-text-h uppercase tracking-wider">Market Analysis</h3>
                {marketData?.is_mock && (
                  <span className="text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold uppercase border border-warning/20">Sample Data</span>
                )}
              </div>
              {loadingComps && (
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {marketError ? (
              <div className="py-4 text-center">
                <div className="text-[10px] text-danger font-bold uppercase tracking-widest mb-2">Comps Unavailable</div>
                <p className="text-xs text-text opacity-70 mb-4">{marketError}</p>
                <button 
                  onClick={() => {
                    setMarketError(null)
                    setLoadingComps(true)
                    supabase.functions.invoke('ebay-search', { body: { query: aiData.search_keywords } })
                      .then(({data}) => data && setMarketData(data))
                      .finally(() => setLoadingComps(false))
                  }}
                  className="text-[10px] font-bold text-accent uppercase underline underline-offset-4"
                >
                  Try Again
                </button>
              </div>
            ) : marketData ? (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3 border-b border-border/50 pb-5">
                  <div className="text-center">
                    <div className="text-[10px] text-text uppercase tracking-tight opacity-60">Avg Price</div>
                    <div className="text-lg font-black text-accent">${marketData.avg}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-text uppercase tracking-tight opacity-60">Market Low</div>
                    <div className="text-lg font-bold text-text-h opacity-40">${marketData.min}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-text uppercase tracking-tight opacity-60">Market High</div>
                    <div className="text-lg font-bold text-text-h">${marketData.max}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-text uppercase tracking-widest mb-3 opacity-60">Similar Listings</div>
                  <div className="space-y-3">
                    {marketData.items.map((item, idx) => (
                      <a 
                        key={idx} 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 p-2 bg-surface hover:bg-surface-2 rounded-xl border border-border/30 transition-all group"
                      >
                        {item.image ? (
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-border/20 rounded-lg flex items-center justify-center text-xs text-text/30">?</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-text-h truncate group-hover:text-accent transition-colors">{item.title}</div>
                          <div className="text-[10px] font-bold text-accent">${item.price}</div>
                        </div>
                        <span className="text-text/20 group-hover:text-accent transition-colors">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : loadingComps ? (
              <div className="text-xs text-text italic text-center py-6 animate-pulse opacity-50">
                Searching market data for "{aiData.search_keywords}"...
              </div>
            ) : (
              <div className="text-xs text-text italic text-center py-4 opacity-40">
                No market data available for this search.
              </div>
            )}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text font-medium uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What are you selling?"
              className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-text font-medium uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the item..."
              rows={4}
              className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text font-medium uppercase tracking-wide">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors"
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
              placeholder="e.g. Electronics, Clothing, Home"
              className="w-full mt-1 bg-surface border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm mt-4">{error}</p>
        )}

        {/* Clipboard Toast */}
        {clipboardToast && (
          <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom duration-300">
            <div className="bg-success/90 backdrop-blur-md text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {clipboardToast}
            </div>
          </div>
        )}

        {/* Copy for Platform (clipboard-only platforms) */}
        <div className="mt-6">
          <label className="text-xs text-text font-medium uppercase tracking-wide">Copy for Platform</label>
          <p className="text-[10px] text-text/50 mt-0.5 mb-3">One tap to copy your listing, then paste it in the app</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PLATFORMS)
              .filter(([, p]) => p.clipboardOnly && p.available)
              .map(([key, platform]) => {
                const isCopied = copiedPlatform === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={async () => {
                      const listing = {
                        title: form.title,
                        description: form.description,
                        price: form.price,
                        condition: form.condition,
                        category: form.category,
                        brand: aiData?.brand || null,
                        size: aiData?.size || null,
                      }
                      const success = await copyForPlatform(key, listing)
                      if (success) {
                        setCopiedPlatform(key)
                        setClipboardToast(`Copied for ${platform.name}! Open the app and paste.`)
                        setTimeout(() => {
                          setClipboardToast(null)
                          setCopiedPlatform(null)
                        }, 3500)
                      }
                    }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                      isCopied
                        ? 'bg-success/10 border-success/40 text-success'
                        : 'bg-surface border-border text-text-h hover:border-accent/40'
                    }`}
                  >
                    <span className="text-base">{platform.icon}</span>
                    <span className="flex-1 text-left truncate">
                      {isCopied ? '✓ Copied!' : platform.name}
                    </span>
                    {!isCopied && (
                      <svg className="w-4 h-4 text-text/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                      </svg>
                    )}
                  </button>
                )
              })}
          </div>

          {/* Deep link to open app */}
          {copiedPlatform && PLATFORMS[copiedPlatform]?.deepLink && (
            <a
              href={PLATFORMS[copiedPlatform].deepLink}
              className="block mt-3 text-center text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              Open {PLATFORMS[copiedPlatform].name} →
            </a>
          )}
        </div>

        {/* API Platform toggles (connected platforms) */}
        {Object.keys(connections).length > 0 && (
          <div className="mt-5">
            <label className="text-xs text-text font-medium uppercase tracking-wide">Direct Post</label>
            <p className="text-[10px] text-text/50 mt-0.5 mb-3">Auto-post to connected platforms</p>
            <div className="space-y-2">
              {Object.entries(PLATFORMS)
                .filter(([, p]) => !p.clipboardOnly)
                .map(([key, platform]) => {
                const isConnected = connections[key]?.status === 'active'
                if (!isConnected) return null

                const isSelected = selectedPlatforms.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPlatforms((prev) =>
                        isSelected ? prev.filter((p) => p !== key) : [...prev, key]
                      )
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-accent/10 border-accent/40 text-text-h'
                        : 'bg-surface border-border text-text hover:text-text-h'
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="flex-1 text-left text-sm font-medium">{platform.name}</span>
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-accent border-accent' : 'border-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6 pb-6">
          <button
            onClick={resetAll}
            className="flex-1 bg-surface border border-border text-text-h font-medium rounded-xl px-4 py-3 hover:bg-surface-2 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : '🚀 Post Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}
