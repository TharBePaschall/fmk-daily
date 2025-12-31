import { supabase } from './supabase'

// Check if user has played today (checks server first, falls back to localStorage)
export async function hasPlayedToday(deviceId) {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('id')
      .eq('device_id', deviceId)
      .eq('date', today)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking play status:', error)
      return hasPlayedTodayLocal()
    }
    
    return !!data
  } catch (err) {
    console.error('Error checking play status:', err)
    return hasPlayedTodayLocal()
  }
}

// Get today's submission for a device
export async function getSubmission(deviceId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('date', targetDate)
      .single()
    
    if (error) {
      console.error('Error getting submission:', error)
      return getSubmissionLocal(targetDate)
    }
    
    // Transform database format to app format
    return {
      date: data.date,
      deviceId: data.device_id,
      F: { id: data.f_personality_id, name: data.f_personality_name },
      M: { id: data.m_personality_id, name: data.m_personality_name },
      K: { id: data.k_personality_id, name: data.k_personality_name },
      shareCode: data.share_code,
      submittedAt: data.created_at
    }
  } catch (err) {
    console.error('Error getting submission:', err)
    return getSubmissionLocal(targetDate)
  }
}

// Get submission by share code (for viewing friend's results)
export async function getSubmissionByShareCode(shareCode) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('share_code', shareCode)
      .single()
    
    if (error) {
      console.error('Error getting shared submission:', error)
      return null
    }
    
    return {
      date: data.date,
      F: { id: data.f_personality_id, name: data.f_personality_name },
      M: { id: data.m_personality_id, name: data.m_personality_name },
      K: { id: data.k_personality_id, name: data.k_personality_name },
      shareCode: data.share_code,
      submittedAt: data.created_at
    }
  } catch (err) {
    console.error('Error getting shared submission:', err)
    return null
  }
}

// Save submission to server and localStorage
export async function saveSubmission(submission) {
  // Save to localStorage as backup
  saveSubmissionLocal(submission)
  
  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        device_id: submission.deviceId,
        date: submission.date,
        f_personality_id: submission.F.id,
        f_personality_name: submission.F.name,
        m_personality_id: submission.M.id,
        m_personality_name: submission.M.name,
        k_personality_id: submission.K.id,
        k_personality_name: submission.K.name,
        share_code: submission.shareCode
      })
      .select()
      .single()
    
    if (error) {
      // If duplicate entry error, user already played
      if (error.code === '23505') {
        console.log('User already submitted today')
        return { alreadyPlayed: true }
      }
      console.error('Error saving submission:', error)
      return { error: error.message }
    }
    
    return { success: true, data }
  } catch (err) {
    console.error('Error saving submission:', err)
    return { error: err.message }
  }
}

// localStorage fallback functions
const STORAGE_KEY = 'fmk_submissions'

function hasPlayedTodayLocal() {
  const today = new Date().toISOString().split('T')[0]
  const submissions = getSubmissionsLocal()
  return submissions.some(s => s.date === today)
}

function getSubmissionLocal(date) {
  const targetDate = date || new Date().toISOString().split('T')[0]
  const submissions = getSubmissionsLocal()
  return submissions.find(s => s.date === targetDate) || null
}

function getSubmissionsLocal() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function saveSubmissionLocal(submission) {
  const submissions = getSubmissionsLocal()
  const filtered = submissions.filter(s => s.date !== submission.date)
  filtered.push(submission)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}