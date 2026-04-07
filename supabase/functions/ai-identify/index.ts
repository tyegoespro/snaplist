// Supabase Edge Function: AI Item Identification + Text Parsing
// Keeps the OpenAI API key server-side for security
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IDENTIFICATION_PROMPT = `You are a professional resale product identification expert. Every item shown to you needs to be analyzed through a resale lens, not just described visually. Your job is product identification and listing optimization.

For every item, analyze and return ONLY a JSON object (no markdown, no code fences) with these fields:
- title: A keyword-optimized listing title for eBay/Poshmark/Mercari. Front-load brand name, include collection, style, color, and material. Example: "Dooney & Bourke Signature Jacquard Flap Shoulder Bag Brown Tan Leather Solid Brass". Every word should be something a buyer would search for. (50-100 chars)
- description: Detailed resale description covering brand, collection/line, style/silhouette, model, colorway, materials, hardware, lining, era/age, and condition notes. Mention patina, wear, stains, scuffs, hardware tarnish, or missing elements if visible. (150-400 chars)
- price: Suggested resale price in USD (number only) based on what similar items actually sell for on resale platforms
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: Specific resale category (e.g. "Designer Handbags", "Vintage Clothing", "Sneakers", "Electronics", "Home & Garden", "Books", "Collectibles")
- brand: Brand name identified from logos, monograms, stamps, tags, labels, hardware engravings, stitching patterns, print patterns, font styles, or brand-specific design language. If you recognize the pattern/design but can't see a logo, still name the brand. Never return null if you can make an educated guess.
- collection: Collection, line, or series name if recognizable (e.g. "Signature Jacquard", "Pebble Grain", "Florentine"), or null
- style: Marketplace-accurate style term (hobo, satchel, crossbody, tote, messenger, clutch, shoulder bag, bucket bag, flap bag, sneaker, boot, polo, etc.), or null
- model: Model name or number if identifiable from tags/stamps/known catalogs, or null
- color: Resale-standard color names including trim, hardware, and lining colors (e.g. "Brown/Tan with Gold-tone Hardware"), or null
- materials: Specific materials — leather type (vachetta, pebble grain, saffiano), fabric (jacquard, canvas, nylon), hardware finish (solid brass, nickel, gold-tone), lining material, or null
- era: Approximate era/age based on construction, hardware, design cues, label style, tag format, or null
- size: Size if applicable, or null
- search_keywords: An optimized search string for finding similar "Sold" items on eBay (e.g. "Dooney Bourke Signature Jacquard Shoulder Bag Brown Leather")
- confidence: How confident you are in the identification (0.0 to 1.0)
- auth_notes: If the item appears counterfeit or suspicious, explain why. Otherwise null.
- photo_tips: If you cannot fully identify the brand/item, tell the user exactly what photo to take next (tag location, serial number, stamp, label) so you can ID it. Otherwise null.

Rules:
- Never just describe what you see. Always attempt to identify the product.
- Think like a reseller at a thrift store flipping an item over looking for a label.
- Prioritize searchability — every word in the title should be something a buyer would type.
- If counterfeit or suspicious, flag it in auth_notes.`

const TEXT_PARSE_PROMPT = `You are a resale listing data extractor. Given raw text (pasted from a marketplace listing, a screenshot OCR, or user notes), extract structured listing fields optimized for resale.
Return ONLY a JSON object (no code fences) with:
- title: string (keyword-optimized resale title, front-load brand name)
- description: string (detailed resale description)
- price: number (USD, based on resale value)
- condition: one of "new", "like_new", "good", "fair", "poor"
- category: string (specific resale category)
- brand: string or null
- collection: string or null (product line/collection name)
- style: string or null (marketplace-accurate style term)
- model: string or null
- color: string or null
- materials: string or null
- size: string or null
- search_keywords: optimized eBay search string
If a field can't be determined, use null.`

const SHELF_SCAN_PROMPT = `You are a professional resale product identification expert. You are shown a photo of a shelf, table, closet, or pile containing MULTIPLE items for sale.
Identify EVERY distinct sellable item visible in the photo. For each item, analyze through a resale lens — identify brands, collections, materials, and generate keyword-optimized listings.

Return ONLY a JSON array (no markdown, no code fences) where each element has:
- title: Keyword-optimized listing title. Front-load brand, include style, color, material. Every word should be searchable. (50-100 chars)
- description: Brief resale description covering brand, materials, condition (50-200 chars)
- price: Suggested resale price in USD (number only)
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: Specific resale category
- brand: Brand name — identify from logos, patterns, design language, tags. Still name the brand even without a visible logo if you recognize the design.
- search_keywords: Optimized eBay search string
- confidence: How confident you are (0.0 to 1.0)

Rules:
- Never just describe what you see. Always attempt to identify every product.
- Think like a reseller scanning a shelf for valuable items.
- Prioritize searchability in titles.
- Be thorough — identify every distinct item, even partially visible ones. Return at least 2 items.`

function parseAIResponse(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    throw new Error('Failed to parse AI response')
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { images, hint, mode, text } = body
    // Support legacy single-image format
    const imageBase64 = body.imageBase64

    console.log('ai-identify called:', { mode: mode || 'default', imageCount: (images || []).length || (imageBase64 ? 1 : 0), hasText: !!text })

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let messages: any[]

    if (mode === 'text-parse') {
      // Text parsing mode (for ClipboardImport)
      if (!text) {
        return new Response(JSON.stringify({ error: 'text is required for text-parse mode' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      messages = [
        { role: 'system', content: TEXT_PARSE_PROMPT },
        { role: 'user', content: `Extract listing data from this text:\n\n${text}` },
      ]
    } else if (mode === 'shelf-scan') {
      // Shelf scan mode — detect multiple items in one photo
      const imageList = images || (imageBase64 ? [imageBase64] : [])

      if (imageList.length === 0) {
        return new Response(JSON.stringify({ error: 'At least one image is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const userHint = hint ? ` The user wants you to focus on: "${hint}".` : ''

      messages = [
        { role: 'system', content: SHELF_SCAN_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Look at this photo carefully. Identify EVERY sellable item visible and generate a listing for each one. Return a JSON array.${userHint}` },
            ...imageList.map((b64: string) => ({
              type: 'image_url',
              image_url: { url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}` },
            })),
          ],
        },
      ]
    } else {
      // Image identification mode
      const imageList = images || (imageBase64 ? [imageBase64] : [])

      if (imageList.length === 0) {
        return new Response(JSON.stringify({ error: 'At least one image is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const userText = hint
        ? `Identify this item knowing it is "${hint}". The user has provided ${imageList.length} photos from different angles. Generate a marketplace listing for it, pricing it accurately for the current market.`
        : `Identify this item. The user has provided ${imageList.length} photos from different angles. Generate a marketplace listing for it.`

      messages = [
        { role: 'system', content: IDENTIFICATION_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            ...imageList.map((b64: string) => ({
              type: 'image_url',
              image_url: { url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}` },
            })),
          ],
        },
      ]
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: mode === 'shelf-scan' ? 2000 : 800,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI API error:', response.status, err)
      return new Response(JSON.stringify({ error: `OpenAI API error: ${response.status}`, details: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    console.log('AI response received, length:', content?.length)
    const parsed = parseAIResponse(content)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error.message, error.stack)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
