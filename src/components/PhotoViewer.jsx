import { useState, useEffect } from 'react'

/**
 * Photo pop-up — a centered card overlay to preview an image
 */
export default function PhotoViewer({ src, alt, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !src) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden max-w-sm w-full animate-[popIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
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

        {/* Image */}
        <img
          src={src}
          alt={alt || 'Photo preview'}
          className="w-full max-h-[70vh] object-contain bg-black/5"
        />

        {/* Caption */}
        {alt && (
          <p className="px-4 py-3 text-xs text-text truncate border-t border-border">{alt}</p>
        )}
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
 */
export function TappablePhoto({ src, alt, className, fallback }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) {
    return fallback || null
  }

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
        src={src}
        alt={alt}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
