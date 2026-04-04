// Supabase Edge Function: Depop Listing Creation
// SCAFFOLD — requires Depop Selling API partnership access
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEPOP_API_URL = 'https://api.depop.com/v2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, listingId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Depop connection
    const { data: connection } = await supabase
      .from('platform_connections')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'depop')
      .eq('status', 'active')
      .single()

    if (!connection) {
      return new Response(JSON.stringify({ error: 'Depop not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get listing data
    const { data: listing } = await supabase
      .from('listings')
      .select('*, listing_photos(storage_path, display_order)')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single()

    if (!listing) {
      return new Response(JSON.stringify({ error: 'Listing not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get photo URLs
    const photoUrls = (listing.listing_photos || [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((p: any) => {
        const { data } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(p.storage_path)
        return data.publicUrl
      })

    // Map condition to Depop format
    const conditionMap: Record<string, number> = {
      new: 1,           // Brand New
      like_new: 2,      // Like New
      good: 3,          // Used - Good
      fair: 4,          // Used - Fair
      poor: 5,          // Used - Poor (if supported)
    }

    // Create listing on Depop
    // NOTE: Exact endpoint and payload TBD based on Depop API docs
    const depopRes = await fetch(`${DEPOP_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.access_token}`,
      },
      body: JSON.stringify({
        description: `${listing.title}\n\n${listing.description || ''}`,
        price_amount: listing.price?.toString() || '0',
        price_currency: 'USD',
        condition: conditionMap[listing.condition || 'good'] || 3,
        pictures: photoUrls,
        // Additional fields to be mapped based on Depop API docs
      }),
    })

    if (!depopRes.ok) {
      const err = await depopRes.text()

      await supabase.from('platform_listings').insert({
        listing_id: listingId,
        platform: 'depop',
        status: 'error',
        error_message: err,
      })

      return new Response(JSON.stringify({ error: 'Failed to create Depop listing', details: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const depopData = await depopRes.json()

    await supabase.from('platform_listings').insert({
      listing_id: listingId,
      platform: 'depop',
      platform_listing_id: depopData.id?.toString(),
      platform_url: `https://www.depop.com/products/${depopData.slug || depopData.id}`,
      status: 'active',
    })

    return new Response(JSON.stringify({
      success: true,
      depopListingId: depopData.id,
      depopUrl: `https://www.depop.com/products/${depopData.slug || depopData.id}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
