import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setDisplayName(data.display_name || '')
    }
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const planBadge = {
    free: { label: 'Free', color: 'bg-text/15 text-text' },
    pro: { label: 'Pro', color: 'bg-accent/15 text-accent' },
    seller: { label: 'Seller', color: 'bg-success/15 text-success' },
  }

  const badge = planBadge[profile?.plan] || planBadge.free

  return (
    <div className="flex-1 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-text-h">Settings</h1>

        {/* Profile card */}
        <div className="mt-6 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xl font-bold text-accent">
                {(displayName || user?.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-h font-semibold truncate">
                {displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-text text-sm truncate">{user?.email}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${badge.color}`}>
                {badge.label} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="mt-4 bg-surface border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-h uppercase tracking-wide">
            Edit Profile
          </h2>
          <div>
            <label className="text-xs text-text font-medium">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full mt-1 bg-bg border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* App info */}
        <div className="mt-4 bg-surface border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-h uppercase tracking-wide">
            About
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-text">Version</span>
            <span className="text-text-h">1.0.0 MVP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text">Listings this month</span>
            <span className="text-text-h">{profile?.listings_this_month ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text">Member since</span>
            <span className="text-text-h">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="mt-4 w-full text-danger border border-danger/30 hover:bg-danger/10 font-medium rounded-xl px-4 py-3 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
