// Supabase Edge Function: eBay Listing Creation
// Creates a listing on eBay via the Inventory API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EBAY_SANDBOX = Deno.env.get('EBAY_SANDBOX') === 'true'
const EBAY_API_URL = EBAY_SANDBOX
  ? 'https://api.sandbox.ebay.com'
  : 'https://api.ebay.com'

// Basic category mapping from SnapList categories to eBay category IDs
const CATEGORY_MAP: Record<string, string> = {
  electronics: '293',       // Electronics
  clothing: '11450',        // Clothing, Shoes & Accessories
  'home & garden': '11700', // Home & Garden
  sports: '888',            // Sporting Goods
  toys: '220',              // Toys & Hobbies
  books: '267',             // Books
  collectibles: '1',        // Collectibles
  other: '99',              // Everything Else
}

const CONDITION_MAP: Record<string, string> = {
  new: 'NEW',
  like_new: 'LIKE_NEW',
  good: 'GOOD',
  fair: 'ACCEPTABLE',
  poor: 'FOR_PARTS_OR_NOT_WORKING',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, listingId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get eBay connection
    const { data: connection } = await supabase
      .from('platform_connections')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'ebay')
      .eq('status', 'active')
      .single()

    if (!connection) {
      return new Response(JSON.stringify({ error: 'eBay not connected' }), {
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

    const ebayHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${connection.access_token}`,
      'Content-Language': 'en-US',
    }

    // Get photo URLs from Supabase Storage
    const photoUrls = (listing.listing_photos || [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((p: any) => {
        const { data } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(p.storage_path)
        return data.publicUrl
      })

    const sku = `snaplist-${listingId}`
    const categoryId = CATEGORY_MAP[(listing.category || 'other').toLowerCase()] || CATEGORY_MAP.other
    const condition = CONDITION_MAP[listing.condition || 'good'] || 'GOOD'

    // Step 1: Create or update inventory item
    const inventoryRes = await fetch(`${EBAY_API_URL}/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      headers: ebayHeaders,
      body: JSON.stringify({
        product: {
          title: listing.title,
          description: listing.description || '',
          imageUrls: photoUrls,
        },
        condition,
        availability: {
          shipToLocationAvailability: {
            quantity: 1,
          },
        },
      }),
    })

    if (!inventoryRes.ok && inventoryRes.status !== 204) {
      const err = await inventoryRes.text()
      return new Response(JSON.stringify({ error: 'Failed to create inventory item', details: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 2: Create offer
    const offerRes = await fetch(`${EBAY_API_URL}/sell/inventory/v1/offer`, {
      method: 'POST',
      headers: ebayHeaders,
      body: JSON.stringify({
        sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        listingDescription: listing.description || '',
        availableQuantity: 1,
        categoryId,
        pricingSummary: {
          price: {
            value: listing.price?.toString() || '0',
            currency: 'USD',
          },
        },
        listingPolicies: {
          // These need to be set up in the seller's eBay account
          // Will be populated with the user's default policies
        },
      }),
    })

    let offerId
    if (offerRes.ok) {
      const offerData = await offerRes.json()
      offerId = offerData.offerId
    } else {
      const err = await offerRes.text()
      return new Response(JSON.stringify({ error: 'Failed to create offer', details: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 3: Publish offer
    const publishRes = await fetch(`${EBAY_API_URL}/sell/inventory/v1/offer/${offerId}/publish`, {
      method: 'POST',
      headers: ebayHeaders,
    })

    let ebayListingId = null
    let ebayUrl = null

    if (publishRes.ok) {
      const publishData = await publishRes.json()
      ebayListingId = publishData.listingId
      ebayUrl = `https://www.ebay.com/itm/${ebayListingId}`
    } else {
      const err = await publishRes.text()
      // Save as pending instead of failing entirely
      await supabase.from('platform_listings').insert({
        listing_id: listingId,
        platform: 'ebay',
        status: 'error',
        error_message: err,
        platform_data: { sku, offerId },
      })

      return new Response(JSON.stringify({ error: 'Failed to publish listing', details: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save to platform_listings
    await supabase.from('platform_listings').insert({
      listing_id: listingId,
      platform: 'ebay',
      platform_listing_id: ebayListingId,
      platform_url: ebayUrl,
      status: 'active',
      platform_data: { sku, offerId },
    })

    return new Response(JSON.stringify({
      success: true,
      ebayListingId,
      ebayUrl,
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
