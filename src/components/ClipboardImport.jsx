import { useState } from 'react'
import { parseListingText } from '../lib/ai'

/**
 * ClipboardImport — modal for pasting a listing URL or raw text
 * Parses via server-side Edge Function (no API key in browser)
 */
export default function ClipboardImport({ isOpen, onClose, onImport }) {
  const [input, setInput] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)
  const [source, setSource] = useState(null) // 'mercari' | 'text'

  if (!isOpen) return null

  // Detect if input looks like a Mercari URL
  function detectSource(text) {
    const trimmed = text.trim()
    if (/mercari\.com\/item|merc\.li/i.test(trimmed)) return 'mercari'
    if (/poshmark\.com/i.test(trimmed)) return 'poshmark'
    if (/depop\.com/i.test(trimmed)) return 'depop'
    if (/grailed\.com/i.test(trimmed)) return 'grailed'
    if (/ebay\.com/i.test(trimmed)) return 'ebay'
    if (/^https?:\/\//i.test(trimmed)) return 'url'
    return 'text'
  }

  async function handleParse() {
    const trimmed = input.trim()
    if (!trimmed) return

    setParsing(true)
    setError(null)

    try {
      const detectedSource = detectSource(trimmed)
      setSource(detectedSource)

      // All parsing goes through the server-side Edge Function
      const result = await parseListingText(trimmed)

      if (result) {
        onImport({
          ...result,
          importSource: detectedSource,
          importedAt: new Date().toISOString(),
        })
        setInput('')
        onClose()
      }
    } catch (err) {
      console.error('Parse error:', err)
      setError(err.message || 'Failed to parse input')
    } finally {
      setParsing(false)
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setInput(text)
    } catch {
      // Clipboard API not available or permission denied
      setError('Could not read clipboard. Please paste manually.')
    }
  }

  const detectedSource = input.trim() ? detectSource(input) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-bg border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-h">Import a Listing</h2>
            <p className="text-xs text-text mt-0.5">
              Paste a listing URL or description text
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text hover:text-text-h transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick paste button */}
        <button
          onClick={handlePasteFromClipboard}
          className="w-full mb-3 bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent font-medium rounded-xl px-4 py-3 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          Paste from Clipboard
        </button>

        {/* Text area */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Paste a Mercari URL, listing text, or item description...\n\nExamples:\n• https://www.mercari.com/us/item/...\n• Nike Air Max 90, Size 10, Like New, worn twice..."}
          rows={6}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/30 focus:outline-none focus:border-accent transition-colors resize-none text-sm"
          autoFocus
        />

        {/* Source detection badge */}
        {detectedSource && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text/50">Detected:</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              detectedSource === 'text' 
                ? 'bg-accent/10 text-accent' 
                : 'bg-success/10 text-success'
            }`}>
              {detectedSource === 'text' ? '📝 Free Text' : `🔗 ${detectedSource}`}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-surface border border-border text-text-h font-medium rounded-xl px-4 py-3 hover:bg-surface-2 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!input.trim() || parsing}
            className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {parsing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                ✨ Parse & Import
              </>
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-[10px] text-text/40 text-center mt-4">
          AI will extract title, price, condition, and description from your input
        </p>
      </div>
    </div>
  )
}
