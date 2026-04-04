// AI identification using OpenAI Vision API (GPT-4o)
// Falls back to mock data if no API key is configured

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function identifyItem(imageFiles, hint = '') {
  const images = Array.isArray(imageFiles) ? imageFiles : [imageFiles]

  // If no API key, use mock data so the app still works end-to-end
  if (!OPENAI_API_KEY) {
    console.warn('No VITE_OPENAI_API_KEY set — using mock AI response')
    await new Promise((r) => setTimeout(r, 1500)) // simulate delay
    return {
      title: 'Item from Photo' + (hint ? ` (${hint})` : ''),
      description:
        'This item was captured via SnapList. Add your OpenAI API key (VITE_OPENAI_API_KEY) to enable AI-powered identification that auto-generates titles, descriptions, pricing, and categories.',
      price: 25,
      condition: 'good',
      category: 'General',
      confidence: 0,
    }
  }

  const base64Images = await Promise.all(images.map((f) => fileToBase64(f)))

  console.log(`Identifying item with ${images.length} photos and hint:`, hint)

  const messages = [
    {
      role: 'system',
      content: `You are a marketplace listing expert. When shown one or more photos of an item, identify it and generate a complete marketplace listing. 
      Use all provided angles (front, back, tags, details) to provide the most accurate assessment. 
      Return ONLY a JSON object (no markdown, no code fences) with these fields:
- title: A compelling, SEO-friendly marketplace title (50-80 chars)
- description: Detailed marketplace description highlighting features, condition, and selling points (100-300 chars). Mention details seen in different angles if relevant.
- price: Suggested price in USD (number only, based on typical resale value)
- condition: One of "new", "like_new", "good", "fair", "poor"
- category: General category (e.g. "Electronics", "Clothing", "Home & Garden", "Sports", "Toys", "Books", "Collectibles")
- search_keywords: A optimized search string for finding similar "Sold" items on eBay (e.g. "Vintage Ferrari T-Shirt Red XL")
- confidence: How confident you are in the identification (0.0 to 1.0)`,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: hint
            ? `Identify this item knowing it is "${hint}". The user has provided ${images.length} photos from different angles. Generate a marketplace listing for it, pricing it accurately for the current market.`
            : `Identify this item. The user has provided ${images.length} photos from different angles. Generate a marketplace listing for it.`,
        },
        ...base64Images.map((b64) => ({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${b64}`,
          },
        })),
      ],
    },
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  try {
    // Try to parse JSON directly
    const parsed = JSON.parse(content)
    return parsed
  } catch {
    // If it's wrapped in code fences, extract
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    throw new Error('Failed to parse AI response')
  }
}
