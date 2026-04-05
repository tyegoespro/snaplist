const CACHE_NAME = 'snaplist-v2'

// On install, skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// On activate, clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Network-first for HTML/navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API calls and Supabase requests
  if (url.hostname !== self.location.hostname) return

  // HTML / navigation requests → always go to network first
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request)) // Offline fallback
    )
    return
  }

  // Static assets (JS, CSS with hashes) → cache first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
      })
    )
    return
  }

  // Everything else → network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
