// AI identification via Supabase Edge Function (server-side OpenAI key)
// Falls back to mock data if the Edge Function is not deployed
import { supabase } from './supabase'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result) // Keep the data:image/... prefix
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function identifyItem(imageFiles, hint = '') {
  const images = Array.isArray(imageFiles) ? imageFiles : [imageFiles]

  // Convert files to base64 data URLs
  const base64Images = await Promise.all(images.map((f) => fileToBase64(f)))

  console.log(`Identifying item with ${images.length} photos via Edge Function`)

  try {
    const { data, error } = await supabase.functions.invoke('ai-identify', {
      body: {
        images: base64Images,
        hint: hint || undefined,
      },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)

    return data
  } catch (err) {
    console.warn('Edge Function call failed, using mock fallback:', err.message)

    // Mock fallback so the app still works without the Edge Function deployed
    await new Promise((r) => setTimeout(r, 1500))
    return {
      title: 'Item from Photo' + (hint ? ` (${hint})` : ''),
      description:
        'AI identification requires the ai-identify Edge Function to be deployed with an OPENAI_API_KEY secret. This is a placeholder listing.',
      price: 25,
      condition: 'good',
      category: 'General',
      search_keywords: hint || 'item',
      brand: null,
      size: null,
      confidence: 0,
    }
  }
}

/**
 * Parse raw text into structured listing data via Edge Function
 * Used by ClipboardImport
 */
export async function parseListingText(text) {
  const { data, error } = await supabase.functions.invoke('ai-identify', {
    body: {
      mode: 'text-parse',
      text,
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return data
}

/**
 * Refine an existing listing with user feedback
 * Sends current listing + user correction + photos to the AI for a better result
 */
export async function refineItem(currentListing, feedback, imageFiles = []) {
  let base64Images = []
  if (imageFiles.length > 0) {
    base64Images = await Promise.all(
      imageFiles.slice(0, 3).map((f) => fileToBase64(f))
    )
  }

  const { data, error } = await supabase.functions.invoke('ai-identify', {
    body: {
      mode: 'refine',
      currentListing,
      feedback,
      images: base64Images.length > 0 ? base64Images : undefined,
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return data
}
