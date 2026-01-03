import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GameBoard from './components/GameBoard.jsx'
import ShareModal from './components/ShareModal.jsx'
import { getDailyPersonalities } from './lib/dailyGame'
import { getDeviceId } from './lib/deviceId'
import { hasPlayedToday, saveSubmission, getSubmission } from './lib/storage'
import { prefetchPersonalities } from './lib/wikipedia'

function App() {
  const [personalities, setPersonalities] = useState([])
  const [gameState, setGameState] = useState('loading')
  const [assignments, setAssignments] = useState({ F: null, M: null, K: null })
  const [showShareModal, setShowShareModal] = useState(false)
  const [todayResult, setTodayResult] = useState(null)
  const [deviceId, setDeviceId] = useState(null)

  useEffect(() => {
    const initGame = async () => {
      const id = getDeviceId()
      setDeviceId(id)
      
      const daily = getDailyPersonalities()
      
      try {
        const wikiData = await prefetchPersonalities(daily)
        
        const enriched = daily.map((p, i) => ({
          ...p,
          thumbnail: wikiData[i]?.thumbnail || null,
          bio: wikiData[i]?.bio || null,
          wikipediaUrl: wikiData[i]?.wikipediaUrl || null
        }))
        
        setPersonalities(enriched)
      } catch (error) {
        console.error('Failed to prefetch Wikipedia data:', error)
        setPersonalities(daily)
      }

      // Check server if user already played today
      const alreadyPlayed = await hasPlayedToday(id)
      
      if (alreadyPlayed) {
        const saved = await getSubmission(id)
        setTodayResult(saved)
        setGameState('completed')
      } else {
        setGameState('playing')
      }
    }
    
    initGame()
  }, [])

  const handleSubmit = async () => {
    if (!assignments.F || !assignments.M || !assignments.K) {
      alert('Please assign all three personalities!')
      return
    }

    const result = {
      date: new Date().toISOString().split('T')[0],
      deviceId: deviceId,
      F: assignments.F,
      M: assignments.M,
      K: assignments.K,
      shareCode: Math.random().toString(36).substring(2, 10),
      submittedAt: new Date().toISOString()
    }

    // Save to server
    const saveResult = await saveSubmission(result)
    
    if (saveResult.alreadyPlayed) {
      alert('You have already played today!')
      const saved = await getSubmission(deviceId)
      setTodayResult(saved)
      setGameState('completed')
      return
    }

    setTodayResult(result)
    setGameState('completed')
    setShowShareModal(true)
  }

  const allAssigned = assignments.F && assignments.M && assignments.K

  if (gameState === 'loading' || personalities.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">Loading today&apos;s personalities...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          FMK Daily
        </h1>
        <p className="text-slate-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>

      {gameState === 'playing' && (
        <>
          <GameBoard
            personalities={personalities}
            assignments={assignments}
            setAssignments={setAssignments}
          />
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={!allAssigned}
              className={
                allAssigned 
                  ? 'px-8 py-4 rounded-xl text-xl font-bold transition-all bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white hover:scale-105 cursor-pointer'
                  : 'px-8 py-4 rounded-xl text-xl font-bold transition-all bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            >
              Submit Choices
            </button>
          </div>
        </>
      )}

      {gameState === 'completed' && todayResult && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Your Choices Today</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <ResultCard 
                label="F" 
                personality={todayResult.F} 
                bgColor="bg-pink-500/20" 
                textColor="text-pink-400" 
              />
              <ResultCard 
                label="M" 
                personality={todayResult.M} 
                bgColor="bg-amber-500/20" 
                textColor="text-amber-400" 
              />
              <ResultCard 
                label="K" 
                personality={todayResult.K} 
                bgColor="bg-slate-500/20" 
                textColor="text-slate-400" 
              />
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all"
            >
              Share Your Results
            </button>

            <p className="text-slate-500 mt-6">
              Come back tomorrow for a new FMK!
            </p>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          result={todayResult}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <footer className="mt-12 mb-4 text-center">
        <Link
          to="/terms"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Terms of Service
        </Link>
      </footer>
    </div>
  )
}

function ResultCard({ label, personality, bgColor, textColor }) {
  let initial = ''
  if (personality && personality.name) {
    initial = personality.name.charAt(0).toUpperCase()
  }
  
  const thumbnailUrl = personality ? personality.thumbnail : null
  const name = personality ? personality.name : 'Unknown'
  
  return (
    <div className={bgColor + ' rounded-xl p-4'}>
      <div className={textColor + ' font-bold text-lg mb-2'}>{label}</div>
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={name}
          className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center mx-auto mb-2">
          <span className="text-2xl font-bold text-slate-400">{initial}</span>
        </div>
      )}
      <div className="text-white text-sm">{name}</div>
    </div>
  )
}

export default App