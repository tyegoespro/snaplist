// Supabase Edge Function: eBay OAuth 2.0
// Handles login redirect, callback token exchange, and token refresh
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EBAY_CLIENT_ID = Deno.env.get('EBAY_CLIENT_ID') || ''
const EBAY_CLIENT_SECRET = Deno.env.get('EBAY_CLIENT_SECRET') || ''
const EBAY_REDIRECT_URI = Deno.env.get('EBAY_REDIRECT_URI') || ''
const EBAY_SANDBOX = Deno.env.get('EBAY_SANDBOX') === 'true'

const EBAY_AUTH_URL = EBAY_SANDBOX
  ? 'https://auth.sandbox.ebay.com/oauth2/authorize'
  : 'https://auth.ebay.com/oauth2/authorize'

const EBAY_TOKEN_URL = EBAY_SANDBOX
  ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
  : 'https://api.ebay.com/identity/v1/oauth2/token'

// eBay OAuth scopes needed for listing creation
const SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
].join(' ')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    // --- LOGIN: Generate eBay OAuth URL and redirect ---
    if (action === 'login') {
      const state = url.searchParams.get('state') || '' // Pass user JWT or ID for security
      const authUrl = `${EBAY_AUTH_URL}?` + new URLSearchParams({
        client_id: EBAY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: EBAY_REDIRECT_URI,
        scope: SCOPES,
        state,
      }).toString()

      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- CALLBACK: Exchange auth code for tokens ---
    if (action === 'callback') {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state') // Contains user ID

      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Exchange code for tokens
      const tokenRes = await fetch(EBAY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: EBAY_REDIRECT_URI,
        }).toString(),
      })

      if (!tokenRes.ok) {
        const err = await tokenRes.text()
        return new Response(JSON.stringify({ error: 'Token exchange failed', details: err }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tokens = await tokenRes.json()

      // Store tokens in platform_connections
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error: dbError } = await supabase
        .from('platform_connections')
        .upsert({
          user_id: state, // User ID passed via state param
          platform: 'ebay',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          status: 'active',
          connected_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' })

      if (dbError) {
        return new Response(JSON.stringify({ error: 'Failed to save connection', details: dbError }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Redirect back to the app
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
      return Response.redirect(`${appUrl}/connections?connected=ebay`, 302)
    }

    // --- REFRESH: Get new access token using refresh token ---
    if (action === 'refresh') {
      const { userId } = await req.json()

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: connection } = await supabase
        .from('platform_connections')
        .select('refresh_token')
        .eq('user_id', userId)
        .eq('platform', 'ebay')
        .single()

      if (!connection?.refresh_token) {
        return new Response(JSON.stringify({ error: 'No eBay connection found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tokenRes = await fetch(EBAY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: connection.refresh_token,
          scope: SCOPES,
        }).toString(),
      })

      const tokens = await tokenRes.json()

      await supabase
        .from('platform_connections')
        .update({
          access_token: tokens.access_token,
          ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
        })
        .eq('user_id', userId)
        .eq('platform', 'ebay')

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- DISCONNECT ---
    if (action === 'disconnect') {
      const { userId } = await req.json()

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('platform_connections')
        .delete()
        .eq('user_id', userId)
        .eq('platform', 'ebay')

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
