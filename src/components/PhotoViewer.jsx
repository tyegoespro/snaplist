import { useState, useEffect, useRef } from 'react'

/**
 * Save a photo from a URL — uses Share API on iOS for "Save Image", falls back to download
 */
async function savePhotoFromUrl(src, filename = 'snaplist-photo.jpg') {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })

    // Try Web Share API first (iOS shows "Save Image")
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Save photo failed:', err)
  }
}

/**
 * Photo pop-up with swipe support for multiple images
 */
export default function PhotoViewer({ photos, initialIndex = 0, isOpen, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, initialIndex])

  if (!isOpen || !photos?.length) return null

  const current = photos[index]
  const hasMultiple = photos.length > 1

  function next() { setIndex((i) => (i + 1) % photos.length) }
  function prev() { setIndex((i) => (i - 1 + photos.length) % photos.length) }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }

  function handleTouchMove(e) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0) next()
      else prev()
    }
    touchDeltaX.current = 0
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden max-w-sm w-full animate-[popIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Nav arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={current.src}
          alt={current.alt || 'Photo preview'}
          className="w-full max-h-[70vh] object-contain bg-black/5"
        />

        {/* Bottom bar: save + dots + caption */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Save button */}
            <button
              onClick={() => savePhotoFromUrl(current.src, `snaplist-photo-${index + 1}.jpg`)}
              className="w-8 h-8 bg-surface-2 border border-border rounded-full flex items-center justify-center text-text hover:text-accent hover:border-accent transition-colors flex-shrink-0"
              title="Save photo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            {current.alt ? (
              <p className="text-xs text-text truncate">{current.alt}</p>
            ) : <span />}
          </div>
          {hasMultiple && (
            <div className="flex gap-1.5 ml-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === index ? 'bg-accent' : 'bg-text/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/**
 * Wrapper — makes any image tappable to pop up a preview
 * For single photos (backwards compatible)
 */
export function TappablePhoto({ src, alt, className, fallback }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return fallback || null

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={`${className || ''} cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      />
      <PhotoViewer
        photos={[{ src, alt }]}
        initialIndex={0}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

/**
 * Gallery — tappable photo that opens a multi-photo viewer
 * Use this when you have an array of photos
 */
export function TappableGallery({ photos, startIndex, className, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <>
      <div
        className={className || ''}
        onClick={(e) => {
          e.stopPropagation()
          setOpenIndex(startIndex || 0)
          setIsOpen(true)
        }}
      >
        {children}
      </div>
      <PhotoViewer
        photos={photos}
        initialIndex={openIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
