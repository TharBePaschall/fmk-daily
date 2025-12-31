// Personality data - we'll move this to Supabase later
import { personalities } from '../data/personalities'

// Deterministic random number generator using date as seed
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Get today's date as a number (YYYYMMDD)
function getTodaySeed() {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '')
  return parseInt(dateString, 10)
}

// Fisher-Yates shuffle with seeded random
function seededShuffle(array, seed) {
  const shuffled = [...array]
  let currentSeed = seed
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(currentSeed++) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Get today's 3 personalities (deterministic based on date)
export function getDailyPersonalities() {
  const seed = getTodaySeed()
  const shuffled = seededShuffle(personalities, seed)
  return shuffled.slice(0, 3)
}

// Get the date string for today
export function getTodayDateString() {
  return new Date().toISOString().split('T')[0]
}