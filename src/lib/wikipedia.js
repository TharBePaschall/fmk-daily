// Fetch Wikipedia data for a single personality
export async function getPersonalityDetails(wikipediaSlug) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaSlug)}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      bio: data.extract || 'No biography available.',
      thumbnail: data.thumbnail?.source || null,
      wikipediaUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikipediaSlug}`
    }
  } catch (error) {
    console.error(`Error fetching Wikipedia data for ${wikipediaSlug}:`, error)
    return {
      bio: 'Biography not available.',
      thumbnail: null,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${wikipediaSlug}`
    }
  }
}

// Prefetch Wikipedia data for multiple personalities
export async function prefetchPersonalities(personalities) {
  try {
    const promises = personalities.map(p => 
      getPersonalityDetails(p.wikipedia).catch(() => ({
        bio: null,
        thumbnail: null,
        wikipediaUrl: null
      }))
    )
    
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error prefetching Wikipedia data:', error)
    return personalities.map(() => ({
      bio: null,
      thumbnail: null,
      wikipediaUrl: null
    }))
  }
}

