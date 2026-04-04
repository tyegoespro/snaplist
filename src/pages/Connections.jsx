import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { PLATFORMS, getConnections, connectPlatform, disconnectPlatform } from '../lib/platforms'

export default function Connections() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [connections, setConnections] = useState({})
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadConnections()

    // Check for OAuth callback success
    const justConnected = searchParams.get('connected')
    if (justConnected && PLATFORMS[justConnected]) {
      setToast(`✅ ${PLATFORMS[justConnected].name} connected successfully!`)
      setTimeout(() => setToast(null), 4000)
    }
  }, [])

  async function loadConnections() {
    const conns = await getConnections(user.id)
    setConnections(conns)
    setLoading(false)
  }

  async function handleConnect(platform) {
    setConnecting(platform)
    try {
      await connectPlatform(platform, user.id)
      // User will be redirected to OAuth page
    } catch (err) {
      setToast(`❌ Failed to connect ${PLATFORMS[platform].name}`)
      setTimeout(() => setToast(null), 4000)
      setConnecting(null)
    }
  }

  async function handleDisconnect(platform) {
    if (!confirm(`Disconnect ${PLATFORMS[platform].name}? Active listings on this platform won't be affected.`)) return

    const success = await disconnectPlatform(platform, user.id)
    if (success) {
      setConnections((prev) => {
        const updated = { ...prev }
        delete updated[platform]
        return updated
      })
      setToast(`${PLATFORMS[platform].name} disconnected`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-text-h">Platforms</h1>
        <p className="text-text text-sm mt-1 mb-6">
          Connect your marketplace accounts to cross-post listings everywhere.
        </p>

        {/* Toast notification */}
        {toast && (
          <div className="mb-4 bg-success/15 border border-success/30 text-success text-sm font-medium rounded-xl px-4 py-3 animate-pulse">
            {toast}
          </div>
        )}

        {/* Platform cards */}
        <div className="space-y-3">
          {Object.entries(PLATFORMS).map(([key, platform]) => {
            const connection = connections[key]
            const isConnected = connection?.status === 'active'

            return (
              <div
                key={key}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Platform icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    {platform.icon}
                  </div>

                  {/* Platform info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-h">{platform.name}</h3>
                      {isConnected && (
                        <span className="text-[10px] font-medium bg-success/15 text-success px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      )}
                      {!platform.available && !isConnected && (
                        <span className="text-[10px] font-medium bg-text/10 text-text px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text mt-0.5">{platform.description}</p>
                    {isConnected && connection.connectedAt && (
                      <p className="text-[10px] text-text/50 mt-1">
                        Connected {new Date(connection.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  <div>
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(key)}
                        className="text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : platform.available ? (
                      <button
                        onClick={() => handleConnect(key)}
                        disabled={connecting === key}
                        className="text-xs font-medium text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: platform.color }}
                      >
                        {connecting === key ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                          </span>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-xs font-medium text-text/40 bg-surface-2 px-3 py-1.5 rounded-lg cursor-not-allowed"
                      >
                        Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info section */}
        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-accent">🔗 How Cross-Posting Works</h3>
          <ol className="text-xs text-text mt-2 space-y-1 list-decimal list-inside">
            <li>Connect your marketplace accounts above</li>
            <li>Snap a photo and let AI generate your listing</li>
            <li>Toggle which platforms to post to</li>
            <li>One tap → listed everywhere</li>
          </ol>
        </div>

        {/* Connected count */}
        <p className="text-center text-xs text-text/50 mt-4">
          {Object.values(connections).filter((c) => c.status === 'active').length} of{' '}
          {Object.keys(PLATFORMS).length} platforms connected
        </p>
      </div>
    </div>
  )
}
