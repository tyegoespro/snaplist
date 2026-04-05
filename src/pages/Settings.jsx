import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

// Valid promo codes that grant Pro access
const VALID_CODES = ['SNAPFAM', 'EARLYBIRD', 'BETACREW']

export default function Settings() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState(null) // 'success' | 'error' | null
  const [promoMessage, setPromoMessage] = useState('')
  const [redeeming, setRedeeming] = useState(false)

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

  async function redeemCode() {
    const code = promoCode.trim().toUpperCase()
    if (!code) return

    setRedeeming(true)
    setPromoStatus(null)

    if (profile?.plan === 'pro') {
      setPromoStatus('error')
      setPromoMessage('You already have Pro!')
      setRedeeming(false)
      return
    }

    if (VALID_CODES.includes(code)) {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro', updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (!error) {
        setPromoStatus('success')
        setPromoMessage('🎉 Welcome to Pro! Refresh to unlock all features.')
        setProfile({ ...profile, plan: 'pro' })
        setPromoCode('')
      } else {
        setPromoStatus('error')
        setPromoMessage('Something went wrong. Try again.')
      }
    } else {
      setPromoStatus('error')
      setPromoMessage('Invalid code. Check your spelling and try again.')
    }

    setRedeeming(false)
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

        {/* Promo code */}
        <div className="mt-4 bg-surface border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-h uppercase tracking-wide flex items-center gap-2">
            <span>⚡</span> Redeem Code
          </h2>
          <p className="text-xs text-text">
            Have an invite code? Enter it below to unlock Pro features.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase())
                setPromoStatus(null)
              }}
              placeholder="Enter code"
              maxLength={20}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text-h placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors uppercase tracking-widest font-mono text-center"
            />
            <button
              onClick={redeemCode}
              disabled={!promoCode.trim() || redeeming}
              className="bg-accent hover:bg-accent-hover text-white font-medium rounded-xl px-5 py-3 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {redeeming ? '...' : 'Redeem'}
            </button>
          </div>
          {promoStatus && (
            <div className={`text-xs px-3 py-2 rounded-lg ${
              promoStatus === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}>
              {promoMessage}
            </div>
          )}
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
