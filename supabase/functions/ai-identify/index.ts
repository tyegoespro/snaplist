// Supabase Edge Function: AI Item Identification + Text Parsing
// Keeps the OpenAI API key server-side for security
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IDENTIFICATION_PROMPT = `You are a marketplace listing expert. When shown one or more photos of an item, identify it and generate a complete marketplace listing. 
Use all provided angles (front, back, tags, details) to provide the most accurate assessment. 
Return ONLY a JSON object (no markdown, no code fences) with these fields:
- title: A compelling, SEO-friendly marketplace title (50-80 chars)
- description: Detailed marketplace description highlighting features, condition, and selling points (100-300 chars). Mention details seen in different angles if relevant.
- price: Suggested price in USD (number only, based on typical resale value)
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: General category (e.g. "Electronics", "Clothing", "Home & Garden", "Sports", "Toys", "Books", "Collectibles")
- search_keywords: An optimized search string for finding similar "Sold" items on eBay (e.g. "Vintage Ferrari T-Shirt Red XL")
- brand: Brand name if identifiable, or null
- size: Size if applicable (clothing, shoes), or null
- confidence: How confident you are in the identification (0.0 to 1.0)`

const TEXT_PARSE_PROMPT = `You are a listing data extractor. Given raw text (pasted from a marketplace listing, a screenshot OCR, or user notes), extract structured listing fields. 
Return ONLY a JSON object (no code fences) with:
- title: string (compelling marketplace title)
- description: string (item description)
- price: number (USD, best guess)
- condition: one of "new", "like_new", "good", "fair", "poor"
- category: string
- brand: string or null
- size: string or null
- search_keywords: optimized search string for finding similar items
If a field can't be determined, use null.`

const SHELF_SCAN_PROMPT = `You are a marketplace listing expert. You are shown a photo of a shelf, table, closet, or pile containing MULTIPLE items for sale.
Identify EVERY distinct sellable item visible in the photo. For each item, generate a complete marketplace listing.
Return ONLY a JSON array (no markdown, no code fences) where each element has:
- title: A compelling, SEO-friendly marketplace title (50-80 chars)
- description: Brief marketplace description (50-150 chars)
- price: Suggested price in USD (number only)
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: General category
- brand: Brand name if identifiable, or null
- search_keywords: Optimized search string for eBay
- confidence: How confident you are (0.0 to 1.0)
Be thorough — identify every distinct item, even partially visible ones. Return at least 2 items.`

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
