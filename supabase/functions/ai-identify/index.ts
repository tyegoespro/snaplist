// Supabase Edge Function: AI Item Identification + Text Parsing
// Keeps the OpenAI API key server-side for security
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IDENTIFICATION_PROMPT = `You are a professional resale product identification expert. Every item shown to you needs to be analyzed through a resale lens, not just described visually. Your job is product identification and listing optimization.

CRITICAL BRAND IDENTIFICATION RULES:
- ONLY confirm a brand if you can ACTUALLY SEE a logo, monogram, tag, label, stamp, engraving, or other branding in the photos.
- If the design LOOKS LIKE a known brand but you cannot see any branding, you MUST label it as "Unbranded" and note the similarity in the description (e.g. "Style reminiscent of Coach"). NEVER claim it IS that brand.
- Many items are inspired-by/knockoff designs made in China. If you cannot confirm branding with visible evidence, assume it is unbranded and price it at the UNBRANDED resale value, NOT the designer price.
- The brand_confirmed field must honestly reflect whether branding was visually verified.

For every item, analyze and return ONLY a JSON object (no markdown, no code fences) with these fields:
- title: A keyword-optimized listing title for eBay/Poshmark/Mercari. If brand is confirmed, front-load brand name. If unbranded, lead with style/material instead (e.g. "Brown Faux Leather Crossbody Bag Gold-tone Hardware"). (50-100 chars)
- description: Detailed resale description covering style/silhouette, colorway, materials, hardware, condition notes. If brand is unverified, say "Design is reminiscent of [Brand] but no branding is visible." (150-400 chars)
- price: Suggested resale price in USD based on what the item ACTUALLY is. If brand is unconfirmed, price as unbranded — do NOT price at the designer level.
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: Specific resale category (e.g. "Handbags & Purses", "Vintage Clothing", "Sneakers", "Electronics")
- brand: ONLY the brand name if you can visually confirm branding (logo, tag, label, stamp visible in photo). If no branding is visible, return "Unbranded".
- brand_confirmed: Boolean — true ONLY if you saw a logo/tag/label/stamp in the photo. false if you're guessing based on design similarity.
- collection: Collection or line name if confirmed, or null
- style: Marketplace-accurate style term (hobo, satchel, crossbody, tote, messenger, clutch, etc.), or null
- model: Model name/number if identifiable from visible tags/stamps, or null
- color: Resale-standard color names including trim, hardware, lining colors, or null
- materials: Specific materials — leather type, fabric type, hardware finish, or null
- era: Approximate era/age, or null
- size: Size if applicable, or null
- search_keywords: Optimized eBay search string. If unbranded, search for the style/material instead of a brand name.
- confidence: How confident you are in the overall identification (0.0 to 1.0)
- auth_notes: If the item looks like a knockoff/inspired-by design, explain what brand it resembles and why you believe it is or isn't authentic. Always flag this if design mimics a known brand but no branding is visible.
- photo_tips: If you cannot confirm the brand, tell the user exactly what photo to take (tag location, inside label, serial stamp, bottom markings) so you can verify. Otherwise null.

Rules:
- NEVER assume a brand. If in doubt, label as "Unbranded" and price accordingly.
- Think like a reseller who will get a return/complaint if the brand is wrong.
- Prioritize accuracy over optimism — a $15 unbranded bag is better than a $350 misidentified designer bag.
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

const REFINE_PROMPT = `You are a professional resale product identification expert. The user already has a listing but wants to improve it based on their feedback. They know the item better than the initial AI scan.

Take the current listing data and the user's corrections/additions, then return an IMPROVED version.
Return ONLY a JSON object (no markdown, no code fences) with the same fields as the original listing:
- title: Keyword-optimized listing title, incorporating the user's corrections
- description: Improved resale description with the user's additional details
- price: Updated resale price if the user's info changes the value
- condition, category, brand, collection, style, model, color, materials, era, size, search_keywords, confidence

Rules:
- Trust the user's corrections over the original AI assessment
- If the user says it's a specific brand, use that brand
- Update the title, description, and search_keywords to reflect the corrections
- Adjust the price if the brand/model/condition info changes the value
- Keep all fields from the original that weren't corrected`

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
    const { images, hint, mode, text, currentListing, feedback } = body
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
    } else if (mode === 'refine') {
      // Refine mode — improve an existing listing with user feedback
      if (!currentListing || !feedback) {
        return new Response(JSON.stringify({ error: 'currentListing and feedback are required for refine mode' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const imageList = images || []
      const userContent: any[] = [
        { type: 'text', text: `Current listing data:\n${JSON.stringify(currentListing, null, 2)}\n\nUser's feedback/corrections: "${feedback}"\n\nGenerate an improved listing incorporating the user's feedback.` },
      ]

      // Include photos if provided for re-analysis
      if (imageList.length > 0) {
        imageList.forEach((b64: string) => {
          userContent.push({
            type: 'image_url',
            image_url: { url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}` },
          })
        })
      }

      messages = [
        { role: 'system', content: REFINE_PROMPT },
        { role: 'user', content: userContent },
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
        max_tokens: (mode === 'shelf-scan' || mode === 'refine') ? 2000 : 800,
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
