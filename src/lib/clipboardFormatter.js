// Clipboard formatter for platforms without direct API integration
// Formats listing data into platform-specific text for copy/paste

const CONDITION_MAP = {
  new: 'New with tags',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const MERCARI_CONDITION_MAP = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

// Platform-specific character limits and formatting rules
const PLATFORM_SPECS = {
  mercari: {
    titleMax: 40,
    descriptionMax: 1000,
  },
  grailed: {
    titleMax: 60,
    descriptionMax: 5000,
  },
  poshmark: {
    titleMax: 80,
    descriptionMax: 1500,
  },
  depop: {
    titleMax: 50,
    descriptionMax: 1000,
  },
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

// Format listing for Mercari
function formatMercari(listing) {
  const specs = PLATFORM_SPECS.mercari
  const title = truncate(listing.title, specs.titleMax)
  const condition = MERCARI_CONDITION_MAP[listing.condition] || 'Good'
  const price = listing.price ? `$${parseFloat(listing.price).toFixed(0)}` : ''

  return [
    title,
    '',
    listing.description || '',
    '',
    `Condition: ${condition}`,
    price ? `Price: ${price}` : '',
    listing.category ? `Category: ${listing.category}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Format listing for Grailed
function formatGrailed(listing) {
  const specs = PLATFORM_SPECS.grailed
  const title = truncate(listing.title, specs.titleMax)
  const condition = CONDITION_MAP[listing.condition] || 'Good'
  const price = listing.price ? `$${parseFloat(listing.price).toFixed(0)}` : ''

  return [
    title,
    '',
    listing.description || '',
    '',
    `Condition: ${condition}`,
    price ? `Price: ${price}` : '',
    listing.brand ? `Brand: ${listing.brand}` : '',
    listing.category ? `Category: ${listing.category}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Format listing for Poshmark
function formatPoshmark(listing) {
  const specs = PLATFORM_SPECS.poshmark
  const title = truncate(listing.title, specs.titleMax)
  const condition = CONDITION_MAP[listing.condition] || 'Good'
  const price = listing.price ? `$${parseFloat(listing.price).toFixed(0)}` : ''

  return [
    title,
    '',
    listing.description || '',
    '',
    listing.brand ? `Brand: ${listing.brand}` : '',
    listing.size ? `Size: ${listing.size}` : '',
    `Condition: ${condition}`,
    price ? `Price: ${price}` : '',
    listing.category ? `Category: ${listing.category}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Format listing for Depop
function formatDepop(listing) {
  const specs = PLATFORM_SPECS.depop
  const title = truncate(listing.title, specs.titleMax)
  const condition = CONDITION_MAP[listing.condition] || 'Good'
  const price = listing.price ? `$${parseFloat(listing.price).toFixed(0)}` : ''

  return [
    title,
    '',
    listing.description || '',
    '',
    `Condition: ${condition}`,
    price ? `Price: ${price}` : '',
    listing.brand ? `Brand: ${listing.brand}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

// Generic formatter (fallback)
function formatGeneric(listing) {
  const condition = CONDITION_MAP[listing.condition] || 'Good'
  const price = listing.price ? `$${parseFloat(listing.price).toFixed(0)}` : ''

  return [
    listing.title || '',
    '',
    listing.description || '',
    '',
    `Condition: ${condition}`,
    price ? `Price: ${price}` : '',
    listing.category ? `Category: ${listing.category}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

const FORMATTERS = {
  mercari: formatMercari,
  grailed: formatGrailed,
  poshmark: formatPoshmark,
  depop: formatDepop,
}

/**
 * Format a listing for a specific platform
 * @param {string} platform - Platform key (mercari, grailed, poshmark, depop)
 * @param {Object} listing - Listing data { title, description, price, condition, category, brand, size }
 * @returns {string} Formatted text ready for clipboard
 */
export function formatForPlatform(platform, listing) {
  const formatter = FORMATTERS[platform] || formatGeneric
  return formatter(listing)
}

/**
 * Copy formatted listing text to clipboard
 * @param {string} platform - Platform key
 * @param {Object} listing - Listing data
 * @returns {Promise<boolean>} Whether the copy succeeded
 */
export async function copyForPlatform(platform, listing) {
  const text = formatForPlatform(platform, listing)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Get platform specs (for UI display)
 */
export function getPlatformSpecs(platform) {
  return PLATFORM_SPECS[platform] || { titleMax: 80, descriptionMax: 2000 }
}

export { CONDITION_MAP, PLATFORM_SPECS }
