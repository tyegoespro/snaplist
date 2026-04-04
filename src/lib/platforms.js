// Platform integration helpers
// Handles OAuth flows and cross-posting via Supabase Edge Functions
import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Supported platforms with their config
export const PLATFORMS = {
  ebay: {
    name: 'eBay',
    icon: '🛒',
    color: '#e53238',
    description: 'List on the world\'s largest online marketplace',
    available: true,
  },
  depop: {
    name: 'Depop',
    icon: '🔴',
    color: '#ff2300',
    description: 'Sell to Gen-Z fashion-forward buyers',
    available: false, // Until API partnership is confirmed
  },
  facebook: {
    name: 'Facebook Marketplace',
    icon: '🔵',
    color: '#1877f2',
    description: 'Reach local buyers in your area',
    available: false, // User handling Meta bridge
  },
}

// Get user's connected platforms from Supabase
export async function getConnections(userId) {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('platform, status, connected_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch connections:', error)
    return {}
  }

  const connections = {}
  for (const conn of data || []) {
    connections[conn.platform] = {
      status: conn.status,
      connectedAt: conn.connected_at,
    }
  }
  return connections
}

// Start OAuth login flow for a platform
export async function connectPlatform(platform, userId) {
  const functionName = `${platform}-auth`

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: {},
    method: 'GET',
    headers: {},
  })

  // For the OAuth flow, we need to construct the URL manually
  // since Edge Functions called via invoke don't support redirects well
  const url = `${SUPABASE_URL}/functions/v1/${functionName}?action=login&state=${userId}`

  // Redirect user to OAuth consent page
  window.location.href = url
}

// Disconnect a platform
export async function disconnectPlatform(platform, userId) {
  const functionName = `${platform}-auth`

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: { userId },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  // Also handle via query param
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}?action=disconnect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ userId }),
  })

  return res.ok
}

// Cross-post a listing to a platform
export async function postToPlatform(platform, userId, listingId) {
  const functionName = `${platform}-listing`

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ userId, listingId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to post to ${platform}`)
  }

  return res.json()
}

// Get platform listing statuses for a listing
export async function getPlatformListings(listingId) {
  const { data, error } = await supabase
    .from('platform_listings')
    .select('*')
    .eq('listing_id', listingId)

  if (error) {
    console.error('Failed to fetch platform listings:', error)
    return []
  }

  return data || []
}

// Cross-post to multiple platforms at once
export async function crossPost(platforms, userId, listingId) {
  const results = {}

  for (const platform of platforms) {
    try {
      const result = await postToPlatform(platform, userId, listingId)
      results[platform] = { success: true, ...result }
    } catch (err) {
      results[platform] = { success: false, error: err.message }
    }
  }

  return results
}
