import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSubmissionByShareCode, hasPlayedToday, getSubmission } from '../lib/storage'
import { getDeviceId } from '../lib/deviceId'

function Share() {
  const { shareCode } = useParams()
  const navigate = useNavigate()
  const [sharedResult, setSharedResult] = useState(null)
  const [myResult, setMyResult] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const loadResults = async () => {
      const deviceId = getDeviceId()
      
      const played = await hasPlayedToday(deviceId)
      
      if (!played) {
        localStorage.setItem('pending_share_code', shareCode)
        setStatus('must-play')
        return
      }

      const shared = await getSubmissionByShareCode(shareCode)
      if (!shared) {
        setStatus('not-found')
        return
      }

      const mine = await getSubmission(deviceId)
      
      setSharedResult(shared)
      setMyResult(mine)
      setStatus('ready')
    }

    loadResults()
  }, [shareCode])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">Loading results...</div>
      </div>
    )
  }

  if (status === 'must-play') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Play First!</h1>
          <p className="text-slate-300 mb-6">
            You need to complete today&apos;s FMK before you can see your friend&apos;s choices.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white rounded-xl font-bold hover:scale-105 transition-all"
          >
            Play Now
          </button>
        </div>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Link Not Found</h1>
          <p className="text-slate-300 mb-6">
            This share link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          FMK Daily
        </h1>
        <p className="text-slate-400">Compare Results</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Their Choices</h2>
            <ResultGrid result={sharedResult} />
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Your Choices</h2>
            <ResultGrid result={myResult} />
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultGrid({ result }) {
  if (!result) return null

  return (
    <div className="grid grid-cols-3 gap-3">
      <ResultCard label="F" personality={result.F} bgColor="bg-pink-500/20" textColor="text-pink-400" />
      <ResultCard label="M" personality={result.M} bgColor="bg-amber-500/20" textColor="text-amber-400" />
      <ResultCard label="K" personality={result.K} bgColor="bg-slate-500/20" textColor="text-slate-400" />
    </div>
  )
}

function ResultCard({ label, personality, bgColor, textColor }) {
  const name = personality ? personality.name : 'Unknown'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className={bgColor + ' rounded-xl p-3'}>
      <div className={textColor + ' font-bold text-lg mb-2'}>{label}</div>
      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center mx-auto mb-2">
        <span className="text-xl font-bold text-slate-400">{initial}</span>
      </div>
      <div className="text-white text-xs">{name}</div>
    </div>
  )
}

export default Share