const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_UA = 'RouteOptimizer/1.0 (https://github.com/route-optimizer)'

export async function searchPlaces(query, limit = 5) {
  const q = (query || '').trim()
  if (!q || q.length < 2) return []
  try {
    const res = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=${limit}`,
      { headers: { 'User-Agent': NOMINATIM_UA } }
    )
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
