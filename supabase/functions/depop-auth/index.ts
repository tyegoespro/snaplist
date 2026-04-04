// Supabase Edge Function: Depop OAuth 2.0
// SCAFFOLD — requires Depop Selling API partnership access
// Contact business@depop.com for API credentials
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEPOP_CLIENT_ID = Deno.env.get('DEPOP_CLIENT_ID') || ''
const DEPOP_CLIENT_SECRET = Deno.env.get('DEPOP_CLIENT_SECRET') || ''
const DEPOP_REDIRECT_URI = Deno.env.get('DEPOP_REDIRECT_URI') || ''

// Depop OAuth URLs (to be confirmed with Depop partnership team)
const DEPOP_AUTH_URL = 'https://www.depop.com/oauth/authorize'
const DEPOP_TOKEN_URL = 'https://www.depop.com/oauth/token'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // Check if Depop is configured
  if (!DEPOP_CLIENT_ID) {
    return new Response(JSON.stringify({
      error: 'Depop API not configured',
      message: 'Depop Selling API access requires a partnership. Contact business@depop.com',
    }), {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    if (action === 'login') {
      const state = url.searchParams.get('state') || ''
      const authUrl = `${DEPOP_AUTH_URL}?` + new URLSearchParams({
        client_id: DEPOP_CLIENT_ID,
        response_type: 'code',
        redirect_uri: DEPOP_REDIRECT_URI,
        state,
      }).toString()

      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'callback') {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')

      if (!code) {
        return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tokenRes = await fetch(DEPOP_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: DEPOP_CLIENT_ID,
          client_secret: DEPOP_CLIENT_SECRET,
          redirect_uri: DEPOP_REDIRECT_URI,
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

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('platform_connections')
        .upsert({
          user_id: state,
          platform: 'depop',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          status: 'active',
          connected_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' })

      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
      return Response.redirect(`${appUrl}/connections?connected=depop`, 302)
    }

    if (action === 'disconnect') {
      const { userId } = await req.json()

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('platform_connections')
        .delete()
        .eq('user_id', userId)
        .eq('platform', 'depop')

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
