import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    if (!query) throw new Error('Query is required')

    const EBAY_CLIENT_ID = Deno.env.get('EBAY_CLIENT_ID')
    const EBAY_CLIENT_SECRET = Deno.env.get('EBAY_CLIENT_SECRET')
    const EBAY_ENV = Deno.env.get('EBAY_SANDBOX') === 'true' ? 'sandbox' : 'production'

    // --- MOCK FALLBACK ---
    if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
      console.warn('eBay credentials not set — returning mock market data')
      await new Promise(r => setTimeout(r, 800)) // simulate network delay
      
      const charCodeSum = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const basePrice = (charCodeSum % 150) + 15; // Random-ish price between 15 and 164 based on the query string
      
      const mockPrices = [
        basePrice * 0.9,
        basePrice * 1.1,
        basePrice * 1.05,
        basePrice * 0.85,
        basePrice * 0.95,
      ]
      const avg = (mockPrices.reduce((a, b) => a + b, 0) / mockPrices.length).toFixed(2)
      
      return new Response(JSON.stringify({
        count: mockPrices.length,
        avg,
        min: Math.min(...mockPrices).toFixed(2),
        max: Math.max(...mockPrices).toFixed(2),
        items: [
          { title: `${query} (Sample Result)`, price: (basePrice * 1.05).toFixed(2), link: "#", image: null },
          { title: `Rare ${query}`, price: (basePrice * 1.1).toFixed(2), link: "#", image: null },
          { title: `${query} (Used)`, price: (basePrice * 0.9).toFixed(2), link: "#", image: null }
        ],
        is_mock: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Get Client Credentials Token (Application Token)
    const auth = btoa(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)
    const tokenRes = await fetch(
      EBAY_ENV === 'sandbox' 
        ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        : 'https://api.ebay.com/identity/v1/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://api.ebay.com/oauth/api_scope',
        }),
      }
    )

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(`Token error: ${tokenData.error_description}`)

    const accessToken = tokenData.access_token

    // 2. Search eBay Browse API
    const searchUrl = new URL(
      EBAY_ENV === 'sandbox'
        ? 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search'
        : 'https://api.ebay.com/buy/browse/v1/item_summary/search'
    )
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('limit', '10')

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    const searchData = await searchRes.json()
    if (!searchRes.ok) throw new Error(`Search error: ${searchData.errors?.[0]?.message || 'Unknown error'}`)

    const items = searchData.itemSummaries || []
    
    // 3. Calculate Stats
    const prices = items.map(i => parseFloat(i.price?.value)).filter(p => !isNaN(p))
    const stats = {
      count: items.length,
      avg: prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
      min: prices.length ? Math.min(...prices).toFixed(2) : 0,
      max: prices.length ? Math.max(...prices).toFixed(2) : 0,
      items: items.slice(0, 5).map(i => ({
        title: i.title,
        price: i.price?.value,
        image: i.image?.imageUrl,
        link: i.itemWebUrl
      }))
    }

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('eBay Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
